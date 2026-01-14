import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const { priceId, mode, successUrl, cancelUrl, userId, courseId, bundleId } = await req.json();

    if (!priceId) {
      throw new Error("Price ID is required");
    }

    const metadata: Record<string, string> = {
      userId: userId || "",
    };

    // Add courseId or bundleId to metadata
    if (courseId) {
      metadata.courseId = courseId;
    }
    if (bundleId) {
      metadata.bundleId = bundleId;
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode || "subscription",
      success_url: successUrl || `${req.headers.get("origin")}/dashboard?success=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/pricing?canceled=true`,
      metadata,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Stripe checkout error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
