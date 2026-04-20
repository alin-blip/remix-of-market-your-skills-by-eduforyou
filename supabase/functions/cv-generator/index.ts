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

    const { targetId, documentType, experience, targetRole, additionalInstructions, avatarUrl, locale } = await req.json();

    const langMap: Record<string, string> = { ro: 'Romanian', en: 'English', ua: 'Ukrainian' };
    const outputLanguage = langMap[locale] || 'Romanian';

    // Fetch existing data: company assets, partnership offer, target partner, profile (company info)
    const [skillsRes, offersRes, targetRes, profileRes] = await Promise.all([
      supabase.from("skill_entries").select("*").eq("user_id", userId),
      supabase.from("offers").select("*").eq("user_id", userId).limit(1).single(),
      targetId ? supabase.from("dream100_targets").select("*").eq("id", targetId).single() : Promise.resolve({ data: null }),
      supabase.from("profiles").select("company_name, company_industry, company_size, company_country, company_website, company_sells, full_name").eq("id", userId).single(),
    ]);

    const assets = skillsRes.data || [];
    const offer = offersRes.data;
    const target = targetRes.data;
    const profile = profileRes.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const partnerContext = target ? `
**Target Partner:**
- Company: ${target.name}
- Industry: ${target.industry || "Unknown"}
- Decision Maker: ${target.decision_maker_role || "Unknown"}
- Path: ${target.path_type || "JV"}
${target.ai_analysis ? `- Strategic Analysis: ${JSON.stringify(target.ai_analysis)}` : ""}` : "";

    const companyContext = profile ? `
**Your Company:**
- Name: ${profile.company_name || "Not specified"}
- Industry: ${profile.company_industry || "Not specified"}
- Size: ${profile.company_size || "Not specified"}
- Country: ${profile.company_country || "Not specified"}
- Website: ${profile.company_website || "Not specified"}
- What we sell: ${profile.company_sells || "Not specified"}
- Founder/Lead: ${profile.full_name || "Not specified"}` : "";

    const assetsList = assets.map((s: any) => `${s.skill} (${s.category}, strength: ${s.confidence}/5)`).join(", ");
    const offerContext = offer ? `
**Your Partnership Offer:**
- Strategic Market Value: ${offer.smv || "N/A"}
- Target Partner Profile: ${offer.target_market || "N/A"}
- Affiliate Tier: ${JSON.stringify(offer.starter_package || {})}
- Referral Tier: ${JSON.stringify(offer.standard_package || {})}
- JV Tier: ${JSON.stringify(offer.premium_package || {})}` : "";

    let systemPrompt = "";
    let userPrompt = "";

    if (documentType === "ats_cv") {
      // One-Pager Partnership Brief — clean, scannable, sent before the pitch deck
      systemPrompt = `You are a B2B partnership strategist (Hormozi/Cialdini style) creating PARTNERSHIP ONE-PAGERS — short, scannable briefs sent to a Dream 100 partner BEFORE the full pitch deck. Output clean HTML with inline styles. Write ALL content in ${outputLanguage}. Style: dark text (#1a1a1a) on white, navy headings (#1e3a5f), 14-16px body, 20-24px headings. No purple. No buttons. Single page, scannable in 60 seconds.`;
      userPrompt = `Create a 1-page Partnership Brief for approaching this partner: ${targetRole || "strategic partner"}.

${companyContext}

**Our Strategic Assets:** ${assetsList || "Not specified"}
**Context / Track Record:** ${experience || "Not provided"}
${partnerContext}
${offerContext}
${additionalInstructions ? `**Additional notes:** ${additionalInstructions}` : ""}
${avatarUrl ? `Include the founder photo at the top: <img src="${avatarUrl}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;" alt="Founder">` : ""}

Sections (output as styled HTML):
1. **Header** — Your company name + tagline + 1-line value prop for THIS specific partner
2. **Why This Partnership** — 2-3 sentences on the strategic fit (their audience × our assets)
3. **What You Get** — 3 concrete benefits the partner receives (their gain, not yours)
4. **Commission Structure** — 1-line summary of the hybrid % + fix + bonus offer
5. **Next Step** — Specific 15-min call CTA with a calendar placeholder

Frame everything from the PARTNER'S perspective. No fluff. No generic claims.`;
    } else if (documentType === "sales_cv") {
      // Full Pitch Deck — long-form, sales letter style, sent after first reply
      systemPrompt = `You are a B2B partnership strategist creating PARTNERSHIP PITCH DECKS in the style of Hormozi/Cialdini — long-form sales documents sent to Dream 100 partners after initial interest. Output rich HTML with inline styles. Write ALL content in ${outputLanguage}. Style: dark text (#1a1a1a), navy headings (#1e3a5f), 14-16px body, 22-28px headings. No purple. No buttons. Printable document.`;
      userPrompt = `Create a Partnership Pitch Deck for approaching this partner. This is the full pitch sent after the partner replied with interest.

${companyContext}

**Our Strategic Assets:** ${assetsList || "Not specified"}
**Track Record / Experience:** ${experience || "Not provided"}
${partnerContext}
${offerContext}
${additionalInstructions ? `**Additional instructions:** ${additionalInstructions}` : ""}
${avatarUrl ? `Include founder photo prominently: <img src="${avatarUrl}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid #1e3a5f;" alt="Founder">` : ""}

Sections (output as styled HTML):
1. **Cover** — Company logo placeholder + "Partnership Proposal for [partner name]"
2. **The Strategic Opportunity** — Specific market gap that this partnership solves (frame as their problem)
3. **Why Us — Our Leverage** — Concrete proof: assets, audience, IP, distribution we bring
4. **The Partnership Model** — Choose 1 of 3: Affiliate / Referral / JV — and explain how it works for THIS partner
5. **Commission Structure (hybrid)** — Clear table: % on revenue + fixed onboarding fee + performance bonus tiers
6. **Expected Results in 90 Days** — Concrete, measurable: # of qualified intros, $ revenue range, brand impact
7. **Term Sheet Summary** — Exclusivity, duration, attribution method, payout cadence
8. **Next Step** — Single CTA: 30-min strategy call with calendar placeholder

Tone: confident, specific, partner-first. No generic agency-speak.`;
    } else {
      // Outreach Sales Letter — short cold/warm message
      systemPrompt = `You are a B2B partnership copywriter writing OUTREACH SALES LETTERS to Dream 100 partners — short, sharp, one-screen messages. Output clean HTML with inline styles. Write ALL content in ${outputLanguage}. Do NOT include section labels (Hook/Story/Offer/CTA) in the output — the letter must flow naturally.`;
      userPrompt = `Write a partnership outreach sales letter to this Dream 100 target.

${companyContext}

**Our Assets:** ${assetsList || "Not specified"}
**Context:** ${experience || "Not provided"}
${partnerContext}
${offerContext}
${additionalInstructions ? `**Additional instructions:** ${additionalInstructions}` : ""}
${avatarUrl ? `Include founder photo at top: <img src="${avatarUrl}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;" alt="Founder">` : ""}

Structure (output as styled HTML, no visible framework labels — letter must read naturally):
1. Open with a specific observation about their business (something only someone who studied them would notice)
2. Frame a strategic gap or opportunity their company has right now
3. Show how a partnership with us closes that gap (concrete: comm %, audience, asset)
4. End with a single CTA: 15-min call to discuss the partnership term sheet

Under 250 words. Personal, specific, partner-first. No buzzwords.`;
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

    // Log to ai_outputs
    try {
      const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await adminClient.from("ai_outputs").insert({ user_id: userId, tool: "cv-generator", input_json: { documentType, targetRole, locale }, output_json: { content: content.substring(0, 500) } });
    } catch (e) { console.error("ai_outputs insert error:", e); }

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
