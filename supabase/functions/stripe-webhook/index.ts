import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

async function getCustomerEmail(customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return (customer as Stripe.Customer).email || null;
  } catch {
    return null;
  }
}

async function resolveUserId(userId: string | null | undefined, customerEmail: string | null): Promise<string | null> {
  if (userId) return userId;
  if (!customerEmail) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", customerEmail.toLowerCase())
    .maybeSingle();

  return profile?.id || null;
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
        const customerEmail = session.customer_details?.email || session.customer_email || null;

        logStep("Checkout session completed", { userId, courseId, bundleId, mode: session.mode, customerEmail });

        if (session.mode === "subscription") {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const planName = determinePlanFromAmount(subscription.items.data[0].price.unit_amount || 0);
          const resolvedUserId = await resolveUserId(userId, customerEmail);

          if (resolvedUserId) {
            await supabase
              .from("subscriptions")
              .upsert({
                user_id: resolvedUserId,
                plan: planName,
                status: "active",
                customer_email: customerEmail?.toLowerCase() || null,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              }, { onConflict: "user_id" });
            logStep("Subscription created", { userId: resolvedUserId, planName });
          } else if (customerEmail) {
            // Guest checkout — no matching profile yet, store with email as identifier
            // Use upsert on customer_email to avoid duplicates
            const { data: existing } = await supabase
              .from("subscriptions")
              .select("id")
              .eq("customer_email", customerEmail.toLowerCase())
              .maybeSingle();

            if (existing) {
              await supabase
                .from("subscriptions")
                .update({
                  plan: planName,
                  status: "pending_user",
                  current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                })
                .eq("id", existing.id);
            } else {
              await supabase
                .from("subscriptions")
                .insert({
                  user_id: crypto.randomUUID(),
                  plan: planName,
                  status: "pending_user",
                  customer_email: customerEmail.toLowerCase(),
                  current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                });
            }
            logStep("Pending subscription saved for guest", { email: customerEmail, planName });
          } else {
            logStep("No userId or email found for subscription — skipping");
          }
        } else if (session.mode === "payment") {
          const resolvedUserId = await resolveUserId(userId, customerEmail);
          if (!resolvedUserId) {
            logStep("No user found for payment — skipping", { userId, customerEmail });
            break;
          }

          if (bundleId) {
            logStep("Processing bundle purchase", { bundleId, userId: resolvedUserId });

            const { error: bundlePurchaseError } = await supabase
              .from("bundle_purchases")
              .insert({
                user_id: resolvedUserId,
                bundle_id: bundleId,
                amount: (session.amount_total || 0) / 100,
                currency: session.currency?.toUpperCase() || "GBP",
                status: "completed",
                stripe_session_id: session.id,
              });

            if (bundlePurchaseError) {
              logStep("Error inserting bundle purchase", { error: bundlePurchaseError });
            }

            const { data: bundleCourses } = await supabase
              .from("bundle_courses")
              .select("course_id")
              .eq("bundle_id", bundleId);

            if (bundleCourses && bundleCourses.length > 0) {
              const coursePurchases = bundleCourses.map(bc => ({
                user_id: resolvedUserId,
                course_id: bc.course_id,
                amount: 0,
                currency: session.currency?.toUpperCase() || "GBP",
                status: "completed",
              }));

              await supabase.from("course_purchases").insert(coursePurchases);
              logStep("Bundle courses recorded", { count: bundleCourses.length });
            }
          } else if (courseId) {
            logStep("Processing course purchase", { courseId, userId: resolvedUserId });

            await supabase.from("course_purchases").insert({
              user_id: resolvedUserId,
              course_id: courseId,
              amount: (session.amount_total || 0) / 100,
              currency: session.currency?.toUpperCase() || "GBP",
              status: "completed",
            });
            logStep("Course purchase recorded", { courseId });
          } else {
            // Founder Accelerator (lifetime access)
            await supabase.from("subscriptions").upsert({
              user_id: resolvedUserId,
              plan: "founder",
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date("2099-12-31").toISOString(),
            }, { onConflict: "user_id" });
            logStep("Founder Accelerator purchased", { userId: resolvedUserId });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerEmail = await getCustomerEmail(subscription.customer as string);
        if (customerEmail) {
          const resolvedUserId = await resolveUserId(null, customerEmail);
          if (resolvedUserId) {
            const updatedPlan = determinePlanFromAmount(subscription.items.data[0].price.unit_amount || 0);
            const updatedStatus = subscription.status === "active" || subscription.status === "trialing" 
              ? "active" 
              : subscription.status === "past_due" ? "past_due" : "canceled";
            await supabase.from("subscriptions").upsert({
              user_id: resolvedUserId,
              plan: updatedPlan,
              status: updatedStatus,
              customer_email: customerEmail.toLowerCase(),
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            }, { onConflict: "user_id" });
            logStep("Subscription updated", { userId: resolvedUserId, status: updatedStatus, plan: updatedPlan });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerEmail = await getCustomerEmail(subscription.customer as string);
        if (customerEmail) {
          const resolvedUserId = await resolveUserId(null, customerEmail);
          if (resolvedUserId) {
            await supabase.from("subscriptions").update({ status: "canceled" }).eq("user_id", resolvedUserId);
            logStep("Subscription canceled", { userId: resolvedUserId });
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
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});

function determinePlanFromAmount(amountInCents: number): string {
  if (amountInCents <= 6000) return "starter";
  if (amountInCents <= 12000) return "pro";
  return "founder";
}
