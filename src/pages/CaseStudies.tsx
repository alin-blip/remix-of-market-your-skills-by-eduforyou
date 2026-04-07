import { Link } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { Star, Clock, Zap, ArrowRight, Users, Target, Package, FileText, Brain, Globe } from "lucide-react";
import logoImg from "@/assets/logo.png";
import "./skillmarket.css";

/* ─── Hardcoded Case Study Data ─── */
const CASE_STUDIES = [
  {
    name: "Gabriela A.",
    email: "gabrielaalbulescu709@gmail.com",
    domain: "HoReCa Consulting",
    timeMinutes: 12,
    generations: 7,
    tools: ["Skill Scanner", "Ikigai Builder", "Offer Builder ×4", "Profile Builder"],
    rating: 5,
    highlights: {
      smv: "Transformăm afacerea ta HoReCa într-un magnet pentru clienți și profit, prin optimizare operațională și experiențe memorabile.",
      skills: ["Managementul Operațiunilor HoReCa", "Barista Avansat (16 ani)", "Training Echipe", "Serviciu Clienți 5★"],
      targetMarket: "Afaceri HoReCa mici și medii din România",
      bio: "☕ Expertiza Horeca | ✨ Transform locația ta în magnet de clienți | 🍕 Profit & Flux",
      topPackage: { name: "Transformare HoReCa 360", price: "3.500 RON", time: "14 zile" },
    },
  },
  {
    name: "Marcel C.",
    email: "marcelcretu@gmail.com",
    domain: "Logistică Medicală",
    timeMinutes: 33,
    generations: 6,
    tools: ["Skill Scanner", "Ikigai Builder ×2", "Offer Builder ×2", "Life OS"],
    rating: 5,
    highlights: {
      smv: "Seamless and safe medical logistics, delivered with multicultural empathy.",
      skills: ["Operare vehicule comerciale C+E", "Serviciu clienți transport", "Logistică medicală", "Multilingv (RO/EN/ES)"],
      targetMarket: "Healthcare providers & medical transport companies in Europe",
      bio: "Expert logistică medicală cu empatie multiculturală",
      topPackage: { name: "Elite Medical Logistics & Safety", price: "950 EUR", time: "14 zile" },
    },
  },
  {
    name: "Nicolae C.",
    email: "nikolaskirilis1@yahoo.com",
    domain: "Construcții Metalice",
    timeMinutes: 8,
    generations: 7,
    tools: ["Skill Scanner", "Ikigai Builder", "Offer Builder", "Profile Builder ×4"],
    rating: 5,
    highlights: {
      smv: "Transformăm provocările din construcții metalice în performanță predictibilă și siguranță absolută.",
      skills: ["Managementul Producției", "Inspecție & Control Calitate", "SSM (Sănătate și Securitate)", "Certificări sudură 1G-6G"],
      targetMarket: "Companii de construcții metalice mici și medii, ateliere de fabricare",
      bio: "🏗️ Transformăm metalul în performanță. Construcții sigure, profitabile. ⚡️",
      topPackage: { name: "Expert Integral Optimizare & Certificare", price: "6.000 RON", time: "7 zile" },
    },
  },
  {
    name: "Virgil-Cătălin B.",
    email: "catalinbv04@gmail.com",
    domain: "Wellbeing & Senior Care",
    timeMinutes: 9,
    generations: 8,
    tools: ["Skill Scanner", "Ikigai Builder ×2", "Offer Builder", "Profile Builder ×4"],
    rating: 5,
    highlights: {
      smv: "Transformăm provocările intergeneraționale în oportunități de creștere și bunăstare prin soluții personalizate.",
      skills: ["Îngrijire vârstnici (Senior Care)", "Sisteme de Sănătate Complexe", "Strategii ADHD & Performance", "Masaj sportiv"],
      targetMarket: "Familii, seniori și organizații interesate de inițiative sociale și de sănătate",
      bio: "✨ Transformăm provocările în bunăstare | Specialist Seniori & ADHD | 🌿 Soluții holistice",
      topPackage: { name: "Transformare Holistică - Catalyst pentru Viață", price: "2.500 RON", time: "14 zile" },
    },
  },
  {
    name: "Andrei P.",
    email: "periadeee@gmail.com",
    domain: "Automotive Product Strategy",
    timeMinutes: 3,
    generations: 6,
    tools: ["Skill Scanner", "Ikigai Builder ×2", "Offer Builder ×3"],
    rating: 5,
    highlights: {
      smv: "Transforming automotive visions into human-centric digital realities through strategic product development.",
      skills: ["Dezvoltare de Produs (ATPS)", "Analiză Strategică & Business Planning", "UI/UX Design Auto", "Gândire Antreprenorială"],
      targetMarket: "Automotive startups & car manufacturers in Europe",
      bio: "Automotive Product Strategist | From concept to launch",
      topPackage: { name: "End-to-End Product Launch Partner", price: "4.500 EUR", time: "14 zile" },
    },
  },
  {
    name: "Elena M.",
    email: "elena.mihaela.22@gmail.com",
    domain: "HoReCa Operations",
    timeMinutes: 6,
    generations: 4,
    tools: ["Skill Scanner", "Ikigai Builder", "Offer Builder", "Profile Builder"],
    rating: 5,
    highlights: {
      smv: "Empowering your business with streamlined operations and exceptional customer experiences.",
      skills: ["Barista Skills (Expert)", "Team Leadership", "Customer Service", "Cash Handling & Billing"],
      targetMarket: "HoReCa startups, small to medium-sized businesses in European markets",
      bio: "🏨 Elevating HoReCa & SMEs through smart ops | ✨ 5-Star Guest Experiences",
      topPackage: { name: "HoReCa & Event Pro Partner", price: "600 EUR", time: "7 zile" },
    },
  },
  {
    name: "Ioana I.",
    email: "ioanaivan123@yahoo.com",
    domain: "Life Planning & Wellness",
    timeMinutes: 1,
    generations: 2,
    tools: ["Life OS ×2"],
    rating: 5,
    highlights: {
      smv: "Planificare strategică de viață pentru o fundație rezilentă și energizată.",
      skills: ["Corporate Wellness Programs", "Life & Business Planning", "Consultanță SME"],
      targetMarket: "Profesioniști și antreprenori care caută claritate și direcție",
      bio: "Life Planning & Wellness Strategist",
      topPackage: { name: "Life OS Strategic Setup", price: "Inclus", time: "1 minut" },
    },
  },
];

const TOTAL_GENERATIONS = CASE_STUDIES.reduce((s, c) => s + c.generations, 0);
const TOTAL_USERS = CASE_STUDIES.length;

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-[#D4A843] text-[#D4A843]" />
      ))}
    </div>
  );
}

function MetricBox({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 bg-[#0D1B2A]/60 border border-[#D4A843]/20 rounded-xl px-4 py-3">
      <div className="p-2 rounded-lg bg-[#D4A843]/10">
        <Icon className="h-5 w-5 text-[#D4A843]" />
      </div>
      <div>
        <p className="text-xl font-bold text-[#F0F4F8]">{value}</p>
        <p className="text-xs text-[#F0F4F8]/60">{label}</p>
      </div>
    </div>
  );
}

function CaseStudyCard({ study }: { study: typeof CASE_STUDIES[0] }) {
  return (
    <div className="bg-gradient-to-br from-[#1B2A3D] to-[#0D1B2A] border border-[#D4A843]/20 rounded-2xl p-6 hover:border-[#D4A843]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,168,67,0.1)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#F0F4F8]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {study.name}
          </h3>
          <p className="text-[#D4A843] font-medium text-sm mt-1">{study.domain}</p>
        </div>
        <StarRating />
      </div>

      {/* Metrics row */}
      <div className="flex gap-4 mb-5">
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="h-4 w-4 text-[#D4A843]/70" />
          <span className="text-[#F0F4F8]/80">{study.timeMinutes} min</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Zap className="h-4 w-4 text-[#D4A843]/70" />
          <span className="text-[#F0F4F8]/80">{study.generations} generări AI</span>
        </div>
      </div>

      {/* SMV Quote */}
      <blockquote className="border-l-2 border-[#D4A843]/40 pl-4 mb-5 italic text-sm text-[#F0F4F8]/70 leading-relaxed">
        "{study.highlights.smv}"
      </blockquote>

      {/* Skills */}
      <div className="mb-5">
        <p className="text-xs text-[#D4A843]/60 uppercase tracking-wider font-semibold mb-2">Skills identificate</p>
        <div className="flex flex-wrap gap-1.5">
          {study.highlights.skills.map((skill) => (
            <span key={skill} className="text-xs px-2.5 py-1 bg-[#D4A843]/10 text-[#D4A843] rounded-full border border-[#D4A843]/20">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Target Market */}
      <div className="mb-5">
        <p className="text-xs text-[#D4A843]/60 uppercase tracking-wider font-semibold mb-1">Piață țintă</p>
        <p className="text-sm text-[#F0F4F8]/70">{study.highlights.targetMarket}</p>
      </div>

      {/* Bio */}
      <div className="mb-5">
        <p className="text-xs text-[#D4A843]/60 uppercase tracking-wider font-semibold mb-1">Profil optimizat</p>
        <p className="text-sm text-[#F0F4F8]/80">{study.highlights.bio}</p>
      </div>

      {/* Top Package */}
      <div className="bg-[#D4A843]/5 border border-[#D4A843]/15 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#D4A843]/60 uppercase tracking-wider font-semibold mb-1">Ofertă premium</p>
            <p className="text-sm font-semibold text-[#F0F4F8]">{study.highlights.topPackage.name}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[#D4A843]">{study.highlights.topPackage.price}</p>
            <p className="text-xs text-[#F0F4F8]/50">{study.highlights.topPackage.time}</p>
          </div>
        </div>
      </div>

      {/* Tools used */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {study.tools.map((tool) => (
          <span key={tool} className="text-[10px] px-2 py-0.5 bg-[#F0F4F8]/5 text-[#F0F4F8]/50 rounded border border-[#F0F4F8]/10">
            {tool}
          </span>
        ))}
      </div>

      {/* Contact */}
      <div className="pt-4 border-t border-[#F0F4F8]/10">
        <p className="text-xs text-[#F0F4F8]/40 mb-1">Contact pentru colaborări</p>
        <a href={`mailto:${study.email}`} className="text-sm text-[#D4A843] hover:underline">
          {study.email}
        </a>
      </div>
    </div>
  );
}

export default function CaseStudies() {
  return (
    <div className="skillmarket-landing">
      <SEOHead
        title="Case Studies — Real Results from Market Your Skill Users"
        description="See how students and professionals used AI coaching to build freelancing offers, land gigs, and monetise their skills in under 15 minutes."
        path="/case-studies"
      />
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="sm-container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="SkillMarket" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg">
              Market Your <span className="text-gold">Skill</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="text-sm text-[#F0F4F8]/70 hover:text-[#D4A843] transition-colors">
              Login
            </Link>
            <Link to="/auth/register" className="btn-gold text-sm px-4 py-2 rounded-lg">
              Începe Acum
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4A843]/5 to-transparent pointer-events-none" />
        <div className="sm-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-full px-4 py-1.5 mb-6">
            <Zap className="h-4 w-4 text-[#D4A843]" />
            <span className="text-sm text-[#D4A843] font-semibold">REZULTATE REALE</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-[#D4A843]">{TOTAL_USERS} Profesioniști.</span>
            <br />
            <span className="text-[#F0F4F8]">{TOTAL_GENERATIONS} Rezultate AI.</span>
            <br />
            <span className="text-[#D4A843]">Sub 30 de Minute.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#F0F4F8]/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Oameni reali. Rezultate reale. Fiecare a folosit platforma noastră AI pentru a-și{" "}
            <span className="text-[#D4A843] font-semibold">identifica skillurile</span>,{" "}
            <span className="text-[#D4A843] font-semibold">construi oferta</span> și{" "}
            <span className="text-[#D4A843] font-semibold">optimiza profilul</span> — totul în minute, nu săptămâni.
          </p>

          {/* Aggregate metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <MetricBox icon={Users} value={`${TOTAL_USERS}`} label="Profesioniști" />
            <MetricBox icon={Zap} value={`${TOTAL_GENERATIONS}`} label="Generări AI" />
            <MetricBox icon={Target} value="5" label="Unelte folosite" />
            <MetricBox icon={Clock} value="<30 min" label="Timp mediu" />
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-16">
        <div className="sm-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CASE_STUDIES.map((study) => (
              <CaseStudyCard key={study.name} study={study} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works summary */}
      <section className="py-16 border-t border-[#D4A843]/10">
        <div className="sm-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Cum au <span className="text-[#D4A843]">obținut</span> aceste rezultate?
          </h2>
          <p className="text-[#F0F4F8]/60 mb-12 max-w-xl mx-auto">
            Fiecare a parcurs aceeași secvență simplă de 5 pași cu AI-ul nostru.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-12">
            {[
              { icon: Brain, label: "Skill Scanner", desc: "Identifică skilluri" },
              { icon: Target, label: "Ikigai Builder", desc: "Găsește direcția" },
              { icon: Package, label: "Offer Builder", desc: "Creează oferta" },
              { icon: FileText, label: "Profile Builder", desc: "Optimizează profil" },
              { icon: Globe, label: "Life OS", desc: "Planifică viitorul" },
            ].map((step, i) => (
              <div key={step.label} className="flex flex-col items-center gap-2 p-4">
                <div className="w-12 h-12 rounded-xl bg-[#D4A843]/10 border border-[#D4A843]/20 flex items-center justify-center mb-1">
                  <step.icon className="h-5 w-5 text-[#D4A843]" />
                </div>
                <p className="text-sm font-semibold text-[#F0F4F8]">{step.label}</p>
                <p className="text-xs text-[#F0F4F8]/50">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-[#D4A843]/10 via-[#D4A843]/5 to-[#D4A843]/10 border border-[#D4A843]/20 rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Construiește-ți și tu oferta
              <br />
              <span className="text-[#D4A843]">în sub 30 de minute</span>
            </h3>
            <p className="text-[#F0F4F8]/60 mb-6">
              Aceeași platformă AI pe care au folosit-o acești profesioniști este disponibilă și pentru tine.
            </p>
            <Link
              to="/auth/register"
              className="btn-gold inline-flex items-center gap-2 text-base px-8 py-3.5 rounded-xl"
            >
              Începe Gratuit <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#F0F4F8]/10">
        <div className="sm-container flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="SkillMarket" className="w-6 h-6 rounded" />
            <span className="text-sm font-semibold">
              Market Your <span className="text-[#D4A843]">Skill</span>
            </span>
          </Link>
          <p className="text-xs text-[#F0F4F8]/40">© 2026 SkillMarket. Toate drepturile rezervate.</p>
        </div>
      </footer>
    </div>
  );
}
