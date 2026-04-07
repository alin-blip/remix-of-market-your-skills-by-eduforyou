import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LOGO_URL = 'https://fdjzjqkiuxygiemqyfim.supabase.co/storage/v1/object/public/email-assets/logo.png'

const CASE_STUDY_USERS = [
  {
    name: "Gabriela A.",
    fullName: "Gabriela Albulescu",
    email: "gabrielaalbulescu709@gmail.com",
    domain: "HoReCa Consulting",
    generations: 7,
    tools: "Skill Scanner, Ikigai Builder, Offer Builder, Profile Builder",
    highlight: "ofertă premium de 3.500 RON pentru Transformare HoReCa 360",
  },
  {
    name: "Marcel C.",
    fullName: "Marcel Cretu",
    email: "marcelcretu@gmail.com",
    domain: "Logistică Medicală",
    generations: 6,
    tools: "Skill Scanner, Ikigai Builder, Offer Builder, Life OS",
    highlight: "ofertă premium de 950 EUR pentru Elite Medical Logistics & Safety",
  },
  {
    name: "Nicolae C.",
    fullName: "Nicolae Chirila",
    email: "nikolaskirilis1@yahoo.com",
    domain: "Construcții Metalice",
    generations: 7,
    tools: "Skill Scanner, Ikigai Builder, Offer Builder, Profile Builder",
    highlight: "ofertă premium de 6.000 RON pentru Expert Integral Optimizare & Certificare",
  },
  {
    name: "Virgil-Cătălin B.",
    fullName: "Virgil-Catalin Brandus",
    email: "catalinbv04@gmail.com",
    domain: "Wellbeing & Senior Care",
    generations: 8,
    tools: "Skill Scanner, Ikigai Builder, Offer Builder, Profile Builder",
    highlight: "ofertă premium de 2.500 RON pentru Transformare Holistică",
  },
  {
    name: "Andrei P.",
    fullName: "Andrei Periade",
    email: "periadeee@gmail.com",
    domain: "Automotive Product Strategy",
    generations: 6,
    tools: "Skill Scanner, Ikigai Builder, Offer Builder",
    highlight: "ofertă premium de 4.500 EUR pentru End-to-End Product Launch Partner",
  },
  {
    name: "Elena M.",
    fullName: "Elena Mihaela",
    email: "elena.mihaela.22@gmail.com",
    domain: "HoReCa Operations",
    generations: 4,
    tools: "Skill Scanner, Ikigai Builder, Offer Builder, Profile Builder",
    highlight: "ofertă premium de 600 EUR pentru HoReCa & Event Pro Partner",
  },
  {
    name: "Ioana I.",
    fullName: "Ioana Ivan",
    email: "ioanaivan123@yahoo.com",
    domain: "Life Planning & Wellness",
    generations: 2,
    tools: "Life OS",
    highlight: "plan strategic complet de viață cu obiective măsurabile",
  },
]

function buildEmailHtml(user: typeof CASE_STUDY_USERS[0]) {
  return `
<!DOCTYPE html>
<html lang="ro">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="background-color:#ffffff;font-family:Arial,sans-serif;margin:0;padding:0;">
<div style="max-width:600px;margin:0 auto;padding:20px 25px;">
  <div style="text-align:center;margin-bottom:30px;">
    <img src="${LOGO_URL}" alt="SkillMarket" style="width:50px;height:50px;border-radius:12px;" />
  </div>
  
  <h1 style="font-size:24px;font-weight:bold;color:#0D1B2A;margin:0 0 20px;">
    ${user.fullName}, rezultatele tale sunt remarcabile 🏆
  </h1>
  
  <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 20px;">
    Am analizat activitatea de pe platforma <strong>SkillMarket</strong> și am observat 
    că ai construit ceva cu adevărat impresionant:
  </p>
  
  <div style="background:#f8f6f0;border-left:4px solid #D4A843;padding:16px 20px;border-radius:0 12px 12px 0;margin:0 0 24px;">
    <p style="font-size:14px;color:#555;margin:0 0 8px;"><strong>📊 Domeniu:</strong> ${user.domain}</p>
    <p style="font-size:14px;color:#555;margin:0 0 8px;"><strong>⚡ Generări AI:</strong> ${user.generations} rezultate create</p>
    <p style="font-size:14px;color:#555;margin:0 0 8px;"><strong>🛠️ Unelte folosite:</strong> ${user.tools}</p>
    <p style="font-size:14px;color:#555;margin:0;"><strong>🎯 Rezultat cheie:</strong> ${user.highlight}</p>
  </div>
  
  <h2 style="font-size:18px;font-weight:bold;color:#0D1B2A;margin:0 0 12px;">
    Ce înseamnă asta pentru tine?
  </h2>
  
  <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">
    Dorim să te prezentăm ca <strong>studiu de caz</strong> pe platforma noastră — alături de alți 
    profesioniști care au obținut rezultate excepționale. Concret:
  </p>
  
  <ul style="font-size:14px;color:#333;line-height:1.8;margin:0 0 24px;padding-left:20px;">
    <li><strong>Vizibilitate</strong> — profilul tău va fi prezentat pe pagina de studii de caz și pe landing page</li>
    <li><strong>Email de contact</strong> — adresa ta va fi afișată pentru potențiali clienți să te contacteze direct</li>
    <li><strong>Credibilitate</strong> — vei fi asociat/ă cu o platformă de AI coaching de top</li>
    <li><strong>Rezultatele tale vorbesc</strong> — arătăm ce ai construit, nu doar ce spunem noi</li>
  </ul>
  
  <div style="background:linear-gradient(135deg,#D4A843 0%,#F0C96A 100%);border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
    <p style="font-size:16px;font-weight:bold;color:#0D1B2A;margin:0 0 8px;">
      Ești deja pe pagina noastră de Case Studies! 🎉
    </p>
    <p style="font-size:13px;color:#0D1B2A;margin:0;">
      Vizitează: skillmarket.lovable.app/case-studies
    </p>
  </div>
  
  <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 24px;">
    <strong>Dacă nu dorești</strong> să fii prezentat/ă ca studiu de caz, te rugăm să ne trimiți un email 
    la <a href="mailto:support@eduforyou.co.uk" style="color:#D4A843;">support@eduforyou.co.uk</a> 
    și vom elimina profilul tău imediat.
  </p>
  
  <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 8px;">
    Cu respect și admirație,
  </p>
  <p style="font-size:14px;color:#0D1B2A;font-weight:bold;margin:0;">
    Echipa SkillMarket
  </p>
  
  <hr style="border:none;border-top:1px solid #eee;margin:30px 0 15px;" />
  <p style="font-size:11px;color:#999;text-align:center;margin:0;">
    Acest email a fost trimis de platforma SkillMarket (Market Your Skill Ltd).
  </p>
</div>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const results: { email: string; status: string; error?: string }[] = []

    for (const user of CASE_STUDY_USERS) {
      try {
        const idempotencyKey = `case-study-notify-${user.email}-v1`
        const html = buildEmailHtml(user)
        const subject = `${user.fullName}, rezultatele tale pe SkillMarket sunt remarcabile 🏆`

        const { error } = await supabase.rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            to: user.email,
            subject,
            html,
            from: 'SkillMarket <noreply@notify.mk.eduforyou.co.uk>',
            idempotency_key: idempotencyKey,
          },
        })

        if (error) {
          results.push({ email: user.email, status: 'error', error: error.message })
        } else {
          results.push({ email: user.email, status: 'enqueued' })
        }
      } catch (err) {
        results.push({ email: user.email, status: 'error', error: String(err) })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
