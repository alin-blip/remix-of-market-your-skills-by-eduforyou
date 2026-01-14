import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to extract text from simple PDFs
function extractTextFromPDF(content: Uint8Array): string {
  try {
    const text = new TextDecoder("utf-8", { fatal: false }).decode(content);
    // Extract text between parentheses (common PDF text encoding)
    const matches = text.match(/\((.*?)\)/g);
    if (matches && matches.length > 10) {
      return matches
        .map(m => m.slice(1, -1))
        .filter(t => t.length > 1 && !/^[\\\/\d]+$/.test(t))
        .join(' ')
        .replace(/\\n/g, '\n')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return '';
  } catch {
    return '';
  }
}

// Extract course info from text content
function extractCourseInfo(documents: { name: string; content: string }[]): { 
  title: string | null; 
  description: string | null; 
  extractedFrom: string | null;
} {
  let title: string | null = null;
  let description: string | null = null;
  let extractedFrom: string | null = null;

  // Priority order for title detection
  const titlePatterns = ['title', 'name', 'course'];
  const descPatterns = ['readme', 'description', 'overview', 'about', 'intro'];

  // Sort documents to prioritize title/description files
  const sorted = [...documents].sort((a, b) => {
    const aLower = a.name.toLowerCase();
    const bLower = b.name.toLowerCase();
    const aIsTitle = titlePatterns.some(p => aLower.includes(p));
    const bIsTitle = titlePatterns.some(p => bLower.includes(p));
    const aIsDesc = descPatterns.some(p => aLower.includes(p));
    const bIsDesc = descPatterns.some(p => bLower.includes(p));
    
    if (aIsTitle && !bIsTitle) return -1;
    if (bIsTitle && !aIsTitle) return 1;
    if (aIsDesc && !bIsDesc) return -1;
    if (bIsDesc && !aIsDesc) return 1;
    return 0;
  });

  for (const doc of sorted) {
    if (!doc.content || doc.content.trim().length === 0) continue;
    
    const lines = doc.content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) continue;
    
    const lowerName = doc.name.toLowerCase();
    
    // Try to extract title
    if (!title) {
      // Check if this is a title-specific file
      if (titlePatterns.some(p => lowerName.includes(p))) {
        title = lines[0].replace(/^#\s*/, '').trim();
        extractedFrom = doc.name;
      } else if (descPatterns.some(p => lowerName.includes(p))) {
        // First line of readme/about could be title
        const firstLine = lines[0].replace(/^#\s*/, '').trim();
        if (firstLine.length > 3 && firstLine.length < 150) {
          title = firstLine;
          extractedFrom = doc.name;
        }
      }
    }
    
    // Try to extract description
    if (!description && descPatterns.some(p => lowerName.includes(p))) {
      // Skip the first line if we used it as title
      const descLines = title && lines[0].replace(/^#\s*/, '').trim() === title 
        ? lines.slice(1) 
        : lines;
      
      // Get first 1000 characters as description
      const descText = descLines.join('\n').slice(0, 1000).trim();
      if (descText.length > 20) {
        description = descText;
        if (!extractedFrom) extractedFrom = doc.name;
      }
    }
    
    // Stop if we have both
    if (title && description) break;
  }

  return { title, description, extractedFrom };
}

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
      courseInfo: { title: string | null; description: string | null; extractedFrom: string | null };
    } = {
      videos: [],
      images: [],
      documents: [],
      thumbnail: null,
      courseInfo: { title: null, description: null, extractedFrom: null }
    };

    // Temporary storage for document contents
    const documentContents: { name: string; content: string }[] = [];

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
      } else if (lowerName.match(/\.(txt|md)$/)) {
        // Text/Markdown file - read content
        try {
          const textContent = await file.async("string");
          documentContents.push({ name: baseName, content: textContent });
          extractedFiles.documents.push({
            name: baseName,
            path: filename
          });
          console.log(`Read text document: ${baseName} (${textContent.length} chars)`);
        } catch (e) {
          console.error(`Error reading text file ${baseName}:`, e);
        }
      } else if (lowerName.match(/\.pdf$/)) {
        // PDF file - try to extract text
        try {
          const pdfContent = await file.async("uint8array");
          const extractedText = extractTextFromPDF(pdfContent);
          if (extractedText.length > 20) {
            documentContents.push({ name: baseName, content: extractedText });
            console.log(`Extracted PDF text: ${baseName} (${extractedText.length} chars)`);
          }
          extractedFiles.documents.push({
            name: baseName,
            path: filename
          });
        } catch (e) {
          console.error(`Error reading PDF ${baseName}:`, e);
        }
      } else if (lowerName.match(/\.(doc|docx)$/)) {
        // Word documents - just list them (would need special parsing)
        extractedFiles.documents.push({
          name: baseName,
          path: filename
        });
        console.log(`Found document: ${baseName}`);
      }
    }

    // Extract course info from documents
    if (documentContents.length > 0) {
      extractedFiles.courseInfo = extractCourseInfo(documentContents);
      if (extractedFiles.courseInfo.title) {
        console.log(`Extracted title: "${extractedFiles.courseInfo.title}" from ${extractedFiles.courseInfo.extractedFrom}`);
      }
      if (extractedFiles.courseInfo.description) {
        console.log(`Extracted description (${extractedFiles.courseInfo.description.length} chars)`);
      }
    }

    // Sort videos by name to maintain order
    extractedFiles.videos.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    console.log(`Extraction complete: ${extractedFiles.videos.length} videos, ${extractedFiles.images.length} images, ${documentContents.length} text documents`);

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
