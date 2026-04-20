import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { experiences, studyField, cvText, companyContext } = body;

    let interestsText = '';
    if (Array.isArray(body.interests)) interestsText = body.interests.join(', ');
    else if (typeof body.interests === 'string') interestsText = body.interests;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a B2B partnership strategist (Hormozi/Cialdini style) helping a company audit its STRATEGIC ASSETS for Dream 100 partnership outreach.

Analyze the company information and identify:
1. **Technical assets** — products, services, platforms, IP, proprietary methods, data the company owns
2. **Soft assets** — brand authority, audience, distribution channels, expertise, reputation, case studies
3. **Hidden/Underutilized assets** — overlooked leverage points: email lists, founder reputation, exclusive vendor relationships, certifications, partnerships already in place, geographic presence

For each asset:
- Asset name (concrete, not generic)
- Category: technical | soft | hidden
- Confidence (1-5): how strong/proven this asset is
- Description: WHY a partner would care about this asset (value to THEM, not to you)
- Monetization potential: how easily this asset converts into a partnership commission stream (low/medium/high)

CRITICAL: Frame everything from the partner's perspective — what would a strategic partner pay commission to access?
Respond ONLY via tool call. Be specific to this company's industry and offer.`;

    const combinedExperiences = [experiences, cvText, companyContext].filter(Boolean).join('\n\n');

    const userPrompt = `Audit the strategic partnership assets for this company:

**Industry / Domain:** ${studyField || 'Not specified'}

**Company description, products, expertise & track record:**
${combinedExperiences || 'No information provided'}

**Markets / interests / target verticals:**
${interestsText || 'Not specified'}

Identify all assets that could be packaged into B2B partnership offers (referral, affiliate, joint venture, white-label).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_skills",
            description: "Returns the list of strategic partnership assets identified",
            parameters: {
              type: "object",
              properties: {
                skills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Specific asset name" },
                      category: { type: "string", enum: ["technical", "soft", "hidden"] },
                      confidence: { type: "number", minimum: 1, maximum: 5 },
                      description: { type: "string", description: "Why a partner would care" },
                      monetization_potential: { type: "string", enum: ["low", "medium", "high"] }
                    },
                    required: ["name", "category", "confidence", "description", "monetization_potential"],
                    additionalProperties: false
                  }
                },
                summary: { type: "string", description: "Short summary of the company's partnership leverage profile" },
                top_recommendation: { type: "string", description: "The #1 partnership angle to lead with" }
              },
              required: ["skills", "summary", "top_recommendation"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_skills" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Contact admin." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Error analyzing company assets");
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
      await adminClient.from("ai_outputs").insert({ user_id: userId, tool: "skill-scanner", input_json: { experiences, studyField, interests: interestsText }, output_json: result });
    } catch (e) { console.error("ai_outputs insert error:", e); }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Company asset scanner error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
