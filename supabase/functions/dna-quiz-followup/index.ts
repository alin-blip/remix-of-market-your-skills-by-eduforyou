import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOGO_URL =
  "https://fdjzjqkiuxygiemqyfim.supabase.co/storage/v1/object/public/email-assets/logo.png";

const SENDER_DOMAIN = "notify.mk.eduforyou.co.uk";

const profileLabels: Record<string, string> = {
  employee: "Angajat de Top",
  freelancer: "Freelancer Independent",
  startup: "Fondator de Startup",
};

function getFollowupHtml(resultType: string): string {
  const profileLabel = profileLabels[resultType] || resultType;
  return `<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Inter',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 28px;">
  <img src="${LOGO_URL}" alt="Market Your Skill" width="160" style="margin-bottom:24px;" />
  <h1 style="font-size:24px;font-weight:bold;color:#0D1B2A;margin:0 0 20px;font-family:'Playfair Display',Georgia,serif;">
    Calea ta te așteaptă înăuntru
  </h1>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Acum 2 zile ai descoperit că ești <strong style="color:#0D1B2A;">${profileLabel}</strong>.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Ai citit rezultatul. Poate l-ai salvat. Poate l-ai arătat cuiva.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Dar nu ai intrat încă în platformă.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Știu de ce. Nu este lipsă de interes. Este că nu știi exact ce te așteaptă înăuntru și nu vrei să pierzi timp cu ceva care nu livrează.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Îți spun direct ce găsești:</p>
  <p style="font-size:15px;color:#0D1B2A;line-height:1.8;margin:0 0 16px;">
    → Modulul construit specific pentru profilul tău ${profileLabel}<br/>
    → Comunitatea studenților care execută, nu doar vorbesc<br/>
    → Sesiuni live săptămânale cu mine direct
  </p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Nu este un curs cu 47 de lecții pe care nu le vei termina niciodată. Este un sistem de execuție pas cu pas.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 24px;">Intră acum. Primele 48 de ore sunt cele mai importante:</p>
  <p style="margin:0 0 16px;"><a href="https://mk.eduforyou.co.uk/ro" style="display:inline-block;background:#D4A843;color:#0D1B2A;font-size:15px;font-weight:bold;border-radius:12px;padding:14px 24px;text-decoration:none;">Intră în platformă →</a></p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Și dacă vrei să intri și în comunitatea Skool unde discutăm direct:</p>
  <p style="margin:0 0 24px;"><a href="https://www.skool.com/marketyourskill/about" style="display:inline-block;background:#0D1B2A;color:#D4A843;font-size:15px;font-weight:bold;border-radius:12px;padding:14px 24px;text-decoration:none;">Comunitatea Skool →</a></p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Studenții EduForYou — acces gratuit.</p>
  <p style="font-size:15px;color:#0D1B2A;font-weight:bold;margin:24px 0 4px;">Alin Radu</p>
  <p style="font-size:13px;color:#6B7A8D;margin:0;">Fondator EduForYou</p>
</div>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: pendingResults, error: fetchError } = await supabase
      .from("dna_quiz_results")
      .select("id, email, result_type")
      .eq("followup_sent", false)
      .not("email", "is", null)
      .lt("created_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .limit(50);

    if (fetchError) {
      throw new Error(`Fetch error: ${fetchError.message}`);
    }

    if (!pendingResults || pendingResults.length === 0) {
      return new Response(JSON.stringify({ message: "No pending followups", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;

    for (const result of pendingResults) {
      try {
        const html = getFollowupHtml(result.result_type);
        const messageId = crypto.randomUUID();

        const { error: enqueueError } = await supabase.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            to: result.email,
            from: `Market Your Skill <noreply@${SENDER_DOMAIN}>`,
            sender_domain: SENDER_DOMAIN,
            subject: "Calea ta te așteaptă înăuntru",
            html,
            purpose: "transactional",
            label: "dna_quiz_followup",
            message_id: messageId,
            queued_at: new Date().toISOString(),
          },
        });

        if (!enqueueError) {
          await supabase.from("email_send_log").insert({
            message_id: messageId,
            template_name: "dna_quiz_followup",
            recipient_email: result.email,
            status: "pending",
          });

          await supabase
            .from("dna_quiz_results")
            .update({ followup_sent: true } as any)
            .eq("id", result.id);
          sent++;
        } else {
          console.error(`Failed to enqueue for ${result.email}:`, enqueueError);
        }

        await new Promise((r) => setTimeout(r, 100));
      } catch (e) {
        console.error(`Error processing ${result.id}:`, e);
      }
    }

    return new Response(JSON.stringify({ success: true, sent, total: pendingResults.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
