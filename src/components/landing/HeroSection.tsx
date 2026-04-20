import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Zap, 
  Users,
  Building2,
  GraduationCap,
} from 'lucide-react';
import laptopImg from '@/assets/laptop-mockup.png';

export function HeroSection() {
  const { t, locale } = useI18n();
  const videoRef = useRef<HTMLDivElement>(null);

  // Load Voomly embed script for RO locale
  useEffect(() => {
    if (locale !== 'ro') return;
    const script = document.createElement('script');
    script.src = 'https://embed.voomly.softwarepublishingapp.com/embed/embed-build.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [locale]);

  const stats = [
    { value: '7,000+', label: t.landing.stats.activeStudents, icon: Users },
    { value: '50+', label: t.landing.stats.universitiesPartners, icon: Building2 },
    { value: '£250K+', label: t.landing.stats.revenueGenerated, icon: Zap },
  ];

  return (
    <section className="relative pt-40 pb-20">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left - Text Content */}
          <div className="text-center lg:text-left">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-8 animate-fade-in">
              <GraduationCap className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">{t.landing.badge}</span>
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            </div>
            
            {/* Headline */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight animate-slide-up">
              {t.landing.headline}{' '}
              <span className="text-gradient">{t.landing.headlineHighlight}</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-xl leading-relaxed animate-slide-up delay-100 lg:mx-0 mx-auto">
              {t.landing.subheadline}
            </p>
            
            {/* Trust line */}
            <p className="text-lg text-accent font-medium mb-10 animate-slide-up delay-100">
              {t.landing.trustedBy}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4 mb-12 animate-slide-up delay-200">
              <Button size="lg" asChild className="gradient-accent text-accent-foreground font-semibold text-lg px-8 h-14 glow-accent hover:scale-105 transition-transform">
                <a href="#pricing">
                  {t.landing.ctaStart}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" asChild variant="outline" className="h-14 px-8 text-lg border-border hover:bg-secondary group">
                <a href="#how">
                  {t.landing.ctaSeePlans}
                </a>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap lg:justify-start justify-center gap-10 animate-fade-in delay-300">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="text-center group">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                      <div className="font-display text-3xl font-bold text-gradient">
                        {stat.value}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right - Video / Laptop Mockup */}
          <div className="relative flex items-center justify-center animate-slide-up delay-200">
            <div className="relative w-full max-w-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 rounded-3xl blur-3xl scale-110" />
              {locale === 'ro' ? (
                <div
                  ref={videoRef}
                  className="voomly-embed relative rounded-xl overflow-hidden"
                  data-id="pcggwgMkQcgIoE6LkyREjJ5aSMMPD0DJjb9Rl5Z1HZnaNoRNe"
                  data-ratio="1.777778"
                  data-type="v"
                  data-skin-color="#2758EB"
                  data-shadow=""
                  style={{ width: '100%', aspectRatio: '1.77778 / 1', background: 'linear-gradient(45deg, rgb(142, 150, 164) 0%, rgb(201, 208, 222) 100%)', borderRadius: '10px' }}
                />
              ) : (
                <img 
                  src={laptopImg} 
                  alt="Platform preview" 
                  className="relative w-full drop-shadow-2xl"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
