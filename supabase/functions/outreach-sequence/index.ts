import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub;

    const { targetId, pathType, platform, regenerateIndex, locale } = await req.json();

    const langMap: Record<string, string> = { ro: 'Romanian', en: 'English', ua: 'Ukrainian' };
    const outputLanguage = langMap[locale] || 'Romanian';

    // Fetch target data
    let target = null;
    if (targetId) {
      const { data } = await supabase.from("dream100_targets").select("*").eq("id", targetId).single();
      target = data;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const routeFocus = pathType === "employee"
      ? 'Focus on "how I can help the team achieve objective X". Professional, team-oriented.'
      : pathType === "freelancer"
      ? 'Focus on ROI and concrete results ("I increased sales by X%"). Value-first approach.'
      : 'Focus on vision, traction, partnership. Co-builder mindset.';

    const platformGuidance = platform === "email"
      ? "Format as professional email. Include subject lines."
      : platform === "whatsapp"
      ? "Keep very short and casual. No formalities."
      : "Format for LinkedIn DM. Professional but conversational.";

    const companyContext = target ? `
Company: ${target.name}
Industry: ${target.industry || "Unknown"}
Decision Maker: ${target.decision_maker_role || "Unknown"}
${target.ai_analysis ? `Analysis: ${JSON.stringify(target.ai_analysis)}` : ""}` : "No specific company selected.";

    const prompt = `Generate a 3-message outreach sequence for ${platform}.

${companyContext}

Path type: ${pathType}
${routeFocus}
${platformGuidance}

MESSAGE 1 — Connection (Day 1):
- NO pitch, NO request
- Specific appreciation for something real about the company/person
- Maximum 50 words
- Tone: conversational, human

MESSAGE 2 — Value (Day 4):
- Offer something useful for free (idea, observation, resource)
- Connected to a real problem of the company
- Maximum 80 words

MESSAGE 3 — CTA (Day 9):
- Invitation for a 10-15 minute conversation
- No pressure, no "selling"
- Maximum 60 words`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are an outreach specialist for students and young professionals. Write authentic, non-salesy messages. IMPORTANT: Write ALL messages in ${outputLanguage}.` },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_sequence",
            description: "Return the 3-message outreach sequence",
            parameters: {
              type: "object",
              properties: {
                messages: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "number" },
                      label: { type: "string" },
                      subject: { type: "string" },
                      content: { type: "string" },
                      status: { type: "string", enum: ["draft", "sent", "replied"] },
                    },
                    required: ["day", "label", "content", "status"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["messages"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_sequence" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${aiRes.status}`);
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

    // Save sequence
    const { data: seq } = await supabase
      .from("outreach_sequences")
      .insert({
        user_id: userId,
        target_id: targetId || null,
        path_type: pathType,
        platform,
        messages: result.messages,
      })
      .select()
      .single();

    return new Response(JSON.stringify({ success: true, ...result, sequence: seq }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("outreach-sequence error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
