import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisionImageRequest {
  area_key: string;
  area_name: string;
  annual_goal: string;
  description?: string;
  locale?: string;
  user_id: string;
  goal_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { area_key, area_name, annual_goal, description, locale = 'en', user_id, goal_id }: VisionImageRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    if (!user_id || !goal_id) {
      throw new Error("user_id and goal_id are required");
    }

    // Create Supabase client for storage operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create a detailed vision board prompt based on the area and goal
    const areaPrompts: Record<string, string> = {
      business: "professional business achievement, luxury office, wealth symbols, entrepreneur success, gold accents, modern business aesthetic",
      body: "fit healthy body, athletic achievement, gym equipment, healthy food, vitality, fitness goals, health transformation",
      mind: "intellectual growth, books, meditation, brain power, learning, wisdom, mental clarity, academic success",
      relationships: "happy family, loving relationships, friendship, connection, warmth, togetherness, emotional bonds",
      spirituality: "spiritual awakening, meditation, cosmic energy, inner peace, mindfulness, transcendence, sacred geometry",
      finance: "financial freedom, wealth accumulation, investment success, money growth, prosperity, luxury lifestyle",
      fun: "adventure, joy, entertainment, hobbies, travel, excitement, leisure activities, happiness",
    };

    const areaStyle = areaPrompts[area_key] || "success, achievement, personal growth";

    const prompt = `Create a vision board collage image for "${area_name}" life area. 
The main goal is: "${annual_goal}". 
${description ? `Additional context: ${description}.` : ''}
Style: ${areaStyle}. 
Make it inspiring, aspirational, photorealistic collage with multiple images representing success and achievement in this area. 
Include motivational elements, luxury aesthetics, and symbols of accomplishment. 
The image should be visually stunning and inspire action. 
High quality, detailed, cinematic lighting. 16:9 aspect ratio vision board style.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
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
      throw new Error("Failed to generate vision image");
    }

    const data = await response.json();
    console.log("AI Response structure:", JSON.stringify(data, null, 2).substring(0, 500));
    
    // Try multiple paths to find the image
    let imageDataUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    // Alternative path: some models return content as array with image parts
    if (!imageDataUrl && data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content;
      if (Array.isArray(content)) {
        const imagePart = content.find((part: any) => part.type === 'image_url' || part.type === 'image');
        imageDataUrl = imagePart?.image_url?.url || imagePart?.url;
      }
    }
    
    // Try inline_data format (Gemini format)
    if (!imageDataUrl && data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content;
      if (Array.isArray(content)) {
        const imagePart = content.find((part: any) => part.inline_data);
        if (imagePart?.inline_data) {
          const mimeType = imagePart.inline_data.mime_type || 'image/png';
          imageDataUrl = `data:${mimeType};base64,${imagePart.inline_data.data}`;
        }
      }
    }

    if (!imageDataUrl) {
      console.error("Full response data:", JSON.stringify(data));
      throw new Error("No image generated - check response format");
    }

    // Extract base64 data from data URL
    const base64Match = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image data format");
    }

    const imageFormat = base64Match[1];
    const base64Data = base64Match[2];
    
    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Generate unique filename
    const fileName = `${user_id}/${goal_id}-${Date.now()}.${imageFormat}`;

    // Upload to storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vision-images')
      .upload(fileName, bytes, {
        contentType: `image/${imageFormat}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error("Failed to upload image to storage");
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('vision-images')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    // Update the goal with the new image URL
    const { error: updateError } = await supabase
      .from('life_goals')
      .update({ vision_image_url: publicUrl })
      .eq('id', goal_id)
      .eq('user_id', user_id);

    if (updateError) {
      console.error("Goal update error:", updateError);
      throw new Error("Failed to update goal with image URL");
    }

    // Log to ai_outputs
    try {
      await supabase.from("ai_outputs").insert({ user_id: user_id, tool: "vision-image-generator", input_json: { area_key, area_name, annual_goal }, output_json: { image_url: publicUrl } });
    } catch (e) { console.error("ai_outputs insert error:", e); }

    return new Response(
      JSON.stringify({ image_url: publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Vision image generator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
