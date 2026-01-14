import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

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
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const zipFile = formData.get("file") as File;
    const courseId = formData.get("courseId") as string;

    if (!zipFile) {
      return new Response(
        JSON.stringify({ error: "No ZIP file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ZIP: ${zipFile.name}, size: ${zipFile.size} bytes`);

    // Read ZIP file
    const arrayBuffer = await zipFile.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const extractedFiles: {
      videos: { name: string; path: string; size: number }[];
      images: { name: string; path: string; publicUrl: string }[];
      documents: { name: string; path: string }[];
      thumbnail: string | null;
    } = {
      videos: [],
      images: [],
      documents: [],
      thumbnail: null
    };

    // Process each file in the ZIP
    const files = Object.keys(zip.files);
    console.log(`Found ${files.length} files in ZIP`);

    for (const filename of files) {
      const file = zip.files[filename];
      
      // Skip directories and macOS metadata
      if (file.dir || filename.startsWith("__MACOSX") || filename.includes(".DS_Store")) {
        continue;
      }

      const content = await file.async("uint8array");
      const lowerName = filename.toLowerCase();
      const baseName = filename.split("/").pop() || filename;
      
      // Determine file type and upload
      if (lowerName.match(/\.(mp4|mov|webm|avi|mkv)$/)) {
        // Video file
        const storagePath = courseId 
          ? `${courseId}/${baseName}`
          : `temp/${Date.now()}-${baseName}`;
        
        const { error } = await supabase.storage
          .from("course-videos")
          .upload(storagePath, content, {
            contentType: getContentType(lowerName),
            upsert: true
          });

        if (error) {
          console.error(`Error uploading video ${baseName}:`, error);
        } else {
          extractedFiles.videos.push({
            name: baseName,
            path: storagePath,
            size: content.length
          });
          console.log(`Uploaded video: ${baseName}`);
        }
      } else if (lowerName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        // Image file - likely thumbnail
        const storagePath = courseId
          ? `thumbnails/${courseId}/${baseName}`
          : `thumbnails/temp/${Date.now()}-${baseName}`;

        const { error } = await supabase.storage
          .from("vision-images")
          .upload(storagePath, content, {
            contentType: getContentType(lowerName),
            upsert: true
          });

        if (!error) {
          const { data: publicUrl } = supabase.storage
            .from("vision-images")
            .getPublicUrl(storagePath);

          extractedFiles.images.push({
            name: baseName,
            path: storagePath,
            publicUrl: publicUrl.publicUrl
          });

          // Use first image as thumbnail if not set
          if (!extractedFiles.thumbnail) {
            extractedFiles.thumbnail = publicUrl.publicUrl;
          }
          console.log(`Uploaded image: ${baseName}`);
        }
      } else if (lowerName.match(/\.(pdf|doc|docx|txt|md)$/)) {
        // Document file
        extractedFiles.documents.push({
          name: baseName,
          path: filename
        });
        console.log(`Found document: ${baseName}`);
      }
    }

    // Sort videos by name to maintain order
    extractedFiles.videos.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    console.log(`Extraction complete: ${extractedFiles.videos.length} videos, ${extractedFiles.images.length} images`);

    return new Response(
      JSON.stringify({
        success: true,
        extracted: extractedFiles
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing ZIP:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    md: "text/markdown"
  };
  return types[ext || ""] || "application/octet-stream";
}
