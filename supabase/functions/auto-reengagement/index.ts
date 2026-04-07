import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://venture-stride-kit.lovable.app";
const LOGO_URL =
  "https://fdjzjqkiuxygiemqyfim.supabase.co/storage/v1/object/public/email-assets/logo.png";

const EXCLUDED_DOMAINS = [
  "@rowarrior",
  "@eduforyou",
  "@pluux",
  "@icloud",
  "@lovable",
];

// Get current ISO week number
function getIsoWeek(date: Date): string {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

interface Suggestion {
  emoji: string;
  title: string;
  description: string;
  cta: string;
  url: string;
}

function buildSuggestions(activity: {
  hasAiOutputs: boolean;
  hasDream100: boolean;
  hasOffers: boolean;
  hasOutreach: boolean;
  hasSkillScan: boolean;
}): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (!activity.hasSkillScan) {
    suggestions.push({
      emoji: "🔍",
      title: "Skill Scanner",
      description:
        "Descoperă-ți abilitățile ascunse și vezi cum poți să le monetizezi. Durează sub 5 minute.",
      cta: "Scanează-ți skillurile →",
      url: `${SITE_URL}/wizard/skill-scanner`,
    });
  }

  if (!activity.hasDream100) {
    suggestions.push({
      emoji: "🎯",
      title: "Dream 100 Scanner",
      description:
        "Scanează piața și identifică cei mai buni 100 de clienți potențiali pentru serviciile tale.",
      cta: "Descoperă clienți ideali →",
      url: `${SITE_URL}/dream100/scanner`,
    });
  }

  if (!activity.hasOffers) {
    suggestions.push({
      emoji: "💰",
      title: "Offer Builder",
      description:
        "Creează o ofertă premium irezistibilă în doar 3 minute. Include pachete Starter, Standard și Premium.",
      cta: "Creează o ofertă premium →",
      url: `${SITE_URL}/wizard/offer-builder`,
    });
  }

  if (!activity.hasOutreach) {
    suggestions.push({
      emoji: "📩",
      title: "Outreach Generator",
      description:
        "Generează mesaje personalizate de outreach care chiar primesc răspunsuri. LinkedIn, email, cold DM.",
      cta: "Generează mesaje de outreach →",
      url: `${SITE_URL}/wizard/outreach-generator`,
    });
  }

  if (!activity.hasAiOutputs) {
    suggestions.push({
      emoji: "📚",
      title: "Secțiunea Learn",
      description:
        "Învață strategii noi de freelancing, vânzări și creștere. Cursuri video pas cu pas.",
      cta: "Începe să înveți →",
      url: `${SITE_URL}/learning-hub`,
    });
  }

  // Return top 3 most relevant
  return suggestions.slice(0, 3);
}

function buildEmailHtml(name: string, suggestions: Suggestion[]): string {
  const suggestionsHtml = suggestions
    .map(
      (s) => `
    <tr>
      <td style="padding: 16px 20px; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 12px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="font-size: 20px; padding-right: 12px; vertical-align: top; width: 32px;">${s.emoji}</td>
            <td>
              <p style="margin: 0 0 6px; font-size: 16px; font-weight: 700; color: #1a1a2e;">${s.title}</p>
              <p style="margin: 0 0 12px; font-size: 14px; color: #555; line-height: 1.5;">${s.description}</p>
              <a href="${s.url}" style="display: inline-block; padding: 10px 20px; background-color: #d4af37; color: #1a1a2e; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 6px;">${s.cta}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height: 12px;"></td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f4;">
<tr><td align="center" style="padding:20px 10px;">
<table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
  <!-- Header -->
  <tr>
    <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 30px; text-align: center;">
      <img src="${LOGO_URL}" alt="SkillMarket" width="160" style="display:block;margin:0 auto 16px;" />
      <h1 style="margin:0;color:#d4af37;font-size:22px;font-weight:700;">${name}, nu lăsa oportunitățile să treacă pe lângă tine 🎯</h1>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding: 30px;">
      <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 20px;">
        Am observat că nu ai mai intrat pe platformă de ceva timp. 
        <strong>Contul tău e activ</strong> și ai acces la toate uneltele — dar nu le folosești încă.
      </p>

      <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 8px;">
        <strong>Iată ce poți face chiar acum:</strong>
      </p>

      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 16px 0;">
        ${suggestionsHtml}
      </table>

      <!-- Social Proof -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
        <tr>
          <td style="padding: 16px 20px; background-color: #1a1a2e; border-radius: 8px; border-left: 4px solid #d4af37;">
            <p style="margin: 0 0 4px; font-size: 13px; color: #d4af37; font-weight: 700;">📊 REZULTATE REALE</p>
            <p style="margin: 0; font-size: 14px; color: #ffffff; line-height: 1.5;">
              7 profesioniști au construit oferte premium în sub 30 de minute pe SkillMarket. 
              Gabriela A. a creat o ofertă HoReCa de 3.500 RON în 12 minute.
            </p>
          </td>
        </tr>
      </table>

      <!-- Main CTA -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <a href="${SITE_URL}/wizard/skill-scanner" style="display:inline-block;padding:14px 32px;background-color:#d4af37;color:#1a1a2e;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px;">
              🚀 Revino pe platformă acum
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size:13px;color:#999;line-height:1.5;margin:20px 0 0;text-align:center;">
        Nu mai doriți aceste emailuri? Răspundeți la acest email și vă scoatem din listă.
      </p>
    </td>
  </tr>
</table>
</td></tr></table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const isoWeek = getIsoWeek(new Date());
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    // 1. Get all profiles with email
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .not("email", "is", null);

    if (profilesError) throw profilesError;
    if (!profiles?.length) {
      return new Response(
        JSON.stringify({ enqueued: 0, reason: "no_profiles" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter out internal domains
    const eligibleProfiles = profiles.filter((p) => {
      if (!p.email) return false;
      const emailLower = p.email.toLowerCase();
      return !EXCLUDED_DOMAINS.some((d) => emailLower.includes(d));
    });

    // 2. Get suppressed emails
    const { data: suppressed } = await supabase
      .from("suppressed_emails")
      .select("email");
    const suppressedSet = new Set(
      (suppressed || []).map((s) => s.email.toLowerCase())
    );

    // Filter out suppressed
    const activeProfiles = eligibleProfiles.filter(
      (p) => !suppressedSet.has(p.email!.toLowerCase())
    );

    if (!activeProfiles.length) {
      return new Response(
        JSON.stringify({ enqueued: 0, reason: "all_filtered" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userIds = activeProfiles.map((p) => p.id);

    // 3. Check recent activity across tables (last 7 days)
    const { data: recentAiOutputs } = await supabase
      .from("ai_outputs")
      .select("user_id")
      .in("user_id", userIds)
      .gte("created_at", sevenDaysAgo);

    const { data: recentDream100 } = await supabase
      .from("dream100_targets")
      .select("user_id")
      .in("user_id", userIds)
      .gte("updated_at", sevenDaysAgo);

    // 4. Build sets of recently active users
    const recentlyActiveIds = new Set<string>();
    for (const row of recentAiOutputs || []) {
      if (row.user_id) recentlyActiveIds.add(row.user_id);
    }
    for (const row of recentDream100 || []) {
      if (row.user_id) recentlyActiveIds.add(row.user_id);
    }

    // Inactive = NOT recently active
    const inactiveProfiles = activeProfiles.filter(
      (p) => !recentlyActiveIds.has(p.id)
    );

    if (!inactiveProfiles.length) {
      return new Response(
        JSON.stringify({ enqueued: 0, reason: "no_inactive_users" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Check what each inactive user has EVER done (for personalization)
    const inactiveIds = inactiveProfiles.map((p) => p.id);

    const [
      { data: allAiOutputs },
      { data: allDream100 },
      { data: allOffers },
      { data: allOutreach },
    ] = await Promise.all([
      supabase
        .from("ai_outputs")
        .select("user_id, tool")
        .in("user_id", inactiveIds),
      supabase
        .from("dream100_targets")
        .select("user_id")
        .in("user_id", inactiveIds),
      supabase.from("offers").select("user_id").in("user_id", inactiveIds),
      supabase
        .from("outreach_sequences")
        .select("user_id")
        .in("user_id", inactiveIds),
    ]);

    // Build per-user activity maps
    const userToolsMap = new Map<string, Set<string>>();
    for (const row of allAiOutputs || []) {
      if (!row.user_id) continue;
      if (!userToolsMap.has(row.user_id))
        userToolsMap.set(row.user_id, new Set());
      userToolsMap.get(row.user_id)!.add(row.tool);
    }

    const hasDream100Set = new Set(
      (allDream100 || []).map((r) => r.user_id)
    );
    const hasOffersSet = new Set((allOffers || []).map((r) => r.user_id));
    const hasOutreachSet = new Set(
      (allOutreach || []).map((r) => r.user_id)
    );

    // 6. Check already sent this week (idempotency via email_send_log)
    const { data: alreadySent } = await supabase
      .from("email_send_log")
      .select("message_id")
      .like("message_id", `reengagement-7d-%-${isoWeek}`)
      .eq("status", "sent");
    const alreadySentIds = new Set(
      (alreadySent || []).map((r) => {
        // Extract user_id from message_id: reengagement-7d-{user_id}-{isoWeek}
        const parts = r.message_id?.split("-") || [];
        // user_id is a UUID (5 parts with dashes), between "7d-" and "-{year}-W{week}"
        // Format: reengagement-7d-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX-2026-W15
        if (parts.length >= 9) {
          return parts.slice(2, 7).join("-");
        }
        return null;
      })
    );

    let enqueued = 0;

    for (const profile of inactiveProfiles) {
      if (alreadySentIds.has(profile.id)) continue;

      const tools = userToolsMap.get(profile.id) || new Set();
      const activity = {
        hasAiOutputs: tools.size > 0,
        hasDream100: hasDream100Set.has(profile.id),
        hasOffers: hasOffersSet.has(profile.id),
        hasOutreach: hasOutreachSet.has(profile.id),
        hasSkillScan: tools.has("skill-scanner"),
      };

      const suggestions = buildSuggestions(activity);
      if (suggestions.length === 0) continue;

      const firstName =
        profile.full_name?.split(" ")[0] || profile.email!.split("@")[0];
      const subject = `${firstName}, nu lăsa oportunitățile să treacă pe lângă tine 🎯`;
      const html = buildEmailHtml(firstName, suggestions);
      const idempotencyKey = `reengagement-7d-${profile.id}-${isoWeek}`;

      const { error: enqueueError } = await supabase.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          to: profile.email,
          from: "SkillMarket <noreply@notify.mk.eduforyou.co.uk>",
          sender_domain: "notify.mk.eduforyou.co.uk",
          subject,
          html,
          purpose: "transactional",
          label: "auto-reengagement-7d",
          idempotency_key: idempotencyKey,
          message_id: idempotencyKey,
          queued_at: new Date().toISOString(),
        },
      });

      if (enqueueError) {
        console.error(
          `Failed to enqueue for ${profile.email}:`,
          enqueueError
        );
      } else {
        enqueued++;
      }
    }

    console.log(
      `Auto-reengagement: ${enqueued} emails enqueued (${inactiveProfiles.length} inactive, ${isoWeek})`
    );

    return new Response(
      JSON.stringify({
        enqueued,
        inactive_found: inactiveProfiles.length,
        iso_week: isoWeek,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auto-reengagement error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
