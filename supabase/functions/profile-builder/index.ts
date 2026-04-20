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
    const { offer, ikigaiResult, platform, locale, userName } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const platformInstructions: Record<string, string> = {
      facebook: `
        Generate a B2B-positioned Facebook business page profile:
        - bio: Short company intro (max 255 chars) — frame as "we partner with X to deliver Y"
        - about: Detailed "About" (300-500 words) for partner discovery — services, partner program, commission structure, results
        - cta: CTA for partnership inquiries (e.g. "Become a Partner")
        - username_suggestions: 3 brand handles
      `,
      instagram: `
        Generate a B2B founder/operator Instagram bio:
        - bio: Short, sharp bio (max 150 chars) signalling B2B / partnership readiness with a hook
        - hashtags: 15 B2B / industry / partnership hashtags
        - content_pillars: 4-5 content themes (case studies, partner wins, deal breakdowns, market insights)
        - cta: CTA for partnership inquiries
        - username_suggestions: 3 brand-aligned handles
      `,
      linkedin: `
        Generate a partnership-ready LinkedIn company/founder profile:
        - headline: Max 220 chars — clear positioning + partnership invitation (e.g. "Helping [ICP] achieve [outcome] | Open to JV & affiliate partners")
        - about: 2000-2600 chars — story, ICP, results, partnership angles, commission summary, social proof
        - cta: Professional CTA for booking a partnership call
        - username_suggestions: 3 vanity URL ideas
      `,
      tiktok: `
        Generate a B2B founder TikTok profile (founder-led brand):
        - bio: Max 80 chars — punchy, signal expertise + audience
        - hashtags: 10 niche B2B / industry hashtags
        - content_pillars: 3-4 content themes for B2B authority building
        - cta: CTA driving to partnership/case-study link
        - username_suggestions: 3 memorable handles
      `
    };

    const langMap: Record<string, string> = { ro: 'Romanian', en: 'English', ua: 'Ukrainian' };
    const outputLanguage = langMap[locale] || 'English';

    const systemPrompt = `You are a B2B brand strategist building partnership-ready social profiles for Dream 100 outreach.

Every profile must signal: clear ICP, proven results, partnership/commission readiness, founder-credibility.

RULES:
1. Write in ${outputLanguage}
2. Speak to potential PARTNERS (referrers, affiliates, JV partners) — not end customers
3. Lead with outcomes & numbers, never feature lists
4. Include partnership / commission language where the platform allows
5. Match platform tone (LinkedIn formal, IG/TikTok punchy, FB community)

${platformInstructions[platform] || platformInstructions.linkedin}`;

    const userPrompt = `Create a B2B partnership-ready ${platform.toUpperCase()} profile for this company:

OPERATOR / COMPANY: ${userName || 'B2B Operator'}

PARTNERSHIP OFFER:
- Ideal partner segment: ${offer.target_market || 'Not specified'}
- Pitch (SMV): ${offer.smv || 'Strategic partnership program'}
- Affiliate tier: ${offer.starter_package?.name || 'Affiliate'}
- Referral tier: ${offer.standard_package?.name || 'Referral'}
- JV tier: ${offer.premium_package?.name || 'Joint Venture'}

POSITIONING & ANGLES:
- Audience we serve: ${ikigaiResult.what_you_love?.join(', ') || 'B2B clients'}
- Our strengths: ${ikigaiResult.what_youre_good_at?.join(', ') || 'Operator expertise'}
- Market problem solved: ${ikigaiResult.what_world_needs?.join(', ') || 'Pipeline & conversion'}
- Core positioning: ${ikigaiResult.ikigai_statements?.slice(0, 2).map((s: any) => s.statement || s).join('; ') || 'Strategic operator'}

Generate the complete ${platform} profile now, optimized for partner discovery.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_profile",
              description: "Generate social media profile content",
              parameters: {
                type: "object",
                properties: {
                  bio: { 
                    type: "string", 
                    description: "Short bio text for the profile" 
                  },
                  headline: { 
                    type: "string", 
                    description: "Professional headline (LinkedIn)" 
                  },
                  about: { 
                    type: "string", 
                    description: "Detailed about/description section" 
                  },
                  hashtags: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Relevant hashtags for the platform" 
                  },
                  content_pillars: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Content themes to post about" 
                  },
                  cta: { 
                    type: "string", 
                    description: "Call to action text" 
                  },
                  username_suggestions: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Username/handle suggestions" 
                  }
                },
                required: ["bio", "cta"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_profile" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Insufficient credits. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("Invalid AI response format");
    }

    const profileData = JSON.parse(toolCall.function.arguments);

    try {
      const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const token = req.headers.get("Authorization")?.replace("Bearer ", "");
      let userId = null;
      if (token) { const { data } = await adminClient.auth.getUser(token); userId = data?.user?.id || null; }
      await adminClient.from("ai_outputs").insert({ user_id: userId, tool: "profile-builder", input_json: { platform, locale, userName }, output_json: profileData });
    } catch (e) { console.error("ai_outputs insert error:", e); }

    return new Response(
      JSON.stringify(profileData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Profile builder error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
