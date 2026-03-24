import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GigGeneratorRequest {
  package: {
    name: string;
    price: string;
    delivery_time: string;
    deliverables: string[];
  };
  skills: string[];
  ikigai?: {
    service_angles?: string[];
    target_market?: string;
  };
  type: 'gig' | 'job';
  locale?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input: GigGeneratorRequest = await req.json();
    const { package: pkg, skills, ikigai, type, locale = 'en' } = input;

    const isRomanian = locale === 'ro';

    const systemPrompt = isRomanian
      ? `Ești un expert în crearea de descrieri profesionale pentru gig-uri și job-uri pe platforme de freelancing.
         Generează o descriere convingătoare și profesională care va atrage clienți sau angajatori.
         Răspunde DOAR în format JSON valid.`
      : `You are an expert at creating professional gig and job descriptions for freelancing platforms.
         Generate a compelling, professional description that will attract clients or employers.
         Respond ONLY in valid JSON format.`;

    const userPrompt = isRomanian
      ? `Creează un ${type === 'gig' ? 'gig' : 'job posting'} bazat pe:
         
         Pachet: ${pkg.name}
         Preț: ${pkg.price}
         Livrare: ${pkg.delivery_time}
         Deliverables: ${pkg.deliverables?.join(', ')}
         Skills: ${skills.join(', ')}
         ${ikigai?.target_market ? `Target Market: ${ikigai.target_market}` : ''}
         ${ikigai?.service_angles?.length ? `Service Angles: ${ikigai.service_angles.join(', ')}` : ''}
         
         Returnează JSON:
         {
           "title": "titlu profesional scurt (max 60 caractere)",
           "description": "descriere detaliată (150-300 cuvinte) care evidențiază beneficiile pentru client",
           "category": "categoria potrivită: webDevelopment, design, marketing, writing, videoEditing, other",
           "suggested_skills": ["skill1", "skill2", "skill3"],
           "suggested_price_range": { "min": 100, "max": 200 }
         }`
      : `Create a ${type === 'gig' ? 'gig' : 'job posting'} based on:
         
         Package: ${pkg.name}
         Price: ${pkg.price}
         Delivery: ${pkg.delivery_time}
         Deliverables: ${pkg.deliverables?.join(', ')}
         Skills: ${skills.join(', ')}
         ${ikigai?.target_market ? `Target Market: ${ikigai.target_market}` : ''}
         ${ikigai?.service_angles?.length ? `Service Angles: ${ikigai.service_angles.join(', ')}` : ''}
         
         Return JSON:
         {
           "title": "short professional title (max 60 chars)",
           "description": "detailed description (150-300 words) highlighting client benefits",
           "category": "matching category: webDevelopment, design, marketing, writing, videoEditing, other",
           "suggested_skills": ["skill1", "skill2", "skill3"],
           "suggested_price_range": { "min": 100, "max": 200 }
         }`;

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://api.lovable.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    const result = JSON.parse(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gig-generator:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
