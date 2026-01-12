import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import { 
  ArrowRight, 
  Zap, 
  Play, 
  GraduationCap,
  Building2,
  Users
} from 'lucide-react';

export function HeroSection() {
  const { t } = useI18n();

  const stats = [
    { value: '7,000+', label: t.landing.stats.activeStudents, icon: Users },
    { value: '50+', label: t.landing.stats.universitiesPartners, icon: Building2 },
    { value: '£250K+', label: t.landing.stats.revenueGenerated, icon: Zap },
  ];

  return (
    <section className="relative pt-40 pb-32">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-8 animate-fade-in">
            <GraduationCap className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">{t.landing.badge}</span>
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          </div>
          
          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight animate-slide-up">
            {t.landing.headline}{' '}
            <span className="text-gradient">{t.landing.headlineHighlight}</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed animate-slide-up delay-100">
            {t.landing.subheadline}
          </p>
          
          {/* Trust line */}
          <p className="text-lg text-accent font-medium mb-10 animate-slide-up delay-100">
            {t.landing.trustedBy}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-200">
            <Button size="lg" asChild className="gradient-accent text-accent-foreground font-semibold text-lg px-8 h-14 glow-accent hover:scale-105 transition-transform">
              <Link to="/auth/register">
                {t.landing.ctaStart}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" asChild variant="outline" className="h-14 px-8 text-lg border-border hover:bg-secondary group">
              <Link to="/pricing">
                {t.landing.ctaSeePlans}
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 animate-fade-in delay-300">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center group">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                    <div className="font-display text-4xl font-bold text-gradient">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
