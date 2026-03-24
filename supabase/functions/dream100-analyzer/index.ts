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

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { targetId, companyName, websiteUrl, industry, role } = await req.json();

    // Step 1: Try Firecrawl to scrape company website
    let scrapedContent = "";
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (firecrawlKey && websiteUrl) {
      try {
        console.log("Scraping website:", websiteUrl);
        const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: websiteUrl,
            formats: ["markdown"],
            onlyMainContent: true,
          }),
        });

        if (scrapeRes.ok) {
          const scrapeData = await scrapeRes.json();
          scrapedContent = scrapeData?.data?.markdown || scrapeData?.markdown || "";
          console.log("Scraped content length:", scrapedContent.length);
        } else {
          console.warn("Firecrawl scrape failed:", scrapeRes.status);
        }
      } catch (e) {
        console.warn("Firecrawl error:", e);
      }
    }

    // Step 2: Use AI to analyze
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Analyze this company for a student who wants to approach them professionally.

Company: ${companyName}
Industry: ${industry || "Unknown"}
Target Role/Decision Maker: ${role || "Unknown"}
${scrapedContent ? `\nCompany Website Content:\n${scrapedContent.slice(0, 4000)}` : ""}

Return a JSON analysis with EXACTLY this structure (no markdown, just JSON):
{
  "cultural_values": ["value1", "value2", "value3"],
  "main_problem": "The biggest challenge/pain point this company likely faces in the relevant department",
  "recommended_tone": "formal|relaxed|innovative",
  "tone_reasoning": "Why this tone works for this company",
  "key_insights": ["insight1", "insight2", "insight3"],
  "hiring_signals": "Any signals about hiring or growth",
  "approach_strategy": "Best strategy to approach this company"
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a business analyst. Return ONLY valid JSON, no markdown formatting." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_company",
            description: "Return structured company analysis",
            parameters: {
              type: "object",
              properties: {
                cultural_values: { type: "array", items: { type: "string" } },
                main_problem: { type: "string" },
                recommended_tone: { type: "string", enum: ["formal", "relaxed", "innovative"] },
                tone_reasoning: { type: "string" },
                key_insights: { type: "array", items: { type: "string" } },
                hiring_signals: { type: "string" },
                approach_strategy: { type: "string" },
              },
              required: ["cultural_values", "main_problem", "recommended_tone", "tone_reasoning", "key_insights", "hiring_signals", "approach_strategy"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "analyze_company" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let analysis;

    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments);
    } else {
      const content = aiData.choices?.[0]?.message?.content || "";
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    }

    // Log to ai_outputs
    try {
      const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const token = authHeader!.replace("Bearer ", "");
      const { data: userData } = await adminClient.auth.getUser(token);
      await adminClient.from("ai_outputs").insert({ user_id: userData?.user?.id || null, tool: "dream100-analyzer", input_json: { companyName, industry, role }, output_json: analysis });
    } catch (e) { console.error("ai_outputs insert error:", e); }

    // Save to database
    if (targetId) {
      await supabase
        .from("dream100_targets")
        .update({ ai_analysis: analysis })
        .eq("id", targetId);
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dream100-analyzer error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
