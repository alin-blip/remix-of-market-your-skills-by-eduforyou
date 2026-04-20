import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { offer, ikigaiResult, platform, locale } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const platformNames: Record<string, string> = {
      linkedin: "LinkedIn (B2B partnership outreach)",
      email: "Cold email (B2B partnership pitch)",
      dm: "DM (Twitter/Instagram founder-to-founder)"
    };

    const langMap: Record<string, string> = { ro: 'Romanian', en: 'English', ua: 'Ukrainian' };
    const outputLanguage = langMap[locale] || 'English';

    const systemPrompt = `You are a B2B partnership outreach copywriter (Hormozi-style: blunt value, zero fluff, no salesy filler).
You write Dream 100 partnership pitches that convert because they:

1. Lead with the PARTNER's revenue upside (not your features)
2. Reference a clear, mutually-beneficial commission model (% + fixed fee + bonus)
3. Sound like a founder talking peer-to-peer, not a sales rep
4. Include personalization placeholders: [PARTNER_COMPANY], [DECISION_MAKER_NAME], [SHARED_AUDIENCE], [SPECIFIC_PAIN]
5. End with a low-friction CTA (15-min call, async loom, term-sheet review)
6. Stay short — every sentence earns its spot

Generate 3 messages forming a sequence for ${platformNames[platform] || platform}:
${platform === 'linkedin' ? '- Connection request (≤300 chars) → Day-3 value-led intro → Day-7 commission proposal' : ''}
${platform === 'email' ? '- Subject + cold pitch with commission hook → Day-4 case study follow-up → Day-9 final term-sheet offer' : ''}
${platform === 'dm' ? '- Casual founder-to-founder opener → Value drop → Partnership ask' : ''}

Write in ${outputLanguage}. Respond ONLY via tool call.`;

    const smv = offer?.smv || 'Strategic partnership offer';
    const targetMarket = offer?.target_market || 'B2B partners';
    const referralTier = offer?.standard_package?.name || 'Referral commission tier';
    const commissionPct = offer?.standard_package?.commission_pct;
    const commissionFixed = offer?.standard_package?.commission_fixed;
    const commissionLine = (commissionPct || commissionFixed)
      ? `${commissionPct ? commissionPct + '% rev share' : ''}${commissionPct && commissionFixed ? ' + ' : ''}${commissionFixed ? commissionFixed + ' fixed/deal' : ''}`
      : 'Hybrid commission';
    const serviceAngles = ikigaiResult?.service_angles?.map((a: any) => a.title).join(', ') || 'Multiple angles';
    const corePositioning = ikigaiResult?.core_positioning || 'Strategic operator';

    const userPrompt = `Write a 3-message ${platformNames[platform] || platform} sequence for Dream 100 partnership outreach:

**Our pitch (SMV):** ${smv}

**Ideal partner segment:** ${targetMarket}

**Positioning:** ${corePositioning}

**Partnership angles:** ${serviceAngles}

**Active offer:** ${referralTier} — ${commissionLine}

Generate 3 sequenced templates with personalization placeholders.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        tools: [{
          type: "function",
          function: {
            name: "generate_outreach",
            description: "Returns the 3-message partnership outreach sequence",
            parameters: {
              type: "object",
              properties: {
                platform: { type: "string" },
                templates: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string", enum: ["connection", "intro", "follow_up", "value_add"] },
                      subject: { type: "string", description: "Email subject line (email only)" },
                      content: { type: "string", description: "Message body with [PARTNER_COMPANY], [DECISION_MAKER_NAME], [SHARED_AUDIENCE] placeholders" },
                      tips: { type: "array", items: { type: "string" }, description: "Personalization tips" },
                      best_time: { type: "string" }
                    },
                    required: ["name", "type", "content", "tips"]
                  }
                },
                sequence_suggestion: { type: "string", description: "Cadence: Day-1 / Day-3 / Day-7 etc." },
                response_rate_tips: { type: "array", items: { type: "string" }, description: "3-4 tactical tips to lift response rate" }
              },
              required: ["platform", "templates", "sequence_suggestion", "response_rate_tips"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_outreach" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Error generating outreach templates");
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
      await adminClient.from("ai_outputs").insert({ user_id: userId, tool: "outreach-generator", input_json: { platform, locale }, output_json: result });
    } catch (e) { console.error("ai_outputs insert error:", e); }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Partnership outreach generator error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
