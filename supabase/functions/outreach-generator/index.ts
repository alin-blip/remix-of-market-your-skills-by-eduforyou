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
    const { offer, ikigaiResult, platform, locale } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const platformNames: Record<string, string> = {
      linkedin: "LinkedIn (conexiune/mesaj)",
      email: "Email (rece/cold email)",
      dm: "DM Instagram/Twitter"
    };

    const langMap: Record<string, string> = { ro: 'Romanian', en: 'English', ua: 'Ukrainian' };
    const outputLanguage = langMap[locale] || 'Romanian';

    const systemPrompt = `Ești un expert în copywriting și outreach pentru freelanceri. 
Creezi mesaje de outreach care convertesc, bazate pe oferta și poziționarea unică a clientului.

Regulile tale:
1. Mesajele trebuie să fie personalizabile (cu [NUME_CLIENT], [PROBLEMA_SPECIFICĂ], etc.)
2. Tonul trebuie să fie profesional dar accesibil
3. Fiecare mesaj trebuie să aibă un CTA clar
4. Mesajele trebuie să fie scurte și la obiect
5. Evită să fii "salesy" sau agresiv
6. Focus pe valoarea pe care o aduci, nu pe features

Pentru ${platformNames[platform] || platform}:
${platform === 'linkedin' ? '- Mesaj de conexiune (max 300 caractere) + Mesaj de follow-up' : ''}
${platform === 'email' ? '- Subject line puternic + Corp email structurat' : ''}
${platform === 'dm' ? '- Mesaj scurt și casual + Follow-up' : ''}

IMPORTANT: Write ALL content in ${outputLanguage}.
Răspunde DOAR prin tool call.`;

    const smv = offer?.smv || 'Servicii profesionale';
    const targetMarket = offer?.target_market || 'Business-uri mici';
    const starterPackage = offer?.starter_package?.name || 'Pachet starter';
    const serviceAngles = ikigaiResult?.service_angles?.map((a: any) => a.title).join(', ') || 'Servicii diverse';
    const corePositioning = ikigaiResult?.core_positioning || 'Expert în domeniu';

    const userPrompt = `Creează template-uri de outreach pentru ${platformNames[platform] || platform}:

**Propunere de valoare (SMV):** ${smv}

**Piața țintă:** ${targetMarket}

**Poziționare:** ${corePositioning}

**Servicii oferite:** ${serviceAngles}

**Ofertă de start:** ${starterPackage}

Generează 3 template-uri complete pentru ${platform}.`;

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
              name: "generate_outreach",
              description: "Returnează template-uri de outreach pentru platforma specificată",
              parameters: {
                type: "object",
                properties: {
                  platform: {
                    type: "string",
                    description: "Platforma pentru care sunt template-urile"
                  },
                  templates: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Numele template-ului (ex: Conexiune Inițială)" },
                        type: { 
                          type: "string", 
                          enum: ["connection", "intro", "follow_up", "value_add"],
                          description: "Tipul mesajului" 
                        },
                        subject: { 
                          type: "string", 
                          description: "Subject line (doar pentru email)" 
                        },
                        content: { 
                          type: "string", 
                          description: "Conținutul mesajului cu placeholdere [NUME_CLIENT], [COMPANIE], [PROBLEMA]" 
                        },
                        tips: {
                          type: "array",
                          items: { type: "string" },
                          description: "Sfaturi pentru personalizare"
                        },
                        best_time: {
                          type: "string",
                          description: "Cel mai bun moment pentru a trimite"
                        }
                      },
                      required: ["name", "type", "content", "tips"]
                    },
                    description: "Lista de 3 template-uri"
                  },
                  sequence_suggestion: {
                    type: "string",
                    description: "Sugestie pentru secvența de outreach (când să trimiți fiecare mesaj)"
                  },
                  response_rate_tips: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-4 sfaturi pentru a crește rata de răspuns"
                  }
                },
                required: ["platform", "templates", "sequence_suggestion", "response_rate_tips"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_outreach" } }
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
      throw new Error("Eroare la generarea template-urilor");
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
      await adminClient.from("ai_outputs").insert({ user_id: userId, tool: "outreach-generator", input_json: { platform, locale }, output_json: result });
    } catch (e) { console.error("ai_outputs insert error:", e); }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Outreach generator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Eroare necunoscută" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
