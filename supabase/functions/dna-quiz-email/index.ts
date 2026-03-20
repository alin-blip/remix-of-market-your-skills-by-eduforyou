import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOGO_URL =
  "https://fdjzjqkiuxygiemqyfim.supabase.co/storage/v1/object/public/email-assets/logo.png";

const SENDER_DOMAIN = "notify.mk.eduforyou.co.uk";

function getResultEmail(resultType: string): { subject: string; html: string } {
  if (resultType === "employee") {
    return {
      subject: "ADN-ul tău de execuție: Angajat de Top 🎯",
      html: `<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Inter',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 28px;">
  <img src="${LOGO_URL}" alt="Market Your Skill" width="160" style="margin-bottom:24px;" />
  <h1 style="font-size:24px;font-weight:bold;color:#0D1B2A;margin:0 0 20px;font-family:'Playfair Display',Georgia,serif;">
    ADN-ul tău de execuție: Angajat de Top 🎯
  </h1>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Ai răspuns la 10 întrebări.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Rezultatul este clar: <strong style="color:#0D1B2A;">ești construit să excelezi ca Angajat de Top.</strong></p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Nu înseamnă că ești "obișnuit". Înseamnă că ai un ADN specific — cel al omului care intră într-un sistem și îl face să funcționeze mai bine decât înainte. Companiile de top plătesc sume enorme pentru oameni ca tine.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Problema nu este cine ești. Problema este că nimeni nu te-a învățat cum să valorifici asta.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Universitatea ți-a dat diploma. Dar nu ți-a dat:</p>
  <p style="font-size:15px;color:#0D1B2A;line-height:1.8;margin:0 0 16px;">
    → Cum să transformi CV-ul într-o ofertă irezistibilă<br/>
    → Cum să negociezi un salariu cu 30-50% mai mare<br/>
    → Cum să intri în companiile unde vrei tu, nu unde te primesc ei
  </p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 24px;"><strong style="color:#0D1B2A;">Asta este exact ce rezolvă Market Your Skill pentru profilul tău.</strong></p>
  <p style="margin:0 0 24px;"><a href="https://mk.eduforyou.co.uk/ro" style="display:inline-block;background:#D4A843;color:#0D1B2A;font-size:15px;font-weight:bold;border-radius:12px;padding:14px 24px;text-decoration:none;">Intră acum în platformă →</a></p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Studenții EduForYou intră gratuit. Tu ești deja unul dintre noi.</p>
  <p style="font-size:15px;color:#0D1B2A;font-weight:bold;margin:24px 0 4px;">Alin Radu</p>
  <p style="font-size:13px;color:#6B7A8D;margin:0 0 16px;">Fondator EduForYou</p>
  <p style="font-size:12px;color:#999999;margin:32px 0 0;">P.S. Dacă vrei să discutăm direct despre calea ta, răspunde la acest email. Le citesc personal.</p>
</div>
</body></html>`,
    };
  }

  if (resultType === "freelancer") {
    return {
      subject: "ADN-ul tău de execuție: Freelancer Independent 🔥",
      html: `<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Inter',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 28px;">
  <img src="${LOGO_URL}" alt="Market Your Skill" width="160" style="margin-bottom:24px;" />
  <h1 style="font-size:24px;font-weight:bold;color:#0D1B2A;margin:0 0 20px;font-family:'Playfair Display',Georgia,serif;">
    ADN-ul tău de execuție: Freelancer Independent 🔥
  </h1>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">10 întrebări. Un singur răspuns clar: <strong style="color:#0D1B2A;">ești construit să lucrezi pe cont propriu.</strong></p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Ești arhitectul propriei libertăți. Nu suporți să fii limitat de un program fix, de un șef care nu înțelege ce poți, de un salariu care nu reflectă valoarea ta reală.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Și ai dreptate să simți asta.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Dar libertatea fără sistem devine haos. Fără clienți constanți, fără o ofertă clară, fără un proces de vânzare — freelancing-ul devine cel mai stresant job pe care ți l-ai dat singur.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Asta este diferența dintre freelancerii care câștigă £3,000-£8,000/lună și cei care se luptă să ajungă la £1,000.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;"><strong style="color:#0D1B2A;">Market Your Skill îți dă sistemul.</strong></p>
  <p style="font-size:15px;color:#0D1B2A;line-height:1.8;margin:0 0 16px;">
    → Cum îți construiești oferta care se vinde singură<br/>
    → Cum găsești primii 10 clienți fără să cerșești<br/>
    → Cum setezi prețuri care reflectă valoarea reală, nu ora de muncă
  </p>
  <p style="margin:0 0 24px;"><a href="https://mk.eduforyou.co.uk/ro" style="display:inline-block;background:#D4A843;color:#0D1B2A;font-size:15px;font-weight:bold;border-radius:12px;padding:14px 24px;text-decoration:none;">Intră acum în platformă →</a></p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Studenții EduForYou intră gratuit.</p>
  <p style="font-size:15px;color:#0D1B2A;font-weight:bold;margin:24px 0 4px;">Alin Radu</p>
  <p style="font-size:13px;color:#6B7A8D;margin:0 0 16px;">Fondator EduForYou</p>
  <p style="font-size:12px;color:#999999;margin:32px 0 0;">P.S. Cel mai mare obstacol al freelancerilor nu este lipsa skillului. Este lipsa curajului să ceară bani pe el. Asta se rezolvă cu sistem, nu cu motivație.</p>
</div>
</body></html>`,
    };
  }

  // startup
  return {
    subject: "ADN-ul tău de execuție: Fondator 🚀",
    html: `<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Inter',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 28px;">
  <img src="${LOGO_URL}" alt="Market Your Skill" width="160" style="margin-bottom:24px;" />
  <h1 style="font-size:24px;font-weight:bold;color:#0D1B2A;margin:0 0 20px;font-family:'Playfair Display',Georgia,serif;">
    ADN-ul tău de execuție: Fondator 🚀
  </h1>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Ai răspuns sincer. Și rezultatul spune tot: <strong style="color:#0D1B2A;">ești construit să construiești ceva al tău.</strong></p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Nu ești făcut pentru a executa viziunea altcuiva. Ești făcut să creezi viziunea pe care alții o execută.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Asta este un dar rar. Și o responsabilitate enormă.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Problema cu antreprenorii la început nu este lipsa ideilor. Este că construiesc prea mult înainte să valideze. Cheltuiesc timp și bani pe produse pe care piața nu le vrea.</p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;"><strong style="color:#0D1B2A;">Market Your Skill te învață să validezi înainte să construiești.</strong></p>
  <p style="font-size:15px;color:#0D1B2A;line-height:1.8;margin:0 0 16px;">
    → Cum testezi o idee în 7 zile fără să investești nimic<br/>
    → Cum construiești primele venituri din skill-urile pe care le ai deja<br/>
    → Cum treci de la "am o idee" la "am clienți care plătesc"
  </p>
  <p style="margin:0 0 24px;"><a href="https://mk.eduforyou.co.uk/ro" style="display:inline-block;background:#D4A843;color:#0D1B2A;font-size:15px;font-weight:bold;border-radius:12px;padding:14px 24px;text-decoration:none;">Intră acum în platformă →</a></p>
  <p style="font-size:15px;color:#6B7A8D;line-height:1.6;margin:0 0 16px;">Studenții EduForYou intră gratuit.</p>
  <p style="font-size:15px;color:#0D1B2A;font-weight:bold;margin:24px 0 4px;">Alin Radu</p>
  <p style="font-size:13px;color:#6B7A8D;margin:0 0 16px;">Fondator EduForYou</p>
  <p style="font-size:12px;color:#999999;margin:32px 0 0;">P.S. Cel mai periculos lucru pentru un antreprenor nu este eșecul. Este să construiești ceva perfect pentru o problemă care nu există. Validarea salvează ani de muncă.</p>
</div>
</body></html>`,
  };
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

    // Enqueue via Lovable email queue instead of Resend
    const { error: enqueueError } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        to: email,
        from: `Market Your Skill <noreply@${SENDER_DOMAIN}>`,
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

    // Log pending
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
