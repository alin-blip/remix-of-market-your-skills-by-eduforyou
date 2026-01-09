import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
        Generate a professional Facebook business page profile with:
        - bio: Short description (max 255 chars) for the page intro
        - about: Detailed "About" section (300-500 words) covering services, experience, and value proposition
        - cta: A compelling call-to-action text for the page button
        - username_suggestions: 3 professional username ideas based on the person's niche
      `,
      instagram: `
        Generate an optimized Instagram bio with:
        - bio: Short, impactful bio (max 150 chars) with emoji, line breaks, and a hook
        - hashtags: 15 relevant hashtags for their niche (mix of popular and niche-specific)
        - content_pillars: 4-5 content themes they should post about
        - cta: A call-to-action for the link in bio
        - username_suggestions: 3 creative username ideas
      `,
      linkedin: `
        Generate a complete LinkedIn profile with:
        - headline: Professional headline (max 220 chars) that shows value proposition
        - about: Comprehensive "About" section (2000-2600 chars) with storytelling, achievements, and services
        - cta: A professional call-to-action for connecting
        - username_suggestions: 3 professional URL customization ideas
      `,
      tiktok: `
        Generate a TikTok creator profile with:
        - bio: Very short, catchy bio (max 80 chars) with personality
        - hashtags: 10 trending and niche hashtags for discoverability
        - content_pillars: 3-4 content themes/formats that work on TikTok
        - cta: A short call-to-action for the link in bio
        - username_suggestions: 3 catchy, memorable username ideas
      `
    };

    const systemPrompt = `You are an expert social media strategist and personal branding consultant.
Your task is to create optimized social media profile content based on the user's offer and unique value proposition.

IMPORTANT RULES:
1. Write in ${locale === 'ro' ? 'Romanian' : 'English'} language
2. Be specific to the user's niche and services
3. Make the content authentic and personality-driven
4. Focus on benefits and transformation, not features
5. Include relevant keywords for discoverability
6. Match the tone and style to the platform
7. Make usernames memorable and easy to spell

${platformInstructions[platform] || platformInstructions.instagram}`;

    const userPrompt = `Create a ${platform.toUpperCase()} profile for this freelancer:

NAME: ${userName || 'Freelancer'}

OFFER/SERVICES:
- Target Market: ${offer.target_market || 'Not specified'}
- Unique Value: ${offer.smv || 'Professional services'}
- Starter Package: ${offer.starter_package?.name || 'Basic service'}
- Standard Package: ${offer.standard_package?.name || 'Standard service'}
- Premium Package: ${offer.premium_package?.name || 'Premium service'}

IKIGAI/UNIQUE STRENGTHS:
- What they love: ${ikigaiResult.what_you_love?.join(', ') || 'Helping others'}
- What they're good at: ${ikigaiResult.what_youre_good_at?.join(', ') || 'Professional skills'}
- What the world needs: ${ikigaiResult.what_world_needs?.join(', ') || 'Quality services'}
- Key statements: ${ikigaiResult.ikigai_statements?.slice(0, 2).join('; ') || 'Professional freelancer'}

Generate the complete ${platform} profile content now.`;

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
