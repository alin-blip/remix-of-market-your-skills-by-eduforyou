import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { skills, studyField, companyContext } = body;
    const goalsText = Array.isArray(body.goals) ? body.goals.join(', ') : (typeof body.goals === 'string' ? body.goals : '');
    const valuesText = Array.isArray(body.values) ? body.values.join(', ') : (typeof body.values === 'string' ? body.values : '');

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a B2B partnership strategist building the dual-profile foundation for Dream 100 outreach:
- **ICP (Ideal Client Profile):** the END BUYER the company already serves or wants to serve
- **IPP (Ideal Partner Profile):** the COMPANIES that have access to that ICP and could refer/affiliate/JV

Use a 4-quadrant framework (adapted from Ikigai → Partnership Fit Matrix):
1. **What we love serving** → the audience/vertical the company is most passionate about & wins with
2. **What we are great at** → unique strengths, methodology, results we deliver
3. **What the market needs** → urgent, painful problems we solve
4. **What we can be paid for** → concrete commission-bearing services / outcomes a partner can monetize

Then generate:
- 3-5 **Positioning statements** — sharp one-liners pitching the company to potential partners
- 3-5 **Partnership angles** — concrete partnership offer ideas (each with title, description, ideal partner type, why they'd say yes)

Respond ONLY via tool call. Be specific, results-oriented, and frame everything around revenue/commission for the partner.`;

    const skillsList = skills?.map((s: any) => `${s.skill || s.name} (${s.category})`).join(', ') || 'No assets';

    const userPrompt = `Build the ICP + IPP + Partnership Angles for this company:

**Industry:** ${studyField || 'Not specified'}

**Strategic assets:** ${skillsList}

**Company goals:** ${goalsText || 'Not specified'}

**Company values:** ${valuesText || 'Not specified'}

${companyContext ? `**Additional context:**\n${companyContext}` : ''}

Output the full Partnership Fit Matrix with concrete, monetizable angles.`;

    const requestBody = JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_ikigai",
            description: "Returns the Partnership Fit Matrix (ICP+IPP+angles)",
            parameters: {
              type: "object",
              properties: {
                what_you_love: { type: "array", items: { type: "string" }, description: "Audience/verticals the company loves serving" },
                what_youre_good_at: { type: "array", items: { type: "string" }, description: "Unique strengths & methods" },
                what_world_needs: { type: "array", items: { type: "string" }, description: "Urgent market problems solved" },
                what_you_can_be_paid_for: { type: "array", items: { type: "string" }, description: "Commission-bearing outcomes partners can sell" },
                ikigai_statements: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      statement: { type: "string", description: "Positioning one-liner for partner pitch" },
                      explanation: { type: "string" }
                    },
                    required: ["statement", "explanation"]
                  }
                },
                service_angles: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Partnership offer title" },
                      description: { type: "string" },
                      target_audience: { type: "string", description: "Ideal partner type" },
                      unique_value: { type: "string", description: "Why partner says yes (commission + ease)" }
                    },
                    required: ["title", "description", "target_audience", "unique_value"]
                  }
                },
                core_positioning: { type: "string", description: "One-sentence pitch to a Dream 100 partner" }
              },
              required: ["what_you_love", "what_youre_good_at", "what_world_needs", "what_you_can_be_paid_for", "ikigai_statements", "service_angles", "core_positioning"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_ikigai" } }
    });

    let response: Response | null = null;
    let lastErrorText = "";
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: requestBody,
      });
      if (response.ok) break;
      // Retry only on transient gateway errors
      if ([502, 503, 504].includes(response.status) && attempt < maxAttempts) {
        lastErrorText = await response.text().catch(() => "");
        console.warn(`AI gateway ${response.status}, retry ${attempt}/${maxAttempts - 1}`);
        await new Promise((r) => setTimeout(r, 800 * attempt));
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      const status = response?.status ?? 500;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const errorText = response ? await response.text().catch(() => lastErrorText) : lastErrorText;
      console.error("AI gateway error:", status, errorText?.slice(0, 500));
      if ([502, 503, 504].includes(status)) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable. Please try again in a moment." }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("Error generating Partnership Fit Matrix");
    }

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Error generating Partnership Fit Matrix");
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
      await adminClient.from("ai_outputs").insert({ user_id: userId, tool: "ikigai-builder", input_json: { skills, studyField, goals: goalsText, values: valuesText }, output_json: result });
    } catch (e) { console.error("ai_outputs insert error:", e); }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("ICP/IPP builder error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
