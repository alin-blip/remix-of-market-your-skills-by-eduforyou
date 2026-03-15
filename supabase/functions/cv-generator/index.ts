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

    const { targetId, documentType, experience, targetRole, additionalInstructions, avatarUrl } = await req.json();

    // Fetch existing data
    const [skillsRes, offersRes, targetRes] = await Promise.all([
      supabase.from("skill_entries").select("*").eq("user_id", userId),
      supabase.from("offers").select("*").eq("user_id", userId).limit(1).single(),
      targetId ? supabase.from("dream100_targets").select("*").eq("id", targetId).single() : Promise.resolve({ data: null }),
    ]);

    const skills = skillsRes.data || [];
    const offer = offersRes.data;
    const target = targetRes.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const companyContext = target ? `
Company: ${target.name}
Industry: ${target.industry || "Unknown"}
Decision Maker: ${target.decision_maker_role || "Unknown"}
${target.ai_analysis ? `Company Analysis: ${JSON.stringify(target.ai_analysis)}` : ""}` : "";

    const skillsList = skills.map((s: any) => `${s.skill} (${s.category}, confidence: ${s.confidence}%)`).join(", ");
    const offerContext = offer ? `
Service Value: ${offer.smv || "N/A"}
Target Market: ${offer.target_market || "N/A"}
Starter Package: ${JSON.stringify(offer.starter_package || {})}
Standard Package: ${JSON.stringify(offer.standard_package || {})}
Premium Package: ${JSON.stringify(offer.premium_package || {})}` : "";

    let systemPrompt = "";
    let userPrompt = "";

    if (documentType === "ats_cv") {
      systemPrompt = "You are an expert CV writer specializing in ATS-optimized CVs. Create clean, keyword-rich CVs that pass applicant tracking systems. Output in clean HTML format with inline styles.";
      userPrompt = `Create an ATS-friendly CV optimized for this role: ${targetRole || "professional role"}.

Skills: ${skillsList}
Experience: ${experience || "Not provided"}
${companyContext}
${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ""}
${avatarUrl ? `IMPORTANT: Include the profile photo at the top of the CV using this image: <img src="${avatarUrl}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;" alt="Profile Photo">` : ""}

Format: Output as clean HTML. Include sections: Contact Info (use placeholders), Professional Summary, Key Skills, Professional Experience, Education. Use keywords from the target role. Keep it clean and scannable. Use semantic HTML with inline styles.`;
    } else if (documentType === "sales_cv") {
      systemPrompt = "You are a personal branding expert who creates CV Sales Pages - non-traditional CVs that read like sales pages and focus on results and value. Output in rich HTML format with inline styles, modern typography, and visual hierarchy.";
      userPrompt = `Create a CV Sales Page for approaching this company. This is NOT a traditional CV - it's a personal sales page.

Skills: ${skillsList}
Experience: ${experience || "Not provided"}
${companyContext}
${offerContext}
${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ""}
${avatarUrl ? `IMPORTANT: Include the profile photo prominently at the top using: <img src="${avatarUrl}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid #6366f1;" alt="Profile Photo">` : ""}

Sections to include (output as styled HTML):
1. "What Problems I Solve" - tied to the company's specific challenges
2. "My X-Factor" - unique differentiator
3. "Expected Results in First 90 Days" - concrete, measurable outcomes
4. "Why Me" - social proof and evidence

Tone: Adapt to the company's culture. Use compelling, results-focused language. Make it visually appealing with colors, spacing, and modern design.`;
    } else {
      systemPrompt = "You are a copywriter who writes cover letters as sales letters. They follow the HOOK → STORY → OFFER → CTA framework.";
      userPrompt = `Write a Cover Letter as a Sales Letter for this application.

Skills: ${skillsList}
Experience: ${experience || "Not provided"}
${companyContext}
${offerContext}
${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ""}

Structure:
1. HOOK - Start with a specific problem the company has
2. STORY - How you've solved something similar (use real skills/experience)
3. OFFER - What you bring to the table (concrete value)
4. CTA - Invitation for a 15-minute conversation

Keep it under 300 words. Personal, not generic.`;
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Save document
    const { data: doc, error: docError } = await supabase
      .from("cv_documents")
      .upsert({
        user_id: userId,
        target_id: targetId || null,
        document_type: documentType,
        content,
      }, { onConflict: "user_id,target_id,document_type" })
      .select()
      .single();

    return new Response(JSON.stringify({ success: true, content, document: doc }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cv-generator error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
