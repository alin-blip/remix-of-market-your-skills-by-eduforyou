import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useTheme } from 'next-themes';
import { 
  Target, 
  Package, 
  MessageSquare, 
  ArrowRight,
  CheckCircle2,
  Globe,
  Sun,
  Moon,
  Monitor,
  Sparkles,
} from 'lucide-react';
import logoImg from '@/assets/logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Import new landing sections
import { HeroSection } from '@/components/landing/HeroSection';
import { ForWhomSection } from '@/components/landing/ForWhomSection';
import { PartnersSection } from '@/components/landing/PartnersSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingPreview } from '@/components/landing/PricingPreview';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Landing() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();

  const features = [
    {
      icon: Sparkles,
      title: t.landing.features.skillScanner.title,
      description: t.landing.features.skillScanner.description,
      color: 'from-primary to-purple-500',
    },
    {
      icon: Target,
      title: t.landing.features.ikigaiBuilder.title,
      description: t.landing.features.ikigaiBuilder.description,
      color: 'from-accent to-lime-400',
    },
    {
      icon: Package,
      title: t.landing.features.offerBuilder.title,
      description: t.landing.features.offerBuilder.description,
      color: 'from-blue-500 to-cyan-400',
    },
    {
      icon: MessageSquare,
      title: t.landing.features.outreachGenerator.title,
      description: t.landing.features.outreachGenerator.description,
      color: 'from-pink-500 to-rose-400',
    },
  ];

  const steps = [
    { step: '00', title: t.landing.steps.step0?.title || 'DNA Execution Test', desc: t.landing.steps.step0?.desc || 'Discover your professional profile' },
    { step: '01', title: t.landing.steps.step1.title, desc: t.landing.steps.step1.desc },
    { step: '02', title: t.landing.steps.step2.title, desc: t.landing.steps.step2.desc },
    { step: '03', title: t.landing.steps.step3.title, desc: t.landing.steps.step3.desc },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Gradient background effects */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 gradient-glow pointer-events-none" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logoImg} alt="Market Your Skill" className="h-10 w-10 rounded-xl shadow-lg group-hover:scale-110 transition-transform" />
            <span className="font-display font-bold text-xl tracking-tight">
              Market Your <span className="text-accent">Skill</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocale('ro')} className={cn(locale === 'ro' && 'bg-accent')}>
                  🇷🇴 Română
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('en')} className={cn(locale === 'en' && 'bg-accent')}>
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  {theme === 'light' ? <Sun className="h-5 w-5" /> : theme === 'dark' ? <Moon className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')} className={cn(theme === 'light' && 'bg-accent')}>
                  <Sun className="h-4 w-4 mr-2" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className={cn(theme === 'dark' && 'bg-accent')}>
                  <Moon className="h-4 w-4 mr-2" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className={cn(theme === 'system' && 'bg-accent')}>
                  <Monitor className="h-4 w-4 mr-2" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/auth/login">{t.landing.login}</Link>
            </Button>
            <Button asChild className="gradient-accent text-accent-foreground font-semibold px-6 glow-accent hover:scale-105 transition-transform">
              <Link to="/auth/register">
                {t.landing.startFree}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* New Hero Section */}
      <HeroSection />

      {/* For Whom Section */}
      <ForWhomSection />

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {t.landing.featuresTitle} <span className="text-gradient">{t.landing.featuresTitleHighlight}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.landing.featuresSubtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={i}
                  className="group p-8 rounded-2xl glass card-shine hover-lift cursor-default"
                >
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-2xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {t.landing.stepsTitle} <span className="text-accent">{t.landing.stepsTitleHighlight}</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((item, i) => (
              <div key={i} className="relative text-center group">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-border to-transparent" />
                )}
                
                <div className="inline-flex h-20 w-20 rounded-2xl glass items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="font-display text-3xl font-bold text-gradient">{item.step}</span>
                </div>
                <h3 className="font-display font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <PartnersSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Preview */}
      <PricingPreview />

      {/* Benefits / CTA Section */}
      <section className="py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="p-12 rounded-3xl glass glow-primary relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
              
              <div className="relative">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
                  {t.landing.benefitsTitle} <span className="text-accent">{t.landing.benefitsTitleHighlight}</span>
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {t.landing.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                      <span className="font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 text-center">
                  <Button size="lg" asChild className="gradient-accent text-accent-foreground font-semibold text-lg px-10 h-14 glow-accent hover:scale-105 transition-transform">
                    <Link to="/auth/register">
                      {t.landing.ctaFinal}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
