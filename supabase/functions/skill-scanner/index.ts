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
    const body = await req.json();
    const { experiences, studyField } = body;
    
    // Handle interests - could be array, string, or null
    let interestsText = '';
    if (Array.isArray(body.interests)) {
      interestsText = body.interests.join(', ');
    } else if (typeof body.interests === 'string') {
      interestsText = body.interests;
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Ești un expert în analiza competențelor pentru studenți care doresc să monetizeze abilitățile lor ca freelanceri sau antreprenori.

Analizează informațiile primite și identifică:
1. Competențe tehnice (hard skills) - extrase din experiențe și domeniu de studiu
2. Competențe soft (soft skills) - deduse din experiențe și interese
3. Competențe ascunse/emergente - potențial neexplorat bazat pe combinația unică de abilități

Pentru fiecare competență, oferă:
- Numele competenței
- Categoria (technical/soft/hidden)
- Nivel de încredere estimat (1-5)
- Descriere scurtă și acționabilă
- Potențial de monetizare (low/medium/high)

Răspunde DOAR prin tool call, nu text liber.`;

    const userPrompt = `Analizează profilul acestui student:

**Domeniul de studiu:** ${studyField || 'Nespecificat'}

**Experiențe și proiecte:**
${experiences || 'Nicio experiență specificată'}

**Interese și hobby-uri:**
${interestsText || 'Niciun interes specificat'}

Identifică toate competențele monetizabile.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_skills",
              description: "Returnează lista de competențe identificate",
              parameters: {
                type: "object",
                properties: {
                  skills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Numele competenței" },
                        category: { 
                          type: "string", 
                          enum: ["technical", "soft", "hidden"],
                          description: "Categoria competenței" 
                        },
                        confidence: { 
                          type: "number", 
                          minimum: 1, 
                          maximum: 5,
                          description: "Nivelul de încredere 1-5" 
                        },
                        description: { type: "string", description: "Descriere scurtă" },
                        monetization_potential: { 
                          type: "string", 
                          enum: ["low", "medium", "high"],
                          description: "Potențialul de monetizare" 
                        }
                      },
                      required: ["name", "category", "confidence", "description", "monetization_potential"],
                      additionalProperties: false
                    }
                  },
                  summary: {
                    type: "string",
                    description: "Un rezumat scurt al profilului de competențe"
                  },
                  top_recommendation: {
                    type: "string",
                    description: "Recomandarea principală pentru monetizare"
                  }
                },
                required: ["skills", "summary", "top_recommendation"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_skills" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limită de cereri depășită. Încearcă din nou în câteva secunde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credite insuficiente. Contactează administratorul." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Eroare la analiza competențelor");
    }

    const data = await response.json();
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("Nu s-a primit răspuns valid de la AI");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Skill scanner error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Eroare necunoscută" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
