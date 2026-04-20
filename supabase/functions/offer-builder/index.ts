import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skills, ikigaiResult, studyField, locale, companyContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langMap: Record<string, string> = { ro: 'Romanian', en: 'English', ua: 'Ukrainian' };
    const outputLanguage = langMap[locale] || 'English';
    const currency = locale === 'ro' ? 'RON' : (locale === 'ua' ? 'UAH' : 'GBP');

    const systemPrompt = `You are a B2B partnership deal architect (Hormozi/Ravikant style) building HYBRID commission offers for Dream 100 outreach.

Build 3 partnership tiers — each tier MUST combine:
- **% revenue share** (recurring or per-transaction)
- **Fixed referral fee** (one-time per qualified deal)
- **Performance bonus** (escalator at volume / outcome milestones)

Tier framework:
- **Affiliate Tier (low-touch):** broad reach, partner just shares a link/code. Lower % + small fixed fee + tiered bonus on volume.
- **Referral Tier (warm intro):** partner makes a personal intro, no selling. Mid % + meaningful fixed fee + bonus on closed deals.
- **Joint Venture Tier (co-sell):** partner co-sells, co-markets, may even white-label. Highest % + premium fixed fee + revenue-share escalator + strategic bonuses (equity, exclusivity).

For each tier specify: name, tagline, commission_pct, fixed_fee, currency, bonus rules, deliverables (what partner gets + what we deliver), ideal partner profile, expected partner earnings example.

Currency: ${currency}. Adapt amounts to a realistic B2B deal size for the company's market.
Write in ${outputLanguage}. Respond ONLY via tool call.`;

    const skillsList = Array.isArray(skills) ? skills.map((s: any) => `${s.skill || s.name} (${s.category})`).join(', ') : 'No assets';
    const serviceAngles = Array.isArray(ikigaiResult?.service_angles) ? ikigaiResult.service_angles.map((a: any) => a.title).join(', ') : 'Not specified';
    const corePositioning = ikigaiResult?.core_positioning || 'Not specified';
    const whatCanBePaidFor = Array.isArray(ikigaiResult?.what_you_can_be_paid_for) ? ikigaiResult.what_you_can_be_paid_for.join(', ') : 'Not specified';

    const userPrompt = `Build 3 hybrid partnership offers for this company:

**Positioning:** ${corePositioning}

**Strategic assets:** ${skillsList}

**Monetizable outcomes:** ${whatCanBePaidFor}

**Partnership angles:** ${serviceAngles}

**Industry:** ${studyField || 'Not specified'}

${companyContext ? `**Company context:**\n${companyContext}` : ''}

Output 3 hybrid commission tiers (Affiliate / Referral / Joint Venture) with %, fixed fee, bonuses, and partner ROI examples in ${currency}.`;

    const packageSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        tagline: { type: "string" },
        price: { type: "number", description: "Headline fixed referral fee per closed deal" },
        currency: { type: "string" },
        commission_pct: { type: "number", description: "Revenue share percentage" },
        commission_fixed: { type: "number", description: "Fixed referral fee per qualified deal" },
        performance_bonus: { type: "string", description: "Bonus rules (e.g. +5% after 10 deals/quarter, £500 bonus on first close)" },
        delivery_time: { type: "string", description: "Time-to-payout cycle (e.g. 30 days post-close)" },
        deliverables: { type: "array", items: { type: "string" }, description: "What the partner gets + what we deliver to their referral" },
        ideal_for: { type: "string", description: "Ideal partner profile" },
        partner_earnings_example: { type: "string", description: "Concrete example: '5 deals/month → £X total commission'" }
      },
      required: ["name", "tagline", "price", "currency", "commission_pct", "commission_fixed", "delivery_time", "deliverables", "ideal_for"]
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        tools: [{
          type: "function",
          function: {
            name: "generate_offer",
            description: "Returns 3 hybrid partnership commission offers",
            parameters: {
              type: "object",
              properties: {
                smv: { type: "string", description: "One-line value proposition pitched to a partner" },
                target_market: { type: "string", description: "Ideal partner segment (industry, size, persona)" },
                pricing_justification: { type: "string", description: "Why these commission structures are competitive" },
                starter_package: { ...packageSchema, description: "Affiliate tier" },
                standard_package: { ...packageSchema, description: "Referral tier (recommended)" },
                premium_package: { ...packageSchema, description: "Joint Venture tier" }
              },
              required: ["smv", "target_market", "pricing_justification", "starter_package", "standard_package", "premium_package"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_offer" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Error generating partnership offers");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("Invalid AI response");
    const result = JSON.parse(toolCall.function.arguments);

    try {
      const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const token = req.headers.get("Authorization")?.replace("Bearer ", "");
      let userId = null;
      if (token) { const { data } = await adminClient.auth.getUser(token); userId = data?.user?.id || null; }
      await adminClient.from("ai_outputs").insert({ user_id: userId, tool: "offer-builder", input_json: { skills, ikigaiResult, studyField, locale }, output_json: result });
    } catch (e) { console.error("ai_outputs insert error:", e); }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Partnership offer builder error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
