import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import { Check, ArrowRight, Sparkles, Crown, Rocket, Lock } from 'lucide-react';

export function PricingPreview() {
  const { t } = useI18n();

  const plans = [
    {
      name: 'Starter',
      earlyPrice: '£49',
      fullPrice: '£98',
      period: '/lună',
      icon: Sparkles,
      color: 'blue',
      trial: true,
      features: [
        t.landing.pricingPreview.features.starter1,
        t.landing.pricingPreview.features.starter2,
        t.landing.pricingPreview.features.starter3,
      ],
    },
    {
      name: 'Pro',
      earlyPrice: '£97',
      fullPrice: '£194',
      period: '/lună',
      icon: Crown,
      color: 'amber',
      popular: true,
      features: [
        t.landing.pricingPreview.features.pro1,
        t.landing.pricingPreview.features.pro2,
        t.landing.pricingPreview.features.pro3,
      ],
      proGlow: true,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <section className="py-24 relative">
      <div className="container">
        <div className="text-center mb-12">
          <Badge className="mb-4 gap-2 bg-amber-500/10 text-amber-600 border-amber-500/30">
            <Rocket className="h-4 w-4" />
            {t.landing.pricingPreview.studentDiscount}
          </Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            {t.landing.pricingPreview.title}{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {t.landing.pricingPreview.titleHighlight}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.landing.pricingPreview.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const colors = getColorClasses(plan.color);
            return (
              <div 
                key={i}
                className={`p-6 rounded-2xl glass card-shine hover-lift relative ${
                  plan.popular ? 'pro-border-glow' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    {t.landing.pricingPreview.popular}
                  </Badge>
                )}
                
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                
                <h3 className="font-display font-bold text-xl mb-2">{plan.name}</h3>
                
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold">{plan.earlyPrice}</span>
                  <span className="text-lg text-muted-foreground line-through">{plan.fullPrice}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <div className="flex items-center gap-1.5 mb-4">
                  <Lock className="h-3 w-3 text-amber-500" />
                  <span className="text-xs font-medium text-amber-600">Early Bird — blocat pentru totdeauna</span>
                </div>

                {plan.trial && (
                  <div className="mb-4 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium inline-block">
                    7 zile gratuit
                  </div>
                )}
                
                <ul className="space-y-2">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        
        <div className="text-center">
          <Button size="lg" asChild variant="outline" className="h-12 px-8 text-lg border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors">
            <Link to="/pricing">
              {t.landing.pricingPreview.cta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
