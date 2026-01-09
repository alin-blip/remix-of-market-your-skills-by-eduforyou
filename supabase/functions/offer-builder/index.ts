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
    const { skills, ikigaiResult, studyField, locale } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const currency = locale === 'ro' ? 'RON' : 'EUR';
    const priceMultiplier = locale === 'ro' ? 1 : 0.2; // Adjust for EUR

    const systemPrompt = `Ești un expert în pricing și crearea ofertelor de servicii pentru studenți care vor să-și monetizeze abilitățile.

Bazat pe Ikigai-ul și competențele studentului, creează 3 pachete de servicii cu prețuri strategice.

Regulile de pricing:
- Starter: Pachet de intrare accesibil, livrare rapidă (1-3 zile)
- Standard: Valoare excelentă pentru preț, livrare medie (5-7 zile)  
- Premium: Serviciu complet cu suport extins, livrare premium (7-14 zile)

Prețurile trebuie să fie în ${currency} și adaptate pentru piața ${locale === 'ro' ? 'română' : 'europeană'}.
Pentru studenți, prețurile starter încep de la ${locale === 'ro' ? '150-300 RON' : '30-60 EUR'}.

Fii specific cu livrabilele și include metrici concrete.
Răspunde DOAR prin tool call, nu text liber.`;

    const skillsList = skills?.map((s: any) => `${s.skill} (${s.category}, ${s.confidence}% încredere)`).join(', ') || 'Nicio competență';
    const serviceAngles = ikigaiResult?.service_angles?.map((a: any) => a.title).join(', ') || 'Nespecificate';
    const corePositioning = ikigaiResult?.core_positioning || 'Nespecificat';
    const whatCanBePaidFor = ikigaiResult?.what_you_can_be_paid_for?.join(', ') || 'Nespecificat';

    const userPrompt = `Creează oferta de servicii pentru acest student:

**Poziționare Ikigai:** ${corePositioning}

**Competențe:** ${skillsList}

**Pentru ce poate fi plătit:** ${whatCanBePaidFor}

**Unghiuri de servicii sugerate:** ${serviceAngles}

**Domeniu de studiu:** ${studyField || 'Nespecificat'}

Generează 3 pachete de servicii cu prețuri în ${currency}, SMV (Simple Mega Value), și justificarea prețurilor.`;

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
              name: "generate_offer",
              description: "Returnează oferta completă cu pachete de servicii",
              parameters: {
                type: "object",
                properties: {
                  smv: {
                    type: "string",
                    description: "Simple Mega Value - o propoziție puternică care rezumă valoarea unică oferită"
                  },
                  target_market: {
                    type: "string",
                    description: "Piața țintă ideală pentru aceste servicii"
                  },
                  pricing_justification: {
                    type: "string",
                    description: "Explicație scurtă de ce prețurile sunt justificate"
                  },
                  starter_package: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Numele pachetului" },
                      tagline: { type: "string", description: "Slogan scurt și atractiv" },
                      price: { type: "number", description: "Prețul în moneda locală" },
                      currency: { type: "string", description: "RON sau EUR" },
                      delivery_time: { type: "string", description: "Timp de livrare" },
                      deliverables: {
                        type: "array",
                        items: { type: "string" },
                        description: "Lista livrabilelor incluse"
                      },
                      ideal_for: { type: "string", description: "Pentru cine este ideal" }
                    },
                    required: ["name", "tagline", "price", "currency", "delivery_time", "deliverables", "ideal_for"]
                  },
                  standard_package: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Numele pachetului" },
                      tagline: { type: "string", description: "Slogan scurt și atractiv" },
                      price: { type: "number", description: "Prețul în moneda locală" },
                      currency: { type: "string", description: "RON sau EUR" },
                      delivery_time: { type: "string", description: "Timp de livrare" },
                      deliverables: {
                        type: "array",
                        items: { type: "string" },
                        description: "Lista livrabilelor incluse"
                      },
                      ideal_for: { type: "string", description: "Pentru cine este ideal" },
                      popular: { type: "boolean", description: "Marchează ca popular/recomandat" }
                    },
                    required: ["name", "tagline", "price", "currency", "delivery_time", "deliverables", "ideal_for"]
                  },
                  premium_package: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Numele pachetului" },
                      tagline: { type: "string", description: "Slogan scurt și atractiv" },
                      price: { type: "number", description: "Prețul în moneda locală" },
                      currency: { type: "string", description: "RON sau EUR" },
                      delivery_time: { type: "string", description: "Timp de livrare" },
                      deliverables: {
                        type: "array",
                        items: { type: "string" },
                        description: "Lista livrabilelor incluse"
                      },
                      ideal_for: { type: "string", description: "Pentru cine este ideal" },
                      includes_support: { type: "boolean", description: "Include suport extins" }
                    },
                    required: ["name", "tagline", "price", "currency", "delivery_time", "deliverables", "ideal_for"]
                  }
                },
                required: [
                  "smv",
                  "target_market", 
                  "pricing_justification",
                  "starter_package",
                  "standard_package",
                  "premium_package"
                ],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_offer" } }
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
      throw new Error("Eroare la generarea ofertei");
    }

    const data = await response.json();
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("Nu s-a primit răspuns valid de la AI");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Offer builder error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Eroare necunoscută" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
