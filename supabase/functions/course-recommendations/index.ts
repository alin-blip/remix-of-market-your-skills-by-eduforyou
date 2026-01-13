import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // Fetch user profile with skills data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("study_field, interests, goals, projects_experience")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      throw new Error("Failed to fetch user profile");
    }

    // Fetch user skills
    const { data: userSkills } = await supabase
      .from("ai_outputs")
      .select("output")
      .eq("user_id", user.id)
      .eq("type", "skill_scan")
      .order("created_at", { ascending: false })
      .limit(1);

    // Fetch available courses
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id, title, description, level, provider, tags, recommended_for, course_type, requires_pro")
      .eq("is_published", true);

    if (coursesError) {
      throw new Error("Failed to fetch courses");
    }

    // Build user context
    const interests = profile?.interests || [];
    const goals = profile?.goals || [];
    const studyField = profile?.study_field || "";
    const experience = profile?.projects_experience || "";
    
    let skills: any[] = [];
    if (userSkills && userSkills.length > 0) {
      try {
        const skillData = userSkills[0].output;
        if (skillData && typeof skillData === 'object' && 'skills' in skillData) {
          skills = (skillData as any).skills || [];
        }
      } catch (e) {
        console.log("Could not parse skills:", e);
      }
    }

    const systemPrompt = `Ești un consilier educațional AI specializat în recomandări de cursuri personalizate. 
Analizează profilul utilizatorului și cursurile disponibile pentru a face recomandări relevante.

Reguli:
1. Recomandă cursuri care se potrivesc cu skill-urile, interesele și obiectivele utilizatorului
2. Prioritizează cursurile care ajută la dezvoltarea competențelor lipsă
3. Consideră nivelul de experiență al utilizatorului
4. Oferă explicații clare pentru fiecare recomandare
5. Returnează maxim 6 recomandări, ordonate după relevanță`;

    const userPrompt = `Profilul utilizatorului:
- Domeniu de studiu: ${studyField}
- Interese: ${JSON.stringify(interests)}
- Obiective: ${JSON.stringify(goals)}
- Experiență: ${experience}
- Skill-uri identificate: ${JSON.stringify(skills.map((s: any) => ({ name: s.name, category: s.category })))}

Cursuri disponibile:
${JSON.stringify(courses.map(c => ({
  id: c.id,
  title: c.title,
  description: c.description,
  level: c.level,
  provider: c.provider,
  tags: c.tags,
  recommended_for: c.recommended_for,
  type: c.course_type
})), null, 2)}

Analizează și recomandă cele mai relevante cursuri pentru acest utilizator.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
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
              name: "recommend_courses",
              description: "Returnează lista de cursuri recomandate cu explicații",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        course_id: { type: "string", description: "ID-ul cursului recomandat" },
                        reason: { type: "string", description: "De ce este recomandat acest curs (max 100 caractere)" },
                        match_score: { type: "number", description: "Scor de potrivire 0-100" },
                        skills_developed: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Skill-uri care vor fi dezvoltate"
                        }
                      },
                      required: ["course_id", "reason", "match_score", "skills_developed"],
                      additionalProperties: false
                    }
                  },
                  summary: { 
                    type: "string", 
                    description: "Rezumat scurt al recomandărilor (max 150 caractere)" 
                  }
                },
                required: ["recommendations", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "recommend_courses" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI Gateway error");
    }

    const aiResponse = await response.json();
    
    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "recommend_courses") {
      throw new Error("Invalid AI response");
    }

    const recommendationsData = JSON.parse(toolCall.function.arguments);
    
    // Enrich recommendations with course details
    const enrichedRecommendations = recommendationsData.recommendations.map((rec: any) => {
      const course = courses.find(c => c.id === rec.course_id);
      return {
        ...rec,
        course: course || null
      };
    }).filter((rec: any) => rec.course !== null);

    return new Response(JSON.stringify({
      recommendations: enrichedRecommendations,
      summary: recommendationsData.summary
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
