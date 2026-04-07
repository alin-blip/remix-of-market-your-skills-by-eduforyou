import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://venture-stride-kit.lovable.app";
const LOGO_URL =
  "https://fdjzjqkiuxygiemqyfim.supabase.co/storage/v1/object/public/email-assets/logo.png";

const INACTIVE_USERS = [
  { email: "radusarahmaria@gmail.com", name: "Sarah" },
  { email: "calindani91@gmail.com", name: "Daniel" },
  { email: "sergheismn@gmail.com", name: "Serghei" },
  { email: "andreinicolaie59@gmail.com", name: "Andrei" },
  { email: "cristiansoacate@gmail.com", name: "Cristian" },
  { email: "liubarschi@yahoo.com", name: "Sorin" },
  { email: "danacreanga28@yahoo.com", name: "Dumitrela" },
  { email: "lucianmihai.tr@gmail.com", name: "Lucian" },
  { email: "antomariananto@gmail.com", name: "Marian" },
  { email: "catalin20fgs@yahoo.com", name: "Nicolae" },
  { email: "gabrielduminicel@gmail.com", name: "Gabriel" },
  { email: "sorin10ionutsit@gmail.com", name: "Sorin" },
  { email: "paulamag08@gmail.com", name: "Paula" },
  { email: "csaba.balogh@aol.com", name: "Csaba" },
  { email: "udreapetruta79@gmail.com", name: "Petruta" },
  { email: "madutzu4@gmail.com", name: "Sebastian" },
  { email: "geaninabolocan35@gmail.com", name: "Geanina" },
  { email: "tothvaidadumitru97@gmail.com", name: "Dumitru" },
  { email: "marianemil547yahoo.com@gmail.com", name: "Emil" },
  { email: "sacaleanuciprian@gmail.com", name: "Ciprian" },
  { email: "robertj.vaszi@gmail.com", name: "Robert" },
  { email: "bour_roxana@yahoo.ca", name: "Roxana" },
  { email: "delinescu17@yahoo.com", name: "Delinescu" },
  { email: "simygaby3@gmail.com", name: "Gaby" },
  { email: "roxsymbol@gmail.com", name: "Alexandru" },
  { email: "apetreiflorry@gmail.com", name: "Florentina" },
  { email: "mihaelasimona624@gmail.com", name: "Mihaela" },
  { email: "anahunuzau32@yahoo.com", name: "Ana" },
  { email: "amihaesei.raluca@gmail.com", name: "Raluca" },
  { email: "costy_lmb@yahoo.com", name: "Costel" },
  { email: "costelromeoolaru@gmail.com", name: "Costel" },
  { email: "jessicaannemarie152@gmail.com", name: "Alina" },
  { email: "nap.marioara@yahoo.com", name: "Marioara" },
  { email: "bratudaniel1987@yahoo.co.uk", name: "Daniel" },
  { email: "linkionne@yahoo.com", name: "Ionel" },
  { email: "alexandrub829@gmail.com", name: "Alexandru" },
  { email: "petroliferam@gmail.com", name: "Petroliferam" },
  { email: "apavaloaei.alin@yahoo.com", name: "Alin" },
  { email: "florentinbadicu78@gmail.com", name: "Florentin" },
  { email: "rogojinaalexandru10@gmail.com", name: "Alexandru" },
  { email: "mogoseanualcrr@gmail.com", name: "Alexandru" },
  { email: "rodica.donos@gmail.com", name: "Rodica" },
  { email: "sergiu.platon.pl@gmail.com", name: "Sergiu" },
  { email: "catlina20@yahoo.es", name: "Andreea" },
  { email: "bogdanconstantinprica4@gmail.com", name: "Bogdan" },
  { email: "ioanamadalina282@yahoo.co.uk", name: "Ioana" },
  { email: "diana_ciocoi10@yahoo.com", name: "Diana" },
  { email: "romannarcisconstantin@gmail.com", name: "Narcis" },
  { email: "radupina@gmail.com", name: "Petrina" },
  { email: "astefanoaie.anca@yahoo.com", name: "Anca" },
  { email: "timoteipopa4@gmail.com", name: "Timotei" },
  { email: "alexandrubarbu25@yahoo.com", name: "Alexandru" },
  { email: "marian.baciu1987@gmail.com", name: "Marian" },
  { email: "calinbob73@yahoo.com", name: "Calin" },
  { email: "constantingabrielcruceana@gmail.com", name: "Gabriel" },
  { email: "mariantimotin79@gmail.com", name: "Marian" },
  { email: "m.sfrijan@yahoo.com", name: "Mihai" },
  { email: "centrul.ghidare@gmail.com", name: "Zinaida" },
  { email: "adammariuscalin@yahoo.com", name: "Marius" },
  { email: "ana_mofidi@yahoo.com", name: "Ana" },
  { email: "andrei.mirel89@gmail.com", name: "Andrei" },
  { email: "sorina.topirceanu@gmail.com", name: "Sorina" },
  { email: "florin.pitulec@yahoo.com", name: "Florin" },
  { email: "oanabutnariu1995@gmail.com", name: "Oana" },
  { email: "eduardandrey19@gmail.com", name: "Alina" },
];

function buildEmailHtml(name: string): string {
  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#0D1B2A;border-radius:16px;overflow:hidden;">

<!-- Logo -->
<tr><td style="padding:32px 32px 0;text-align:center;">
<img src="${LOGO_URL}" alt="SkillMarket" width="140" style="display:block;margin:0 auto;" />
</td></tr>

<!-- Headline -->
<tr><td style="padding:24px 32px 8px;text-align:center;">
<h1 style="margin:0;font-size:26px;font-weight:bold;color:#D4A843;font-family:'Georgia',serif;line-height:1.3;">
${name}, contul tău e gata.<br/>Dar nu ai folosit încă nicio unealtă.
</h1>
</td></tr>

<!-- Intro -->
<tr><td style="padding:16px 32px;color:#C8D6E5;font-size:15px;line-height:1.6;">
Știu că ai creat un cont pe <strong style="color:#D4A843;">Market Your Skill</strong> — și probabil ai fost ocupat(ă). Dar vreau să îți arăt ce au reușit alții în câteva minute:
</td></tr>

<!-- Social Proof Box -->
<tr><td style="padding:0 32px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1B2A3D;border:1px solid rgba(212,168,67,0.2);border-radius:12px;">
<tr><td style="padding:20px 24px;">
<p style="margin:0 0 12px;font-size:18px;font-weight:bold;color:#D4A843;">🚀 7 profesioniști. Sub 30 de minute. Oferte premium.</p>
<p style="margin:0 0 8px;font-size:14px;color:#C8D6E5;line-height:1.5;">
☕ <strong>Gabriela A.</strong> — a creat o ofertă de consultanță HoReCa de <strong style="color:#D4A843;">3.500 RON</strong> în doar 12 minute
</p>
<p style="margin:0 0 8px;font-size:14px;color:#C8D6E5;line-height:1.5;">
🏗️ <strong>Nicolae C.</strong> — pachet de optimizare construcții metalice la <strong style="color:#D4A843;">6.000 RON</strong> în 8 minute
</p>
<p style="margin:0;font-size:14px;color:#C8D6E5;line-height:1.5;">
🚗 <strong>Andrei P.</strong> — strategie produs automotive la <strong style="color:#D4A843;">4.500 EUR</strong> în 3 minute
</p>
</td></tr>
</table>
</td></tr>

<!-- What you can do -->
<tr><td style="padding:24px 32px 8px;">
<p style="margin:0 0 16px;font-size:16px;font-weight:bold;color:#F0F4F8;">Ce poți face tu în următoarele 10 minute:</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:6px 0;font-size:14px;color:#C8D6E5;">1️⃣ <strong>Skill Scanner</strong> — descoperă-ți skillurile ascunse</td></tr>
<tr><td style="padding:6px 0;font-size:14px;color:#C8D6E5;">2️⃣ <strong>Ikigai Builder</strong> — găsește direcția perfectă</td></tr>
<tr><td style="padding:6px 0;font-size:14px;color:#C8D6E5;">3️⃣ <strong>Offer Builder</strong> — creează-ți oferta premium cu prețuri</td></tr>
<tr><td style="padding:6px 0;font-size:14px;color:#C8D6E5;">4️⃣ <strong>Profile Builder</strong> — optimizează-ți profilul profesional</td></tr>
</table>
</td></tr>

<!-- CTA -->
<tr><td style="padding:24px 32px;text-align:center;">
<a href="${SITE_URL}/wizard/skill-scanner" style="display:inline-block;background-color:#D4A843;color:#0D1B2A;font-size:16px;font-weight:bold;text-decoration:none;border-radius:12px;padding:16px 40px;">
Începe Acum — Durează Sub 10 Minute →
</a>
</td></tr>

<!-- Case Studies Link -->
<tr><td style="padding:0 32px 16px;text-align:center;">
<a href="${SITE_URL}/case-studies" style="font-size:13px;color:#D4A843;text-decoration:underline;">
Vezi toate cele 7 studii de caz →
</a>
</td></tr>

<!-- Closing -->
<tr><td style="padding:0 32px 32px;color:#8899AA;font-size:13px;line-height:1.5;text-align:center;">
Ai primit acest email pentru că ți-ai creat un cont pe Market Your Skill.<br/>
Nu mai dorești emailuri? Răspunde cu "stop" și te scoatem imediat.
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let enqueued = 0;
    let skipped = 0;

    for (const user of INACTIVE_USERS) {
      const idempotencyKey = `reengagement-v1-${user.email}`;
      const subject = `${user.name}, ai ratat ceva important pe SkillMarket 🚀`;
      const html = buildEmailHtml(user.name);

      const payload = {
        to: user.email,
        subject,
        html,
        idempotency_key: idempotencyKey,
        from_name: "Market Your Skill",
      };

      const { data, error } = await supabase.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload,
      });

      if (error) {
        console.error(`Failed to enqueue for ${user.email}:`, error.message);
        skipped++;
      } else {
        enqueued++;
        console.log(`Enqueued for ${user.email} (msg_id: ${data})`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: INACTIVE_USERS.length,
        enqueued,
        skipped,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
