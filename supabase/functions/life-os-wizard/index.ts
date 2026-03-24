import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LifeOSContext {
  profile: {
    goals: string[];
    values: string[];
    interests: string[];
    study_field?: string;
  };
  skills: Array<{
    skill: string;
    category: string;
    confidence: number;
  }>;
  ikigai?: {
    statements: string[];
    service_angles: string[];
  };
  offers?: {
    smv?: string;
    target_market?: string;
    packages: Array<{ name: string; price: string }>;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, areas, context, existingGoals, currentPeriod, customInstructions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";
    const instructionsAddendum = customInstructions 
      ? `\n\nADDITIONAL USER INSTRUCTIONS: ${customInstructions}` 
      : "";

    const contextSummary = buildContextSummary(context);

    switch (action) {
      case "annual_vision":
        systemPrompt = `You are a strategic life coach AI. Generate annual vision goals for the selected life areas.
Be specific, measurable, and inspiring. Consider the user's background, skills, and current positioning.
Return a JSON object with goals for each area.`;
        userPrompt = `Generate annual vision goals for ${new Date().getFullYear()} for these life areas: ${areas.join(", ")}.

User context:
${contextSummary}

Return a JSON object where each key is an area and value has: title, description, measurable_result.
Focus on ambitious but achievable goals that leverage the user's strengths.${instructionsAddendum}`;
        break;

      case "quarterly_milestones":
        systemPrompt = `You are a strategic planner AI. Break down annual goals into 90-day milestones.
Create concrete, actionable milestones that lead to the annual vision.`;
        userPrompt = `Create Q1 milestones for these annual goals:
${JSON.stringify(existingGoals, null, 2)}

Areas: ${areas.join(", ")}
Period: ${currentPeriod || "Q1"}

Return a JSON array with objects having: area_key, title, measurable_result.
Each milestone should be achievable in 90 days.${instructionsAddendum}`;
        break;

      case "monthly_goals":
        systemPrompt = `You are a tactical planner AI. Create monthly goals that support quarterly milestones.`;
        userPrompt = `Create monthly goals for ${currentPeriod || "January"} based on these quarterly milestones:
${JSON.stringify(existingGoals, null, 2)}

Areas: ${areas.join(", ")}

Return a JSON array with objects having: area_key, title, measurable_result.
Goals should be specific weekly-trackable objectives.${instructionsAddendum}`;
        break;

      case "weekly_sprint":
        systemPrompt = `You are a productivity coach AI. Plan a 7-day sprint with daily big tasks and small tasks.
Each day should have 1 big task (main focus, ~2-4 hours) and 3-4 small tasks (15-60 min each).
Make tasks specific and actionable.`;
        userPrompt = `Plan a weekly sprint for ${currentPeriod || "this week"} based on:

Monthly goals:
${JSON.stringify(existingGoals, null, 2)}

Active areas: ${areas.join(", ")}

User context:
${contextSummary}

Return a JSON object with:
- goal: string (week's main objective)
- days: object where keys are MON, TUE, WED, THU, FRI, SAT, SUN
  Each day has:
  - big_task: { title: string, area_key: string }
  - small_tasks: array of { title: string, area_key?: string }

Balance tasks across areas. Sunday is for planning/review.`;
        break;

      case "suggest_tasks":
        systemPrompt = `You are a productivity AI suggesting tasks based on context and goals.`;
        userPrompt = `Suggest 5 actionable tasks for ${currentPeriod || "today"}.

Goals: ${JSON.stringify(existingGoals, null, 2)}
Areas: ${areas.join(", ")}
Context: ${contextSummary}

Return a JSON array of { title: string, area_key: string, task_type: "big" | "small" }.`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

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
        temperature: 0.7,
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
        return new Response(JSON.stringify({ error: "API credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI generation failed");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Parse JSON from response
    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Life OS Wizard error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildContextSummary(context: LifeOSContext | undefined): string {
  if (!context) return "No context provided.";

  const parts: string[] = [];

  if (context.profile) {
    if (context.profile.study_field) {
      parts.push(`Field of study: ${context.profile.study_field}`);
    }
    if (context.profile.goals?.length) {
      parts.push(`Goals: ${context.profile.goals.join(", ")}`);
    }
    if (context.profile.values?.length) {
      parts.push(`Values: ${context.profile.values.join(", ")}`);
    }
    if (context.profile.interests?.length) {
      parts.push(`Interests: ${context.profile.interests.join(", ")}`);
    }
  }

  if (context.skills?.length) {
    const topSkills = context.skills
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
      .map((s) => `${s.skill} (${s.confidence}%)`)
      .join(", ");
    parts.push(`Top skills: ${topSkills}`);
  }

  if (context.ikigai) {
    if (context.ikigai.statements?.length) {
      parts.push(`Ikigai statements: ${context.ikigai.statements.slice(0, 2).join("; ")}`);
    }
    if (context.ikigai.service_angles?.length) {
      parts.push(`Service angles: ${context.ikigai.service_angles.slice(0, 2).join("; ")}`);
    }
  }

  if (context.offers) {
    if (context.offers.smv) {
      parts.push(`Value proposition: ${context.offers.smv}`);
    }
    if (context.offers.target_market) {
      parts.push(`Target market: ${context.offers.target_market}`);
    }
    if (context.offers.packages?.length) {
      const packages = context.offers.packages.map((p) => `${p.name}: ${p.price}`).join(", ");
      parts.push(`Packages: ${packages}`);
    }
  }

  return parts.join("\n");
}
