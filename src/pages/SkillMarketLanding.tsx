import { useState, useEffect, useRef, useCallback } from "react";
import { useScrollReveal, useCountUp } from "@/hooks/useScrollReveal";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  type Lang,
  LANGS,
  SkillMarketLangProvider,
  useSkillMarketLang,
} from "@/lib/skillmarket-i18n";
import {
  Search,
  Target,
  Package,
  Users,
  FileText,
  Download,
  Briefcase,
  Laptop,
  Rocket,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Check,
  Shield,
  GraduationCap,
  Zap,
  Globe,
  Lock,
} from "lucide-react";
import logoImg from '@/assets/logo.png';
import laptopMockupImg from '@/assets/laptop-mockup.png';
import "./skillmarket.css";

/* ─── Language Selector ─── */
function LangSelector({ forceOpen }: { forceOpen?: boolean }) {
  const { lang } = useSkillMarketLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const current = LANGS.find((l) => l.code === lang)!;

  useEffect(() => {
    if (forceOpen) {
      const timer = setTimeout(() => {
        setOpen(true);
        setShowHint(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleSelect = (code: string) => {
    navigate(`/${code}`);
    setOpen(false);
    setShowHint(false);
  };

  return (
    <div className="relative">
      {showHint && open && (
        <div className="absolute right-0 bottom-full mb-2 whitespace-nowrap text-xs text-gold/80 animate-pulse font-medium tracking-wide">
          ↓ Choose your language
        </div>
      )}
      <button
        onClick={() => { setOpen(!open); setShowHint(false); }}
        className={`flex items-center gap-1.5 text-sm text-light-sm hover:text-gold transition-colors px-2 py-1 rounded-lg border hover:border-[#D4A843]/40 bg-[#0D1B2A]/60 ${showHint && open ? "border-[#D4A843]/60 ring-1 ring-[#D4A843]/30" : "border-[#D4A843]/20"}`}
      >
        <Globe className="h-3.5 w-3.5" />
        {current.flag} {current.label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-navy-card rounded-lg border border-[#D4A843]/20 overflow-hidden z-50 min-w-[120px] shadow-lg shadow-black/30">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#D4A843]/10 transition-colors ${l.code === lang ? "text-gold font-semibold bg-[#D4A843]/5" : "text-light-sm"}`}
            >
              {l.flag} {l.label}
              {l.code === lang && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Logo ─── */
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img src={logoImg} alt="Market Your Skill" className="w-8 h-8 rounded-lg" />
      <span className="font-bold text-lg">
        Market Your <span className="text-gold">Skill</span>
      </span>
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar({ autoOpenLangPicker }: { autoOpenLangPicker?: boolean }) {
  const { t } = useSkillMarketLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navItems = [
    { label: t.nav.howItWorks, href: "#how" },
    { label: t.nav.dream100, href: "#dream100" },
    { label: t.nav.whatYouGet, href: "#value" },
    { label: t.nav.eduforyou, href: "#eduforyou" },
    { label: t.nav.pricing, href: "#pricing" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "nav-glass" : ""}`}>
      <div className="sm-container flex items-center justify-between h-16">
        <Logo />
        <div className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-light-sm hover:text-gold transition-colors">
              {item.label}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <LangSelector forceOpen={autoOpenLangPicker} />
          <Link to="/auth/login" className="text-sm text-light-sm hover:text-gold transition-colors">
            {t.nav.login}
          </Link>
          <a href="#eduforyou" className="btn-gold-outline text-sm px-4 py-2 rounded-lg">
            {t.nav.eduBtn}
          </a>
          <a href="/waitlist" className="btn-gold text-sm px-4 py-2 rounded-lg">
            {t.nav.getAccess}
          </a>
        </div>
        <div className="flex lg:hidden items-center gap-3">
          <LangSelector forceOpen={autoOpenLangPicker} />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-light-sm p-2">
            <div className="space-y-1.5">
              <div className={`w-5 h-0.5 bg-current transition-all ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <div className={`w-5 h-0.5 bg-current transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <div className={`w-5 h-0.5 bg-current transition-all ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="lg:hidden bg-navy-card border-t border-[#D4A843]/10 px-4 py-4 space-y-3">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block text-sm text-light-sm hover:text-gold py-2">
              {item.label}
            </a>
          ))}
          <Link to="/auth/login" onClick={() => setMobileOpen(false)} className="block text-sm text-light-sm hover:text-gold py-2">
            {t.nav.login}
          </Link>
          <a href="/waitlist" onClick={() => setMobileOpen(false)} className="btn-gold block text-center text-sm px-4 py-3 rounded-lg mt-3">
            {t.nav.getAccess}
          </a>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  const { t, lang } = useSkillMarketLang();
  const connector = lang === "en" ? ", or " : lang === "ro" ? " sau " : " або ";
  const heroRef = useRef<HTMLDivElement>(null);
  const [parallaxY, setParallaxY] = useState(0);

  // Load Voomly embed script for RO locale
  useEffect(() => {
    if (lang !== 'ro') return;
    const script = document.createElement('script');
    script.src = 'https://embed.voomly.softwarepublishingapp.com/embed/embed-build.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [lang]);

  // Parallax on hero grid
  useEffect(() => {
    const handler = () => setParallaxY(window.scrollY * 0.15);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero-bg pt-32 pb-20 min-h-[90vh] flex items-center overflow-hidden relative"
      style={{ backgroundPositionY: `${parallaxY}px` }}
    >
      <div className="sm-container">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6 sm-fade-up">
              <span className="section-badge">{t.hero.badge}</span>
              <span className="text-sm text-muted-sm">{t.hero.badgeSub}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-6 sm-fade-up" style={{ animationDelay: "0.1s" }}>
              {t.hero.headline1}{" "}
              <span className="text-gold italic">{t.hero.headlineGold}</span>{" "}
              {t.hero.headline2}
            </h1>

            <p className="text-lg md:text-xl text-light-sm mb-8 max-w-2xl leading-relaxed sm-fade-up" style={{ animationDelay: "0.2s" }}>
              {t.hero.sub}{" "}
              <strong className="text-white">{t.hero.subBold1}</strong>,{" "}
              <strong className="text-white">{t.hero.subBold2}</strong>
              {connector}
              <strong className="text-white">{t.hero.subBold3}</strong>{" "}
              {t.hero.subEnd}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10 sm-fade-up" style={{ animationDelay: "0.3s" }}>
              <a href="#pricing" className="btn-gold px-8 py-4 rounded-xl text-base flex items-center justify-center gap-2">
                {t.hero.cta1} <ArrowRight className="h-4 w-4" />
              </a>
              <a href="/auth/register-eduforyou" className="btn-gold-outline px-8 py-4 rounded-xl text-base text-center">
                {t.hero.cta2}
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-sm sm-fade-up" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"].map((c, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-[#0D1B2A] flex items-center justify-center text-xs font-bold text-white`}>
                      {["A", "M", "R", "S"][i]}
                    </div>
                  ))}
                </div>
                <span>{t.hero.social1}</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-[#D4A843] text-[#D4A843]" />
                ))}
                <span className="ml-1">{t.hero.social2}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-400" />
                <span>{t.hero.social3}</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:flex justify-center sm-fade-up" style={{ animationDelay: "0.25s" }}>
            <div className="pointer-events-none absolute inset-x-8 top-1/2 h-56 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(212,168,67,0.28)_0%,_rgba(212,168,67,0.08)_38%,_transparent_72%)] blur-3xl" />
            {lang === 'ro' ? (
              <div
                className="voomly-embed relative z-10 w-full max-w-[620px] rounded-xl overflow-hidden"
                data-id="pcggwgMkQcgIoE6LkyREjJ5aSMMPD0DJjb9Rl5Z1HZnaNoRNe"
                data-ratio="1.777778"
                data-type="v"
                data-skin-color="#2758EB"
                data-shadow=""
                style={{ width: '100%', aspectRatio: '1.77778 / 1', background: 'linear-gradient(45deg, rgb(142, 150, 164) 0%, rgb(201, 208, 222) 100%)', borderRadius: '10px' }}
              />
            ) : (
              <img
                src={laptopMockupImg}
                alt="Market Your Skill platform preview"
                className="relative z-10 w-full max-w-[620px] object-contain drop-shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
                loading="eager"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
/* ─── Tagline Banner ─── */
function TaglineBanner() {
  const { t } = useSkillMarketLang();
  return (
    <div className="gold-divider" >
      <div className="bg-[#162236] py-8 text-center">
        <div className="sm-container">
          <p className="text-base sm:text-xl md:text-2xl font-semibold leading-relaxed px-4">
            <span className="text-light-sm">{t.tagline.part1}</span>{" "}
            <span className="text-gold">{t.tagline.part2}</span>
          </p>
        </div>
      </div>
      <div className="gold-divider" />
    </div>
  );
}

/* ─── MindsetShift removed — banner moved to HowItWorks ─── */


function StatCard({ stat, index }: { stat: { value: string; label: string }; index: number }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  // Extract numeric value for counter (e.g. "7+" -> 7, "100+" -> 100)
  const numericMatch = stat.value.match(/(\d+)/);
  const numericValue = numericMatch ? parseInt(numericMatch[1]) : 0;
  const suffix = stat.value.replace(/\d+/, '');
  const count = useCountUp(numericValue, isVisible, 1200);

  return (
    <div
      ref={ref}
      className={`card-gold rounded-xl p-6 text-center sm-scale-in sm-stagger-${index + 1} ${isVisible ? 'sm-visible' : ''}`}
    >
      <div className="text-3xl md:text-4xl font-bold text-gold font-['Playfair_Display']">
        {isVisible ? `${count}${suffix}` : stat.value}
      </div>
      <div className="text-sm text-muted-sm mt-2">{stat.label}</div>
    </div>
  );
}

function Stats() {
  const { t } = useSkillMarketLang();
  const stats = [t.stats.s1, t.stats.s2, t.stats.s3, t.stats.s4];
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollReveal<HTMLElement>();

  return (
    <section ref={sectionRef} className="py-16">
      <div className="sm-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
/* ─── How It Works ─── */
function HowItWorks() {
  const { t, lang } = useSkillMarketLang();
  const icons = [Search, Target, Package, Users, FileText, Download];
  const numbers = ["01", "02", "03", "04", "05", "06"];
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: bannerRef, isVisible: bannerVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: step0Ref, isVisible: step0Visible } = useScrollReveal<HTMLDivElement>();

  const stepImages: (string | null)[] = [
    "/images/landing/step-skill-scanner.png",
    "/images/landing/step-ikigai-builder.png",
    "/images/landing/step-offer-builder.png",
    "/images/landing/step-dream100-tracker.png",
    "/images/landing/step-cv-sales-page.png",
    "/images/landing/step-freedom-plan-export.png",
  ];

  return (
    <section id="how" className="py-20">
      <div className="sm-container">
        <div ref={headerRef} className={`text-center mb-16 sm-reveal ${headerVisible ? 'sm-visible' : ''}`}>
          <span className="section-badge">{t.how.badge}</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-6 mb-2">
            {t.how.title1}
          </h2>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t.how.title2} <span className="text-gold italic">{t.how.titleGold}</span>
          </h2>
          <p className="text-light-sm max-w-2xl mx-auto">{t.how.sub}</p>
        </div>

        {/* 7-Steps Banner */}
        <div ref={bannerRef} className={`w-full mb-12 sm-reveal ${bannerVisible ? 'sm-visible' : ''}`}>
          <div className="card-gold rounded-2xl overflow-hidden">
            <img
              src={lang === 'en' ? "/images/landing/banner-7-steps-en.png" : "/images/landing/banner-7-steps.png"}
              alt="Market Your Skill - 7 Steps Process"
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </div>
        </div>

        {/* Step 0 — DNA Test (highlighted card) */}
        <div ref={step0Ref} className={`mb-8 sm-scale-in ${step0Visible ? 'sm-visible' : ''}`}>
          <div className="card-gold rounded-2xl relative overflow-hidden border-2 border-[#D4A843]/40"
            style={{ boxShadow: '0 0 40px rgba(212, 168, 67, 0.15)' }}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,_rgba(212,168,67,0.12)_0%,_transparent_70%)] pointer-events-none" />
            <div className="flex flex-col md:flex-row-reverse items-stretch relative z-10">
              <div className="md:w-64 lg:w-80 flex-shrink-0">
                <img
                  src="/images/landing/step-adn-test.png"
                  alt="Verifică ADN-ul Tău"
                  className="w-full h-48 md:h-full object-cover md:rounded-r-2xl sm-img-hover"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col justify-center gap-6 p-8 flex-grow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-gold/30 text-5xl font-bold font-['Playfair_Display'] leading-none">
                      00
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-[#D4A843]/15 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-gold" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold mb-2 font-['Playfair_Display'] text-gold">
                      {t.how.step0.title}
                    </h3>
                    <p className="text-sm text-light-sm leading-relaxed max-w-xl">{t.how.step0.desc}</p>
                  </div>
                </div>
                <Link
                  to={`/adn-test/${lang}`}
                  className="btn-gold px-6 py-3 rounded-xl text-sm flex items-center gap-2 whitespace-nowrap self-start"
                >
                  {t.how.step0.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {t.how.steps.map((step, i) => {
            const Icon = icons[i];
            const img = stepImages[i];
            const isEven = i % 2 === 0;
            return (
              <StepCard key={i} step={step} icon={Icon} img={img} isEven={isEven} number={numbers[i]} index={i} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Step Card with scroll reveal ─── */
function StepCard({ step, icon: Icon, img, isEven, number, index }: {
  step: { title: string; desc: string };
  icon: any;
  img: string | null;
  isEven: boolean;
  number: string;
  index: number;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const slideClass = isEven ? 'sm-slide-left' : 'sm-slide-right';

  return (
    <div ref={ref} className={`card-gold rounded-2xl overflow-hidden sm-reveal sm-stagger-${Math.min(index + 1, 6)} ${isVisible ? 'sm-visible' : ''}`}>
      <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-stretch`}>
        {/* Image side with slide animation */}
        <div className={`md:w-72 lg:w-80 flex-shrink-0 bg-[#0D1B2A] ${slideClass} ${isVisible ? 'sm-visible' : ''}`}>
          {img ? (
            <img
              src={img}
              alt={step.title}
              className="w-full h-full object-cover aspect-square md:aspect-auto sm-img-hover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-[#D4A843]/5">
              <Icon className="h-16 w-16 text-gold/20" />
            </div>
          )}
        </div>
        {/* Text side */}
        <div className="flex-grow p-8 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-gold/30 text-5xl font-bold font-['Playfair_Display'] leading-none">
              {number}
            </span>
            <div className="w-10 h-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-gold" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-3 font-['Playfair_Display'] text-gold">
            {step.title}
          </h3>
          <p className="text-sm text-muted-sm leading-relaxed max-w-lg">{step.desc}</p>
        </div>
      </div>
    </div>
  );
}
/* ─── Dream 100 ─── */
function Dream100() {
  const { t } = useSkillMarketLang();
  const pathIcons = [Briefcase, Laptop, Rocket];
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: bannerRef, isVisible: bannerVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="dream100" className="py-20 bg-navy-light">
      <div className="sm-container">
        <div ref={headerRef} className={`text-center mb-16 sm-reveal ${headerVisible ? 'sm-visible' : ''}`}>
          <span className="section-badge">{t.dream100.badge}</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-6 mb-2">
            {t.dream100.title1}
          </h2>
          <h2 className="text-3xl md:text-5xl font-bold text-gold italic mb-6">
            {t.dream100.titleGold}
          </h2>
          <p className="text-light-sm max-w-2xl mx-auto">{t.dream100.sub}</p>
        </div>

        {/* Dream100 Banner */}
        <div ref={bannerRef} className={`mb-16 sm-reveal ${bannerVisible ? 'sm-visible' : ''}`}>
          <img
            src="/images/landing/dream100-banner-wide.png"
            alt="Dream 100 - 3 Căi"
            className="w-full h-auto rounded-2xl"
            loading="lazy"
          />
        </div>

        <div ref={cardsRef} className="grid lg:grid-cols-3 gap-6">
          {t.dream100.paths.map((path, i) => {
            const Icon = pathIcons[i];
            return (
              <div key={i} className={`card-gold rounded-xl p-6 flex flex-col sm-scale-in sm-stagger-${i + 1} ${cardsVisible ? 'sm-visible' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                  <span className="section-badge text-xs">{path.tag}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 font-['Playfair_Display']">{path.title}</h3>
                <p className="text-gold font-medium text-sm mb-4">{path.headline}</p>
                <ul className="space-y-2 mb-6 flex-grow">
                  {path.points.map((pt, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-light-sm">
                      <Check className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-sm italic border-t border-[#D4A843]/10 pt-4">
                  "{path.cta}"
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
/* ─── Value Stack ─── */
function ValueStack() {
  const { t } = useSkillMarketLang();
  const icons = [Search, Target, Package, Users, FileText, Download, Search, GraduationCap, Zap, Download, Users, Shield];
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="value" className="py-20">
      <div className="sm-container">
        <div ref={headerRef} className={`text-center mb-16 sm-reveal ${headerVisible ? 'sm-visible' : ''}`}>
          <span className="section-badge">{t.value.badge}</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-6 mb-2">
            {t.value.title1}
          </h2>
          <h2 className="text-3xl md:text-5xl font-bold text-gold italic mb-6">
            {t.value.titleGold}
          </h2>
          <p className="text-light-sm max-w-2xl mx-auto">{t.value.sub}</p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {t.value.items.map((item, i) => {
            const Icon = icons[i] || Zap;
            return (
              <div key={i} className={`card-gold rounded-xl p-5 flex items-start gap-4 sm-scale-in sm-stagger-${Math.min(i + 1, 6)} ${gridVisible ? 'sm-visible' : ''}`}>
                <div className="w-10 h-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <span className="text-gold font-bold text-sm whitespace-nowrap">{item.value}</span>
                  </div>
                  <p className="text-xs text-muted-sm">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`text-center mt-12 sm-reveal ${gridVisible ? 'sm-visible' : ''}`} style={{ transitionDelay: '0.4s' }}>
          <p className="text-light-sm mb-2">{t.value.totalLabel}</p>
          <p className="text-sm text-muted-sm mb-6">{t.value.totalSub}</p>
          <a href="/waitlist" className="btn-gold px-8 py-4 rounded-xl text-base inline-flex items-center gap-2">
            {t.value.totalCta} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
/* ─── EduForYou ─── */
function EduForYou() {
  const { t } = useSkillMarketLang();
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} id="eduforyou" className="py-20 bg-navy-light">
      <div className="sm-container">
        <div className={`max-w-3xl mx-auto text-center sm-reveal ${isVisible ? 'sm-visible' : ''}`}>
          <span className="section-badge">{t.edu.badge}</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-6 mb-4 font-['Playfair_Display']">
            {t.edu.title}
          </h2>
          <p className="text-2xl font-bold text-gold mb-4">{t.edu.sub}</p>
          <p className="text-light-sm mb-10">{t.edu.desc}</p>

          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {t.edu.rows.map((row, i) => (
              <div key={i} className={`card-gold rounded-xl p-5 text-center sm-scale-in sm-stagger-${i + 1} ${isVisible ? 'sm-visible' : ''}`}>
                <p className="text-xs text-muted-sm mb-1">{row.label}</p>
                <p className="text-2xl font-bold text-gold font-['Playfair_Display']">{row.value}</p>
                <p className="text-xs text-light-sm mt-1">{row.note}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <a href="#pricing" className="btn-gold px-8 py-4 rounded-xl text-base inline-flex items-center gap-2">
              {t.edu.cta1} <ArrowRight className="h-4 w-4" />
            </a>
            <div>
              <a href="#" className="text-gold text-sm hover:underline">{t.edu.cta2}</a>
            </div>
            <p className="text-sm text-muted-sm">
              {t.edu.notYet}{" "}
              <a href="#" className="text-gold hover:underline">{t.edu.applyNow}</a>{" "}
              {t.edu.notYetEnd}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
/* ─── Pricing ─── */
function Pricing() {
  const { t } = useSkillMarketLang();
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="pricing" className="py-20">
      <div className="sm-container">
        <div ref={headerRef} className={`text-center mb-16 sm-reveal ${headerVisible ? 'sm-visible' : ''}`}>
          <span className="section-badge">{t.pricing.badge}</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-6 mb-2">
            {t.pricing.title1}
          </h2>
          <h2 className="text-3xl md:text-5xl font-bold text-gold italic mb-6">
            {t.pricing.titleGold}
          </h2>
          <p className="text-light-sm max-w-2xl mx-auto">{t.pricing.sub}</p>
        </div>

        <div ref={cardsRef} className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {t.pricing.plans.map((plan, i) => (
            <div key={i} className={`card-gold rounded-2xl p-6 flex flex-col relative sm-scale-in sm-stagger-${i + 1} ${cardsVisible ? 'sm-visible' : ''} ${plan.popular ? "popular-glow" : ""}`}>
              {plan.badge && (
                <span className={`section-badge text-xs mb-4 self-start ${plan.popular ? "bg-[#D4A843]/20" : ""}`}>
                  {plan.badge}
                </span>
              )}
              <h3 className="text-xl font-bold font-['Playfair_Display'] mb-2">{plan.name}</h3>
              <div className="mb-1">
                <span className="text-3xl font-bold text-gold">{plan.price}</span>
                {(plan as any).fullPrice && <span className="text-lg text-muted-sm line-through ml-2">{(plan as any).fullPrice}</span>}
              </div>
              {plan.priceSub && <p className="text-xs text-muted-sm mb-1">{plan.priceSub}</p>}
              {(plan as any).fullPrice && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Lock className="h-3 w-3 text-gold" />
                  <span className="text-xs font-medium text-gold">Early Bird Rate</span>
                </div>
              )}
              <p className="text-sm text-muted-sm mb-6">{plan.sub}</p>
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-light-sm">
                    <Check className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/pricing"
                className={`w-full py-3 rounded-xl text-center text-sm font-semibold ${plan.popular ? "btn-gold" : "btn-gold-outline"}`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <div className={`text-center mt-12 sm-reveal ${cardsVisible ? 'sm-visible' : ''}`} style={{ transitionDelay: '0.3s' }}>
          <div className="flex items-center justify-center gap-2 text-gold mb-2">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">{t.pricing.guarantee}</span>
          </div>
          <p className="text-sm text-muted-sm">{t.pricing.guaranteeSub}</p>
        </div>
      </div>
    </section>
  );
}
/* ─── FAQ ─── */
function FAQ() {
  const { t } = useSkillMarketLang();
  const [open, setOpen] = useState<number | null>(null);
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} id="faq" className="py-20 bg-navy-light">
      <div className="sm-container max-w-3xl">
        <div className={`text-center mb-16 sm-reveal ${isVisible ? 'sm-visible' : ''}`}>
          <span className="section-badge">{t.faq.badge}</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-6 mb-2">
            {t.faq.title1}
          </h2>
          <h2 className="text-3xl md:text-5xl font-bold text-gold italic">
            {t.faq.titleGold}
          </h2>
        </div>

        <div className="space-y-3">
          {t.faq.items.map((faq, i) => (
            <div key={i} className={`card-gold rounded-xl overflow-hidden sm-reveal sm-stagger-${Math.min(i + 1, 6)} ${isVisible ? 'sm-visible' : ''}`}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-sm pr-4">{faq.q}</span>
                {open === i ? (
                  <ChevronUp className="h-4 w-4 text-gold flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-sm flex-shrink-0" />
                )}
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-light-sm leading-relaxed border-t border-[#D4A843]/10 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
/* ─── Footer ─── */
function Footer() {
  const { t } = useSkillMarketLang();

  return (
    <footer className="py-12 border-t border-[#D4A843]/10">
      <div className="sm-container">
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo />
          <p className="text-sm text-muted-sm">{t.footer.powered}</p>
          <div className="flex gap-6 text-sm">
            {[t.footer.terms, t.footer.privacy, t.footer.contact].map((l) => (
              <a key={l} href="#" className="text-muted-sm hover:text-gold transition-colors">
                {l}
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-sm">© {t.footer.rights}</p>
          <p className="text-xs text-muted-sm">{t.footer.registered}</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Page ─── */
function SkillMarketPage({ autoOpenLangPicker }: { autoOpenLangPicker?: boolean }) {
  return (
    <div className="skillmarket-landing">
      <Navbar autoOpenLangPicker={autoOpenLangPicker} />
      <Hero />
      <TaglineBanner />
      
      <Stats />
      <HowItWorks />
      <Dream100 />
      <ValueStack />
      <EduForYou />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

/* ─── Wrapper with lang from route ─── */
export default function SkillMarketLanding({ autoOpenLangPicker }: { autoOpenLangPicker?: boolean } = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const pathLang = location.pathname.replace("/", "") as Lang;
  const validLang = (["ro", "en", "ua"].includes(pathLang) ? pathLang : "ro") as Lang;

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (!loading && user) return null;

  return (
    <SkillMarketLangProvider lang={validLang}>
      <SkillMarketPage autoOpenLangPicker={autoOpenLangPicker} />
    </SkillMarketLangProvider>
  );
}
