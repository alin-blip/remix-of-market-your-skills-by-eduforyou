import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Resource-safe limits (backend functions have strict memory/CPU quotas)
const MAX_ZIP_SIZE = 100 * 1024 * 1024; // 100MB (uploaded archive)
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // skip videos > 100MB inside ZIP
const MAX_TEXT_SIZE = 1 * 1024 * 1024; // 1MB for text-like files
const MAX_REQUEST_BYTES = MAX_ZIP_SIZE + 4 * 1024 * 1024; // multipart overhead buffer

// Additional guards against ZIP bombs / huge uncompressed payloads
const MAX_FILES = 500;
const MAX_TOTAL_UNCOMPRESSED = 300 * 1024 * 1024; // 300MB across all entries

// Helper function to extract text from simple PDFs (lightweight)
function extractTextFromPDF(content: Uint8Array): string {
  try {
    // Only process first 100KB of PDF for text extraction
    const slice = content.slice(0, 100 * 1024);
    const text = new TextDecoder("utf-8", { fatal: false }).decode(slice);
    const matches = text.match(/\((.*?)\)/g);
    if (matches && matches.length > 10) {
      return matches
        .slice(0, 100) // Limit matches
        .map((m) => m.slice(1, -1))
        .filter((t) => t.length > 1 && !/^[\\\/\d]+$/.test(t))
        .join(" ")
        .replace(/\\n/g, "\n")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 2000); // Limit output
    }
    return "";
  } catch {
    return "";
  }
}

// Extract course info from text content
function extractCourseInfo(
  documents: { name: string; content: string }[],
): {
  title: string | null;
  description: string | null;
  extractedFrom: string | null;
} {
  let title: string | null = null;
  let description: string | null = null;
  let extractedFrom: string | null = null;

  const titlePatterns = ["title", "name", "course"];
  const descPatterns = ["readme", "description", "overview", "about", "intro"];

  // Sort documents to prioritize title/description files
  const sorted = [...documents].sort((a, b) => {
    const aLower = a.name.toLowerCase();
    const bLower = b.name.toLowerCase();
    const aIsTitle = titlePatterns.some((p) => aLower.includes(p));
    const bIsTitle = titlePatterns.some((p) => bLower.includes(p));
    const aIsDesc = descPatterns.some((p) => aLower.includes(p));
    const bIsDesc = descPatterns.some((p) => bLower.includes(p));

    if (aIsTitle && !bIsTitle) return -1;
    if (bIsTitle && !aIsTitle) return 1;
    if (aIsDesc && !bIsDesc) return -1;
    if (bIsDesc && !aIsDesc) return 1;
    return 0;
  });

  for (const doc of sorted) {
    if (!doc.content || doc.content.trim().length === 0) continue;

    const lines = doc.content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) continue;

    const lowerName = doc.name.toLowerCase();

    if (!title) {
      if (titlePatterns.some((p) => lowerName.includes(p))) {
        title = lines[0].replace(/^#\s*/, "").trim();
        extractedFrom = doc.name;
      } else if (descPatterns.some((p) => lowerName.includes(p))) {
        const firstLine = lines[0].replace(/^#\s*/, "").trim();
        if (firstLine.length > 3 && firstLine.length < 150) {
          title = firstLine;
          extractedFrom = doc.name;
        }
      }
    }

    if (!description && descPatterns.some((p) => lowerName.includes(p))) {
      const descLines = title && lines[0].replace(/^#\s*/, "").trim() === title
        ? lines.slice(1)
        : lines;

      const descText = descLines.join("\n").slice(0, 1000).trim();
      if (descText.length > 20) {
        description = descText;
        if (!extractedFrom) extractedFrom = doc.name;
      }
    }

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
    txt: "text/plain",
    md: "text/markdown",
  };
  return types[ext || ""] || "application/octet-stream";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // IMPORTANT: guard before parsing multipart body (prevents WORKER_LIMIT on huge uploads)
    const contentLengthHeader = req.headers.get("content-length");
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : 0;
    if (contentLength && contentLength > MAX_REQUEST_BYTES) {
      return new Response(
        JSON.stringify({
          error: `ZIP too large for server-side extraction. Max ${(MAX_ZIP_SIZE / 1024 / 1024).toFixed(0)}MB.`,
          code: "FILE_TOO_LARGE",
          maxZipSizeMB: Math.floor(MAX_ZIP_SIZE / 1024 / 1024),
        }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const zipFile = formData.get("file") as File;
    const courseId = formData.get("courseId") as string;

    if (!zipFile) {
      return new Response(
        JSON.stringify({ error: "No ZIP file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Secondary check (in case content-length is missing)
    if (zipFile.size > MAX_ZIP_SIZE) {
      return new Response(
        JSON.stringify({
          error: `ZIP too large for server-side extraction. Max ${(MAX_ZIP_SIZE / 1024 / 1024).toFixed(0)}MB.`,
          code: "FILE_TOO_LARGE",
          maxZipSizeMB: Math.floor(MAX_ZIP_SIZE / 1024 / 1024),
        }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(
      `Processing ZIP: ${zipFile.name}, size: ${(zipFile.size / 1024 / 1024).toFixed(2)}MB`,
    );

    // Avoid extra buffer copies by passing File/Blob directly
    const zip = await JSZip.loadAsync(zipFile);

    const extractedFiles: {
      videos: { name: string; path: string; size: number }[];
      images: { name: string; path: string; publicUrl: string }[];
      documents: { name: string; path: string }[];
      thumbnail: string | null;
      courseInfo: { title: string | null; description: string | null; extractedFrom: string | null };
      skipped: { name: string; reason: string }[];
    } = {
      videos: [],
      images: [],
      documents: [],
      thumbnail: null,
      courseInfo: { title: null, description: null, extractedFrom: null },
      skipped: []
    };

    const documentContents: { name: string; content: string }[] = [];

    // Get file list and filter out directories/metadata
    const files = Object.keys(zip.files).filter((filename) => {
      const file = zip.files[filename];
      return !file.dir && !filename.startsWith("__MACOSX") && !filename.includes(".DS_Store");
    });

    console.log(`Found ${files.length} files to process`);

    if (files.length > MAX_FILES) {
      return new Response(
        JSON.stringify({
          error: `ZIP contains too many files (${files.length}). Please reduce it and try again.`,
          code: "TOO_MANY_FILES",
          maxFiles: MAX_FILES,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Process files one by one to minimize memory usage
    let totalEstimatedBytes = 0;

    for (const filename of files) {
      const file = zip.files[filename];
      const lowerName = filename.toLowerCase();
      const baseName = filename.split("/").pop() || filename;

      // Try to read uncompressed size from JSZip internals (avoids loading huge entries into memory)
      const estimatedBytes = Number((file as any)?._data?.uncompressedSize ?? 0);

      if (estimatedBytes > 0) {
        if (totalEstimatedBytes + estimatedBytes > MAX_TOTAL_UNCOMPRESSED) {
          extractedFiles.skipped.push({
            name: baseName,
            reason: `Total uncompressed content too large (>${Math.floor(MAX_TOTAL_UNCOMPRESSED / 1024 / 1024)}MB). Split the ZIP.`,
          });
          // Stop processing further files to prevent OOM/WORKER_LIMIT
          break;
        }
        totalEstimatedBytes += estimatedBytes;
      }

      try {
        if (lowerName.match(/\.(mp4|mov|webm|avi|mkv)$/)) {
          // Video file — skip by metadata size if available
          if (estimatedBytes > MAX_VIDEO_SIZE) {
            console.log(
              `Skipping large video (metadata): ${baseName} (${(estimatedBytes / 1024 / 1024).toFixed(2)}MB)`,
            );
            extractedFiles.skipped.push({
              name: baseName,
              reason: `Video too large (${(estimatedBytes / 1024 / 1024).toFixed(0)}MB). Upload individually.`,
            });
            continue;
          }

          // Load and check size (fallback)
          const content = await file.async("uint8array");

          if (content.length > MAX_VIDEO_SIZE) {
            console.log(
              `Skipping large video: ${baseName} (${(content.length / 1024 / 1024).toFixed(2)}MB)`,
            );
            extractedFiles.skipped.push({
              name: baseName,
              reason: `Video too large (${(content.length / 1024 / 1024).toFixed(0)}MB). Upload individually.`,
            });
            continue;
          }

          const storagePath = courseId
            ? `${courseId}/${baseName}`
            : `temp/${Date.now()}-${baseName}`;

          const { error } = await supabase.storage
            .from("course-videos")
            .upload(storagePath, content, {
              contentType: getContentType(lowerName),
              upsert: true,
            });

          if (error) {
            console.error(`Error uploading video ${baseName}:`, error.message);
            extractedFiles.skipped.push({ name: baseName, reason: error.message });
          } else {
            extractedFiles.videos.push({
              name: baseName,
              path: storagePath,
              size: content.length,
            });
            console.log(`Uploaded video: ${baseName}`);
          }
        } else if (lowerName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          // Image file
          const content = await file.async("uint8array");
          const storagePath = courseId
            ? `thumbnails/${courseId}/${baseName}`
            : `thumbnails/temp/${Date.now()}-${baseName}`;

          const { error } = await supabase.storage
            .from("vision-images")
            .upload(storagePath, content, {
              contentType: getContentType(lowerName),
              upsert: true,
            });

          if (!error) {
            const { data: publicUrl } = supabase.storage
              .from("vision-images")
              .getPublicUrl(storagePath);

            extractedFiles.images.push({
              name: baseName,
              path: storagePath,
              publicUrl: publicUrl.publicUrl,
            });

            if (!extractedFiles.thumbnail) {
              extractedFiles.thumbnail = publicUrl.publicUrl;
            }
            console.log(`Uploaded image: ${baseName}`);
          }
        } else if (lowerName.match(/\.(txt|md)$/)) {
          // Text file
          const textContent = await file.async("string");

          // Skip if too large, but still record it
          if (textContent.length > MAX_TEXT_SIZE) {
            console.log(`Skipping large text file: ${baseName}`);
            extractedFiles.documents.push({ name: baseName, path: filename });
            continue;
          }

          // Only keep first 5000 chars for course info extraction
          documentContents.push({
            name: baseName,
            content: textContent.slice(0, 5000),
          });
          extractedFiles.documents.push({ name: baseName, path: filename });
          console.log(`Read text: ${baseName}`);
        } else if (lowerName.match(/\.pdf$/)) {
          // PDF - only extract text from first part
          const pdfContent = await file.async("uint8array");

          // Skip text extraction for very large PDFs
          if (pdfContent.length <= MAX_TEXT_SIZE) {
            const extractedText = extractTextFromPDF(pdfContent);
            if (extractedText.length > 20) {
              documentContents.push({ name: baseName, content: extractedText });
            }
          }
          extractedFiles.documents.push({ name: baseName, path: filename });
        }
      } catch (fileError) {
        console.error(`Error processing ${baseName}:`, fileError);
        extractedFiles.skipped.push({
          name: baseName,
          reason: fileError instanceof Error ? fileError.message : "Processing error",
        });
      }
    }

    // Extract course info from documents
    if (documentContents.length > 0) {
      extractedFiles.courseInfo = extractCourseInfo(documentContents);
      if (extractedFiles.courseInfo.title) {
        console.log(`Extracted title: "${extractedFiles.courseInfo.title}"`);
      }
    }

    // Sort videos by name
    extractedFiles.videos.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    console.log(`Done: ${extractedFiles.videos.length} videos, ${extractedFiles.images.length} images, ${extractedFiles.skipped.length} skipped`);

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
