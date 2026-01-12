import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import { Check, ArrowRight, Zap, Sparkles, Crown, GraduationCap } from 'lucide-react';

export function PricingPreview() {
  const { t } = useI18n();

  const plans = [
    {
      name: 'Free',
      price: 0,
      icon: Zap,
      color: 'gray',
      features: [
        t.landing.pricingPreview.features.free1,
        t.landing.pricingPreview.features.free2,
        t.landing.pricingPreview.features.free3,
      ],
    },
    {
      name: 'Starter',
      price: 9,
      icon: Sparkles,
      color: 'blue',
      features: [
        t.landing.pricingPreview.features.starter1,
        t.landing.pricingPreview.features.starter2,
        t.landing.pricingPreview.features.starter3,
      ],
    },
    {
      name: 'Pro',
      price: 19,
      icon: Crown,
      color: 'purple',
      popular: true,
      features: [
        t.landing.pricingPreview.features.pro1,
        t.landing.pricingPreview.features.pro2,
        t.landing.pricingPreview.features.pro3,
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      gray: { bg: 'bg-secondary', text: 'text-muted-foreground' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      purple: { bg: 'bg-primary/10', text: 'text-primary' },
    };
    return colors[color] || colors.gray;
  };

  return (
    <section className="py-24 relative">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 gap-2 border-accent text-accent">
            <GraduationCap className="h-4 w-4" />
            {t.landing.pricingPreview.studentDiscount}
          </Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            {t.landing.pricingPreview.title}{' '}
            <span className="text-gradient">{t.landing.pricingPreview.titleHighlight}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.landing.pricingPreview.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const colors = getColorClasses(plan.color);
            return (
              <div 
                key={i}
                className={`p-6 rounded-2xl glass card-shine hover-lift relative ${
                  plan.popular ? 'border-2 border-primary ring-2 ring-primary/20' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    {t.landing.pricingPreview.popular}
                  </Badge>
                )}
                
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                
                <h3 className="font-display font-bold text-xl mb-2">{plan.name}</h3>
                
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                
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
          <Button size="lg" asChild variant="outline" className="h-12 px-8 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
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
