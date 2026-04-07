import { Star, Clock, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HIGHLIGHTS = [
  {
    name: "Gabriela A.",
    domain: "HoReCa Consulting",
    timeMinutes: 12,
    generations: 7,
    smv: "Transformăm afacerea ta HoReCa într-un magnet pentru clienți și profit.",
    topPackage: "3.500 RON",
  },
  {
    name: "Nicolae C.",
    domain: "Construcții Metalice",
    timeMinutes: 8,
    generations: 7,
    smv: "Performanță predictibilă și siguranță absolută în construcții metalice.",
    topPackage: "6.000 RON",
  },
  {
    name: "Andrei P.",
    domain: "Automotive Product Strategy",
    timeMinutes: 3,
    generations: 6,
    smv: "From automotive vision to human-centric digital reality.",
    topPackage: "4.500 EUR",
  },
  {
    name: "Marcel C.",
    domain: "Logistică Medicală",
    timeMinutes: 33,
    generations: 6,
    smv: "Seamless and safe medical logistics, with multicultural empathy.",
    topPackage: "950 EUR",
  },
];

interface CaseStudiesPreviewProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

export default function CaseStudiesPreview({
  title = "Rezultate Reale de la Utilizatori Reali",
  subtitle = "7 profesioniști, 40 de rezultate AI, sub 30 de minute fiecare.",
  ctaText = "Vezi toate studiile de caz",
}: CaseStudiesPreviewProps) {
  return (
    <section className="py-16 md:py-24 relative" id="case-studies">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4A843]/3 to-transparent pointer-events-none" />
      <div className="sm-container relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-full px-4 py-1.5 mb-4">
            <Star className="h-4 w-4 fill-[#D4A843] text-[#D4A843]" />
            <span className="text-sm text-[#D4A843] font-semibold">★★★★★ STUDII DE CAZ</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {title.split("Reali").map((part, i) =>
              i === 0 ? (
                <span key={i}>{part}<span className="text-[#D4A843]">Reali</span></span>
              ) : part
            )}
          </h2>
          <p className="text-[#F0F4F8]/60 max-w-lg mx-auto">{subtitle}</p>
        </div>

        {/* Cards — horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible scrollbar-hide">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.name}
              className="min-w-[280px] md:min-w-0 bg-gradient-to-br from-[#1B2A3D] to-[#0D1B2A] border border-[#D4A843]/20 rounded-2xl p-5 hover:border-[#D4A843]/40 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-[#F0F4F8]">{h.name}</p>
                  <p className="text-xs text-[#D4A843]">{h.domain}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[#D4A843] text-[#D4A843]" />
                  ))}
                </div>
              </div>

              <p className="text-sm text-[#F0F4F8]/60 italic mb-4 flex-1 leading-relaxed line-clamp-3">
                "{h.smv}"
              </p>

              <div className="flex items-center gap-4 text-xs text-[#F0F4F8]/50 mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-[#D4A843]/60" /> {h.timeMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-[#D4A843]/60" /> {h.generations} gen.
                </span>
              </div>

              <div className="pt-3 border-t border-[#F0F4F8]/10">
                <p className="text-xs text-[#F0F4F8]/40">Ofertă premium</p>
                <p className="text-sm font-bold text-[#D4A843]">{h.topPackage}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-2 text-[#D4A843] hover:text-[#F0C96A] font-semibold transition-colors group"
          >
            {ctaText}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
