import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOGO_URL =
  "https://fdjzjqkiuxygiemqyfim.supabase.co/storage/v1/object/public/email-assets/logo.png";

const SENDER_DOMAIN = "notify.mk.eduforyou.co.uk";

function wrap(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Inter',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 28px;">
  <img src="${LOGO_URL}" alt="Partnership Engine" width="160" style="margin-bottom:24px;" />
  <h1 style="font-size:24px;font-weight:bold;color:#0D1B2A;margin:0 0 20px;font-family:'Playfair Display',Georgia,serif;">
    ${title}
  </h1>
  ${body}
  <p style="font-size:15px;color:#0D1B2A;font-weight:bold;margin:24px 0 4px;">Alin Radu</p>
  <p style="font-size:13px;color:#6B7A8D;margin:0 0 16px;">Fondator EduForYou</p>
</div>
</body></html>`;
}

function getResultEmail(resultType: string): { subject: string; html: string } {
  if (resultType === "affiliate") {
    const body = `
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">10 întrebări. Un singur răspuns clar: <strong style="color:#0D1B2A;">ești construit pentru parteneriate de tip Affiliate Operator.</strong></p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Te miști rapid, scalezi prin volum și nu ai răbdare pentru contracte complicate. Vrei link-uri, comisioane recurente și dashboard-uri clare. Companiile cu programe afiliate solide te adoră — pentru că aduci trafic care convertește.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Problema majoră a operatorilor afiliate la început: distribuie fără sistem. Promovează 20 de oferte fără focus, ard audiența și ajung la comisioane de £50/lună.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;"><strong style="color:#0D1B2A;">Partnership Engine îți dă sistemul de a transforma 1 partener strategic în £3,000-£10,000/lună recurent.</strong></p>
  <p style="font-size:15px;color:#0D1B2A;line-height:1.8;margin:0 0 16px;">
    → Cum identifici Dream 100 partenerii care au comisioane reale (nu 5%)<br/>
    → Cum negociezi comisioane hibrid (% + fix + bonus performanță)<br/>
    → Cum construiești un funnel care vinde produsele partenerului automat
  </p>
  <p style="margin:0 0 24px;"><a href="https://mk.eduforyou.co.uk/ro" style="display:inline-block;background:#D4A843;color:#0D1B2A;font-size:15px;font-weight:bold;border-radius:12px;padding:14px 24px;text-decoration:none;">Intră acum în platformă →</a></p>
  <p style="font-size:12px;color:#999999;margin:32px 0 0;">P.S. Operatorii afiliate care câștigă consistent nu au mai mult trafic. Au parteneri mai buni. Asta începem să rezolvăm de la primul login.</p>`;
    return { subject: "Profilul tău de partener: Affiliate Operator 🔗", html: wrap("Profilul tău de partener: Affiliate Operator 🔗", body) };
  }

  if (resultType === "referral") {
    const body = `
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Ai răspuns la 10 întrebări.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Rezultatul este clar: <strong style="color:#0D1B2A;">ești un Referral Networker prin definiție.</strong></p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Tu nu vinzi — tu conectezi. Ai rețeaua, ai reputația, oamenii îți răspund la mesaje pentru că au încredere. Companiile care înțeleg cât valorează o introducere caldă plătesc serios pentru oameni ca tine.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Problema networker-ilor: dau introduceri gratuit ani de zile fără să își monetizeze valoarea. Sau cer comisioane confuze și pierd relațiile.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;"><strong style="color:#0D1B2A;">Partnership Engine îți construiește contractele de referral hibrid care convertesc rețeaua în venit recurent — fără să strici prietenii.</strong></p>
  <p style="font-size:15px;color:#0D1B2A;line-height:1.8;margin:0 0 16px;">
    → Cum împachetezi Dream 100 din rețeaua ta în liste targetate<br/>
    → Cum prezinți comisionul fix + % fără să pari "vânzător"<br/>
    → Cum scalezi de la 2 introduceri/lună la 20 fără să faci muncă manuală
  </p>
  <p style="margin:0 0 24px;"><a href="https://mk.eduforyou.co.uk/ro" style="display:inline-block;background:#D4A843;color:#0D1B2A;font-size:15px;font-weight:bold;border-radius:12px;padding:14px 24px;text-decoration:none;">Intră acum în platformă →</a></p>
  <p style="font-size:12px;color:#999999;margin:32px 0 0;">P.S. Cea mai scumpă greșeală a unui networker: să nu aibă un sistem de tracking. Pierzi 70% din comisioane pentru că nu poți dovedi sursa. Asta rezolvăm primul lucru.</p>`;
    return { subject: "Profilul tău de partener: Referral Networker 🤝", html: wrap("Profilul tău de partener: Referral Networker 🤝", body) };
  }

  // jv (default)
  const body = `
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Ai răspuns sincer. Și rezultatul spune tot: <strong style="color:#0D1B2A;">ești construit să faci Joint Ventures — parteneriate de adâncime, nu de volum.</strong></p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Tu nu vrei comisioane mici de la 50 de companii. Vrei 3-5 parteneri strategici cu care construiești ceva real: produse co-branded, distribuție comună, equity sau revenue share.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Problema JV Builder-ilor la început: aleg parteneri pe baza chimiei, nu pe baza fit-ului strategic. Sau pierd 6 luni negociind un deal care nu s-ar fi închis niciodată.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;"><strong style="color:#0D1B2A;">Partnership Engine îți dă cadrul Hormozi/Cialdini pentru a identifica, negocia și executa JV-uri reale.</strong></p>
  <p style="font-size:15px;color:#0D1B2A;line-height:1.8;margin:0 0 16px;">
    → Cum scanezi Dream 100 după criterii de fit JV (nu doar mărime)<br/>
    → Cum construiești pitch deck-ul de partneriat care se citește în 3 minute<br/>
    → Cum structurezi term sheet-ul: % revenue, fix, bonus, exclusivitate
  </p>
  <p style="margin:0 0 24px;"><a href="https://mk.eduforyou.co.uk/ro" style="display:inline-block;background:#D4A843;color:#0D1B2A;font-size:15px;font-weight:bold;border-radius:12px;padding:14px 24px;text-decoration:none;">Intră acum în platformă →</a></p>
  <p style="font-size:12px;color:#999999;margin:32px 0 0;">P.S. Un singur JV bine făcut îți poate aduce mai mult decât 100 de tranzacții afiliate. Dar trebuie sistem, nu noroc.</p>`;
  return { subject: "Profilul tău de partener: JV Builder 🚀", html: wrap("Profilul tău de partener: JV Builder 🚀", body) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, result_type, lang } = await req.json();

    if (!email || !result_type) {
      return new Response(JSON.stringify({ error: "Missing email or result_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { subject, html } = getResultEmail(result_type);
    const messageId = crypto.randomUUID();

    const { error: enqueueError } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        to: email,
        from: `Partnership Engine <noreply@${SENDER_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        purpose: "transactional",
        label: "dna_quiz_result",
        message_id: messageId,
        queued_at: new Date().toISOString(),
      },
    });

    if (enqueueError) {
      throw new Error(`Enqueue error: ${enqueueError.message}`);
    }

    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: "dna_quiz_result",
      recipient_email: email,
      status: "pending",
    });

    return new Response(JSON.stringify({ success: true, message_id: messageId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
