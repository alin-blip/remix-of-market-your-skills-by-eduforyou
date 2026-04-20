import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { pathType, industry, location, companySize, values, budget } = await req.json();

    // Step 1: Use Perplexity for real-time company search
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    let searchResults = "";

    if (perplexityKey) {
      const sizeLabel = companySize === "micro" ? "1-10 employees" :
        companySize === "small" ? "10-50 employees" :
        companySize === "medium" ? "50-200 employees" : "200+ employees";

      // Dream 100 = B2B partnership scanner (multi-tenant generic)
      // pathType maps to partnership model: affiliate / referral / jv / white_label
      const partnershipModel = pathType === "employee" ? "affiliate" : pathType === "freelancer" ? "referral" : pathType === "startup" ? "joint venture" : (pathType || "referral");

      const searchQuery = `Companies in ${industry || "any industry"} that already serve our ICP and could become ${partnershipModel} partners. Region: ${location || "UK"}. Size: ${sizeLabel}. Values/fit signals: ${values || "growth-oriented"}. ${budget ? `Commission budget tolerance: ${budget}.` : ""}`;

      try {
        console.log("Perplexity Dream 100 search:", searchQuery);
        const pRes = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${perplexityKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar",
            messages: [
              { role: "system", content: "You are a B2B partnership research analyst. Find real, verifiable companies that could become strategic distribution/referral/JV partners — never end customers, always partners." },
              { role: "user", content: `Find 25 real companies matching these Dream 100 partner criteria: ${searchQuery}. For each: company name, industry, what they sell (so we know overlap with our ICP), why they'd be a strong ${partnershipModel} partner (commission upside, audience fit, distribution leverage), LinkedIn URL or website, and the typical decision-maker job title (Head of Partnerships, BD, Founder, etc.). Format as detailed text.` },
            ],
          }),
        });

        if (pRes.ok) {
          const pData = await pRes.json();
          searchResults = pData.choices?.[0]?.message?.content || "";
          console.log("Perplexity results length:", searchResults.length);
        } else {
          console.warn("Perplexity search failed:", pRes.status);
        }
      } catch (e) {
        console.warn("Perplexity error:", e);
      }
    }

    // Step 2: Use AI to structure results
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Based on the following research, structure 20-25 Dream 100 PARTNER companies (not end-customers) suitable for a ${pathType || "referral"} partnership in ${industry || "any industry"}.

${searchResults ? `Research:\n${searchResults}` : `Generate suggestions: ${industry || "any"} industry partners, ${location || "UK"}, ${companySize || "any"} size, fit signals: ${values || "growth-oriented"}.`}

Partnership model: ${pathType || "referral"}
Industry: ${industry || "any"}
Location: ${location || "UK"}
Partner size preference: ${companySize || "any"}
Fit signals: ${values || "any"}
${budget ? `Commission budget tolerance: ${budget}` : ""}

For each partner, "why_fit" must explain the COMMISSION/REFERRAL angle, not a job opportunity.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a business research assistant helping students find target companies." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_companies",
            description: "Return structured list of companies",
            parameters: {
              type: "object",
              properties: {
                companies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      industry: { type: "string" },
                      description: { type: "string" },
                      why_fit: { type: "string" },
                      linkedin_url: { type: "string" },
                      website_url: { type: "string" },
                      decision_maker_type: { type: "string" },
                    },
                    required: ["name", "industry", "description", "why_fit", "decision_maker_type"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["companies"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_companies" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let result;

    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      const content = aiData.choices?.[0]?.message?.content || "";
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    }

    // Log to ai_outputs
    try {
      const { createClient: createAdminClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const adminClient = createAdminClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const token = req.headers.get("Authorization")?.replace("Bearer ", "");
      let userId = null;
      if (token) { const { data } = await adminClient.auth.getUser(token); userId = data?.user?.id || null; }
      await adminClient.from("ai_outputs").insert({ user_id: userId, tool: "dream100-scanner", input_json: { pathType, industry, location, companySize }, output_json: result });
    } catch (e2) { console.error("ai_outputs insert error:", e2); }

    return new Response(JSON.stringify({ success: true, ...result, usedPerplexity: !!searchResults }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dream100-scanner error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
