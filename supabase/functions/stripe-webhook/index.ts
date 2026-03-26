import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

async function getCustomerEmail(stripe: Stripe, customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return (customer as Stripe.Customer).email || null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  let event: Stripe.Event;
  
  try {
    if (webhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      logStep("Webhook signature verified successfully");
    } else {
      console.warn("No webhook secret configured - processing without verification");
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  logStep("Processing event", { type: event.type });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const courseId = session.metadata?.courseId;
        const bundleId = session.metadata?.bundleId;

        logStep("Checkout session completed", { userId, courseId, bundleId, mode: session.mode });

      if (session.mode === "subscription") {
          // Handle subscription
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          const planName = determinePlanFromAmount(subscription.items.data[0].price.unit_amount || 0);
          const resolvedUserId = userId || null;
          const customerEmail = session.customer_details?.email || session.customer_email || null;
          
          if (resolvedUserId) {
            await supabase
              .from("subscriptions")
              .upsert({
                user_id: resolvedUserId,
                plan: planName,
                status: "active",
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              }, { onConflict: "user_id" });
            logStep("Subscription created", { userId: resolvedUserId, planName });
          } else if (customerEmail) {
            // Guest checkout — find user by email in profiles
            const { data: profile } = await supabase
              .from("profiles")
              .select("id")
              .eq("email", customerEmail.toLowerCase())
              .maybeSingle();
            
            if (profile) {
              await supabase
                .from("subscriptions")
                .upsert({
                  user_id: profile.id,
                  plan: planName,
                  status: "active",
                  current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                }, { onConflict: "user_id" });
              logStep("Subscription linked to existing user via email", { email: customerEmail, userId: profile.id, planName });
            } else {
              // Store pending subscription for later linking at registration
              await supabase
                .from("subscriptions")
                .insert({
                  user_id: "00000000-0000-0000-0000-000000000000",
                  plan: planName,
                  status: "pending_user",
                  current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  customer_email: customerEmail.toLowerCase(),
                });
              logStep("Pending subscription saved for guest", { email: customerEmail, planName });
            }
          } else {
            logStep("No userId or email found for subscription — skipping");
          }
        } else if (session.mode === "payment" && userId) {
          // Handle one-time payment
          if (bundleId) {
            // Bundle purchase
            logStep("Processing bundle purchase", { bundleId, userId });
            
            // Insert bundle purchase record
            const { error: bundlePurchaseError } = await supabase
              .from("bundle_purchases")
              .insert({
                user_id: userId,
                bundle_id: bundleId,
                amount: (session.amount_total || 0) / 100,
                currency: session.currency?.toUpperCase() || "GBP",
                status: "completed",
                stripe_session_id: session.id,
              });

            if (bundlePurchaseError) {
              logStep("Error inserting bundle purchase", { error: bundlePurchaseError });
            } else {
              logStep("Bundle purchase recorded", { bundleId, userId });
            }

            // Get all courses in the bundle and create individual course purchases
            const { data: bundleCourses } = await supabase
              .from("bundle_courses")
              .select("course_id")
              .eq("bundle_id", bundleId);

            if (bundleCourses && bundleCourses.length > 0) {
              const coursePurchases = bundleCourses.map(bc => ({
                user_id: userId,
                course_id: bc.course_id,
                amount: 0, // Bundle courses are marked as 0 since paid via bundle
                currency: session.currency?.toUpperCase() || "GBP",
                status: "completed",
              }));

              const { error: coursesPurchaseError } = await supabase
                .from("course_purchases")
                .insert(coursePurchases);

              if (coursesPurchaseError) {
                logStep("Error inserting course purchases from bundle", { error: coursesPurchaseError });
              } else {
                logStep("Course purchases from bundle recorded", { 
                  bundleId, 
                  coursesCount: bundleCourses.length 
                });
              }
            }
          } else if (courseId) {
            // Individual course purchase
            logStep("Processing course purchase", { courseId, userId });
            
            const { error: coursePurchaseError } = await supabase
              .from("course_purchases")
              .insert({
                user_id: userId,
                course_id: courseId,
                amount: (session.amount_total || 0) / 100,
                currency: session.currency?.toUpperCase() || "GBP",
                status: "completed",
              });

            if (coursePurchaseError) {
              logStep("Error inserting course purchase", { error: coursePurchaseError });
            } else {
              logStep("Course purchase recorded", { courseId, userId });
            }
          } else {
            // Founder Accelerator (lifetime access)
            await supabase
              .from("subscriptions")
              .upsert({
                user_id: userId,
                plan: "founder",
                status: "active",
                current_period_start: new Date().toISOString(),
                current_period_end: new Date("2099-12-31").toISOString(),
              }, { onConflict: "user_id" });
            logStep("Founder Accelerator purchased", { userId });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerEmail2 = await getCustomerEmail(stripe, subscription.customer as string);
        if (customerEmail2) {
          const { data: profile2 } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", customerEmail2.toLowerCase())
            .maybeSingle();
          if (profile2) {
            const updatedPlan = determinePlanFromAmount(subscription.items.data[0].price.unit_amount || 0);
            const updatedStatus = subscription.status === "active" ? "active" : subscription.status === "past_due" ? "past_due" : "canceled";
            await supabase
              .from("subscriptions")
              .upsert({
                user_id: profile2.id,
                plan: updatedPlan,
                status: updatedStatus,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              }, { onConflict: "user_id" });
            logStep("Subscription updated in DB", { userId: profile2.id, status: updatedStatus, plan: updatedPlan });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerEmail3 = await getCustomerEmail(stripe, subscription.customer as string);
        if (customerEmail3) {
          const { data: profile3 } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", customerEmail3.toLowerCase())
            .maybeSingle();
          if (profile3) {
            await supabase
              .from("subscriptions")
              .update({ status: "canceled" })
              .eq("user_id", profile3.id);
            logStep("Subscription canceled in DB", { userId: profile3.id });
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("Webhook processing error", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
});

function determinePlanFromAmount(amountInCents: number): string {
  if (amountInCents <= 6000) return "starter";  // Up to £60 (covers £49 and discounted prices)
  if (amountInCents <= 12000) return "pro";      // Up to £120 (covers £97 and discounted prices)
  return "founder";
}
