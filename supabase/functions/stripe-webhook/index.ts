import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  
  // For now, we'll process without signature verification
  // In production, you should verify the webhook signature
  let event: Stripe.Event;
  
  try {
    event = JSON.parse(body) as Stripe.Event;
  } catch (err) {
    console.error("Error parsing webhook body:", err);
    return new Response("Webhook Error", { status: 400 });
  }

  console.log("Processing event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const courseId = session.metadata?.courseId;

        if (session.mode === "subscription" && userId) {
          // Handle subscription
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          const planName = determinePlanFromAmount(subscription.items.data[0].price.unit_amount || 0);
          
          await supabase
            .from("subscriptions")
            .upsert({
              user_id: userId,
              plan: planName,
              status: "active",
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            }, { onConflict: "user_id" });

          console.log(`Subscription created for user ${userId}: ${planName}`);
        } else if (session.mode === "payment" && userId) {
          // Handle one-time payment (Founder Accelerator or Course)
          if (courseId) {
            // Course purchase
            await supabase
              .from("course_purchases")
              .insert({
                user_id: userId,
                course_id: courseId,
                amount: (session.amount_total || 0) / 100,
                currency: session.currency?.toUpperCase() || "GBP",
                status: "completed",
              });
            console.log(`Course ${courseId} purchased by user ${userId}`);
          } else {
            // Founder Accelerator (lifetime access)
            await supabase
              .from("subscriptions")
              .upsert({
                user_id: userId,
                plan: "founder",
                status: "active",
                current_period_start: new Date().toISOString(),
                current_period_end: new Date("2099-12-31").toISOString(), // Lifetime
              }, { onConflict: "user_id" });
            console.log(`Founder Accelerator purchased by user ${userId}`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        // Find user by subscription metadata or customer
        console.log("Subscription updated:", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription canceled:", subscription.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
});

function determinePlanFromAmount(amountInCents: number): string {
  // £9 = 900 pence = Starter
  // £19 = 1900 pence = Pro
  // £997 = 99700 pence = Founder
  if (amountInCents <= 1000) return "starter";
  if (amountInCents <= 2000) return "pro";
  return "founder";
}
