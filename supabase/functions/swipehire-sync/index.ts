import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  action: "register-user" | "sync-profile" | "sync-gig";
  user_id: string;
  email?: string;
  full_name?: string;
  profile?: Record<string, unknown>;
  gig?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get SwipeHire API credentials from secrets
    const swipehireApiKey = Deno.env.get("SWIPEHIRE_PLATFORM_KEY");
    const swipehireApiUrl = Deno.env.get("SWIPEHIRE_API_URL");

    if (!swipehireApiKey || !swipehireApiUrl) {
      console.error("Missing SwipeHire credentials");
      return new Response(
        JSON.stringify({ error: "SwipeHire integration not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user with their token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid auth token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const body: SyncRequest = await req.json();
    const { action } = body;

    // Use service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Common headers for SwipeHire API calls
    const swipehireHeaders = {
      "Content-Type": "application/json",
      "x-api-key": swipehireApiKey,
      "x-platform-origin": "freedom_os",
    };

    switch (action) {
      case "register-user": {
        // Register user in SwipeHire
        const registerPayload = {
          external_user_id: user.id,
          email: body.email || user.email,
          full_name: body.full_name || user.user_metadata?.full_name || user.email?.split("@")[0],
          platform: "freedom_os",
        };

        console.log("Registering user in SwipeHire:", registerPayload);

        const response = await fetch(`${swipehireApiUrl}/register-external-user`, {
          method: "POST",
          headers: swipehireHeaders,
          body: JSON.stringify(registerPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("SwipeHire register error:", data);
          return new Response(
            JSON.stringify({ error: data.error || "Failed to register with SwipeHire" }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Save swipehire_user_id to profile
        if (data.swipehire_user_id) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ swipehire_user_id: data.swipehire_user_id })
            .eq("id", user.id);

          if (updateError) {
            console.error("Error updating profile with swipehire_user_id:", updateError);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            swipehire_user_id: data.swipehire_user_id,
            status: data.status,
            message: data.message,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "sync-profile": {
        // Sync profile data to SwipeHire
        const syncPayload = {
          external_user_id: user.id,
          ...body.profile,
        };

        console.log("Syncing profile to SwipeHire:", syncPayload);

        const response = await fetch(`${swipehireApiUrl}/sync-profile-from-external`, {
          method: "POST",
          headers: swipehireHeaders,
          body: JSON.stringify(syncPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("SwipeHire sync-profile error:", data);
          return new Response(
            JSON.stringify({ error: data.error || "Failed to sync profile with SwipeHire" }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            ...data,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "sync-gig": {
        // Sync gig to SwipeHire
        const gigPayload = {
          external_user_id: user.id,
          gig: body.gig,
        };

        console.log("Syncing gig to SwipeHire:", gigPayload);

        const response = await fetch(`${swipehireApiUrl}/sync-gig-from-external`, {
          method: "POST",
          headers: swipehireHeaders,
          body: JSON.stringify(gigPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("SwipeHire sync-gig error:", data);
          return new Response(
            JSON.stringify({ error: data.error || "Failed to sync gig with SwipeHire" }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            ...data,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("SwipeHire sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
