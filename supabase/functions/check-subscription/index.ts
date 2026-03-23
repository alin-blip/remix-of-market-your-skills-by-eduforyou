import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRO_PRODUCT_ID = 'prod_UCSdvbrfCzXZOI';

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // FIRST: Check local database for subscription
    const { data: localSub } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (localSub && localSub.status === 'active') {
      const isValid = !localSub.current_period_end || 
        new Date(localSub.current_period_end) > new Date();
      
      if (isValid) {
        logStep("Found active subscription in local database", { plan: localSub.plan });
        return new Response(JSON.stringify({
          subscribed: true,
          plan: localSub.plan === 'pro' ? 'pro' : 'starter',
          product_id: localSub.plan === 'pro' ? PRO_PRODUCT_ID : null,
          subscription_end: localSub.current_period_end,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // SECOND: Fallback to Stripe check
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY not set");
      return new Response(JSON.stringify({ 
        subscribed: false, plan: 'starter', product_id: null, subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found in Stripe");
      return new Response(JSON.stringify({ 
        subscribed: false, plan: 'starter', product_id: null, subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    let hasActiveSub = subscriptions.data.length > 0;
    let productId: string | null = null;
    let subscriptionEnd: string | null = null;
    let plan = 'starter';

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      productId = subscription.items.data[0].price.product as string;
      
      if (productId === PRO_PRODUCT_ID) {
        plan = 'pro';
      }
      
      logStep("Active subscription found", { plan, endDate: subscriptionEnd });
    } else {
      // Also check trialing subscriptions
      const trialingSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 1,
      });

      if (trialingSubs.data.length > 0) {
        const subscription = trialingSubs.data[0];
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        productId = subscription.items.data[0].price.product as string;
        hasActiveSub = true;
        
        if (productId === PRO_PRODUCT_ID) {
          plan = 'pro';
        }
        
        logStep("Trialing subscription found", { plan, endDate: subscriptionEnd });
      } else {
        logStep("No active or trialing subscription found");
      }
    }

    // Update local subscription table
    const { error: upsertError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan,
        status: hasActiveSub ? 'active' : 'inactive',
        current_period_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      logStep("Warning: Failed to update subscriptions table", { error: upsertError.message });
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan,
      product_id: productId,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
