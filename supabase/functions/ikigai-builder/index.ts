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
    const body = await req.json();
    const { skills, studyField } = body;
    
    // Handle goals and values - could be array, string, or null
    const goalsText = Array.isArray(body.goals) ? body.goals.join(', ') : 
                      typeof body.goals === 'string' ? body.goals : '';
    const valuesText = Array.isArray(body.values) ? body.values.join(', ') : 
                       typeof body.values === 'string' ? body.values : '';
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Ești un expert în dezvoltarea carierei și poziționare personală pentru studenți.
Folosind conceptul Ikigai (intersecția între ce iubești, ce ești bun, ce are nevoie lumea și pentru ce poți fi plătit), 
creează o poziționare unică pentru student.

Analizează competențele și informațiile primite și generează:
1. What You Love - pasiuni și activități care aduc bucurie (bazat pe skills și interese)
2. What You're Good At - competențe și abilități principale
3. What The World Needs - probleme reale pe care le poate rezolva
4. What You Can Be Paid For - servicii și oferte monetizabile

Apoi generează:
- 3-5 Ikigai Statements - declarații puternice de poziționare
- 3-5 Service Angles - unghiuri unice pentru servicii

Răspunde DOAR prin tool call, nu text liber. Fii specific, acționabil și orientat spre rezultate.`;

    const skillsList = skills?.map((s: any) => `${s.skill} (${s.category})`).join(', ') || 'Nicio competență';
    
    const userPrompt = `Analizează profilul acestui student și creează Ikigai-ul său:

**Domeniul de studiu:** ${studyField || 'Nespecificat'}

**Competențe identificate:** ${skillsList}

**Obiective personale:** ${goalsText || 'Nespecificate'}

**Valori personale:** ${valuesText || 'Nespecificate'}

Generează un Ikigai complet și poziționare unică.`;

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
              name: "generate_ikigai",
              description: "Returnează Ikigai-ul complet al studentului",
              parameters: {
                type: "object",
                properties: {
                  what_you_love: {
                    type: "array",
                    items: { type: "string" },
                    description: "Ce iubești - pasiuni și activități"
                  },
                  what_youre_good_at: {
                    type: "array",
                    items: { type: "string" },
                    description: "La ce ești bun - competențe cheie"
                  },
                  what_world_needs: {
                    type: "array",
                    items: { type: "string" },
                    description: "Ce are nevoie lumea - probleme de rezolvat"
                  },
                  what_you_can_be_paid_for: {
                    type: "array",
                    items: { type: "string" },
                    description: "Pentru ce poți fi plătit - servicii"
                  },
                  ikigai_statements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        statement: { type: "string", description: "Declarația de poziționare" },
                        explanation: { type: "string", description: "Explicație scurtă" }
                      },
                      required: ["statement", "explanation"]
                    },
                    description: "Declarații puternice de poziționare Ikigai"
                  },
                  service_angles: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Titlul serviciului" },
                        description: { type: "string", description: "Descriere scurtă" },
                        target_audience: { type: "string", description: "Publicul țintă" },
                        unique_value: { type: "string", description: "Valoarea unică" }
                      },
                      required: ["title", "description", "target_audience", "unique_value"]
                    },
                    description: "Unghiuri unice pentru servicii monetizabile"
                  },
                  core_positioning: {
                    type: "string",
                    description: "Poziționarea principală într-o propoziție"
                  }
                },
                required: [
                  "what_you_love", 
                  "what_youre_good_at", 
                  "what_world_needs", 
                  "what_you_can_be_paid_for",
                  "ikigai_statements",
                  "service_angles",
                  "core_positioning"
                ],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_ikigai" } }
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
      throw new Error("Eroare la generarea Ikigai");
    }

    const data = await response.json();
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("Nu s-a primit răspuns valid de la AI");
    }

    const result = JSON.parse(toolCall.function.arguments);

    try {
      const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const token = req.headers.get("Authorization")?.replace("Bearer ", "");
      let userId = null;
      if (token) { const { data } = await adminClient.auth.getUser(token); userId = data?.user?.id || null; }
      await adminClient.from("ai_outputs").insert({ user_id: userId, tool: "ikigai-builder", input_json: { skills, studyField, goals: goalsText, values: valuesText }, output_json: result });
    } catch (e) { console.error("ai_outputs insert error:", e); }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Ikigai builder error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Eroare necunoscută" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
