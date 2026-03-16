import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  platform: 'fiverr' | 'upwork' | 'freelancer' | 'swipehire';
  skills: string[];
  category: string;
  experience?: string;
  targetMarket?: string;
}

const platformPrompts: Record<string, string> = {
  fiverr: `You are an expert Fiverr gig optimizer. Create a compelling Fiverr gig based on the user's skills.

Return a JSON object with:
- title: Catchy gig title (max 80 characters, must start with "I will")
- description: Engaging description with emojis and clear value proposition (max 1200 chars)
- tags: Array of 5 SEO-optimized tags
- packages: Object with basic, standard, premium packages (each has name, price in EUR, delivery_days, description, features array)
- faqs: Array of 3 common FAQs with question and answer

Make it student-friendly and highlight enthusiasm and fresh perspective.`,

  upwork: `You are an expert Upwork profile and proposal writer. Create professional content based on the user's skills.

Return a JSON object with:
- profileTitle: Professional headline (max 70 chars)
- profileOverview: Compelling overview that highlights skills and value (max 500 chars)
- hourlyRate: Suggested hourly rate in EUR for a student/entry-level professional
- proposalTemplate: A customizable proposal template for bidding on projects
- portfolioIdeas: Array of 3 portfolio project ideas they could create
- keySkillsToHighlight: Array of 5 skills to feature prominently

Focus on professionalism while acknowledging they're building experience.`,

  freelancer: `You are an expert Freelancer.com bidding strategist. Create competitive content based on the user's skills.

Return a JSON object with:
- profileHeadline: Attention-grabbing headline (max 60 chars)
- profileSummary: Brief but impactful summary (max 400 chars)
- bidTemplate: A template for competitive project bids
- pricingStrategy: Object with lowBid, averageBid, premiumBid suggestions in EUR
- winningTips: Array of 5 tips for winning projects on Freelancer.com

Emphasize competitive advantages for someone new to the platform.`,

  swipehire: `You are an expert at creating service listings for SwipeHire, a platform connecting students with opportunities.

Return a JSON object with:
- title: Clear, professional title (max 60 chars)
- description: Friendly, approachable description highlighting student perspective (max 800 chars)
- priceRange: Object with min and max in EUR
- deliverables: Array of 5 clear deliverables
- idealClient: Description of the ideal client for this service

Focus on the unique value a student brings: fresh ideas, current knowledge, enthusiasm.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, skills, category, experience, targetMarket, locale } = await req.json() as GenerateRequest & { locale?: string };

    const langMap: Record<string, string> = { ro: 'Romanian', en: 'English', ua: 'Ukrainian' };
    const outputLanguage = langMap[locale || 'ro'] || 'Romanian';

    if (!platform || !skills || skills.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Platform and skills are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = platformPrompts[platform] || platformPrompts.swipehire;

    const userPrompt = `Create optimized ${platform} content for a freelancer with these details:

Skills: ${skills.join(', ')}
Category: ${category || 'General'}
Experience: ${experience || 'Student/Entry-level'}
Target Market: ${targetMarket || 'Small businesses and startups'}

Generate platform-specific content that will help them succeed. IMPORTANT: Write ALL content in ${outputLanguage}. Return valid JSON only.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Student Freedom OS',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      throw new Error('Failed to generate content');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      parsedContent = { rawContent: content };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        platform,
        content: parsedContent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in gig-platform-generator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate content';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
