import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Zap, 
  Sparkles, 
  Crown, 
  Users, 
  GraduationCap,
  ArrowRight,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface PlanFeature {
  name: string;
  included: boolean | string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  icon: React.ElementType;
  color: string;
  features: PlanFeature[];
  popular?: boolean;
  cta: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect pentru a începe',
    price: { monthly: 0, yearly: 0 },
    icon: Zap,
    color: 'gray',
    cta: 'Începe Gratuit',
    features: [
      { name: '1 platformă de freelancing', included: true },
      { name: '3 gig-uri active', included: true },
      { name: 'Skill Scanner basic', included: true },
      { name: 'Ikigai Builder', included: true },
      { name: 'AI Generations', included: '5/lună' },
      { name: 'Profile Builder', included: false },
      { name: 'Outreach Templates', included: false },
      { name: 'Income Tracker', included: false },
      { name: 'Export PDF/DOCX', included: false },
      { name: 'Priority Support', included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Pentru freelanceri serioși',
    price: { monthly: 9, yearly: 90 },
    icon: Sparkles,
    color: 'blue',
    cta: 'Începe cu Starter',
    features: [
      { name: '3 platforme de freelancing', included: true },
      { name: '15 gig-uri active', included: true },
      { name: 'Skill Scanner avansat', included: true },
      { name: 'Ikigai Builder', included: true },
      { name: 'AI Generations', included: '50/lună' },
      { name: 'Profile Builder', included: true },
      { name: 'Outreach Templates', included: '5 template-uri' },
      { name: 'Income Tracker', included: true },
      { name: 'Export PDF/DOCX', included: true },
      { name: 'Priority Support', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Toate funcționalitățile deblocate',
    price: { monthly: 19, yearly: 190 },
    icon: Crown,
    color: 'purple',
    popular: true,
    cta: 'Upgrade la Pro',
    features: [
      { name: 'Toate platformele', included: true },
      { name: 'Gig-uri nelimitate', included: true },
      { name: 'Skill Scanner avansat', included: true },
      { name: 'Ikigai Builder', included: true },
      { name: 'AI Generations', included: 'Nelimitat' },
      { name: 'Profile Builder', included: true },
      { name: 'Outreach Templates', included: 'Nelimitat' },
      { name: 'Income Tracker + Analytics', included: true },
      { name: 'Export PDF/DOCX', included: true },
      { name: 'Priority Support', included: true },
    ],
  },
  {
    id: 'team',
    name: 'Team',
    description: 'Pentru echipe și organizații',
    price: { monthly: 49, yearly: 490 },
    icon: Users,
    color: 'orange',
    cta: 'Contactează-ne',
    features: [
      { name: 'Toate platformele', included: true },
      { name: 'Gig-uri nelimitate', included: true },
      { name: 'Multi-user (5+ membri)', included: true },
      { name: 'Team Dashboard', included: true },
      { name: 'AI Generations', included: 'Nelimitat' },
      { name: 'Profile Builder', included: true },
      { name: 'Outreach Templates', included: 'Nelimitat' },
      { name: 'Advanced Analytics', included: true },
      { name: 'API Access', included: true },
      { name: 'Dedicated Support', included: true },
    ],
  },
];

export default function Pricing() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(false);

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === 'free') {
      toast.success('Folosești deja planul Free!');
      return;
    }
    toast.info(`Upgrade la ${plan.name} va fi disponibil în curând!`);
  };

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
    const colors: Record<string, Record<string, string>> = {
      gray: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/30' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
      orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
    };
    return colors[color]?.[type] || '';
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4 gap-2">
            <GraduationCap className="h-4 w-4" />
            50% reducere pentru studenți cu email .edu
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Alege Planul Tău de{' '}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Freedom
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Deblochează potențialul tău de freelancer cu uneltele potrivite pentru tine.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Lunar
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Anual
          </span>
          {isYearly && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/30">
              Economisești 17%
            </Badge>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full flex flex-col p-6 ${
                plan.popular 
                  ? 'border-2 border-primary shadow-xl shadow-primary/10' 
                  : 'border-border'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground gap-1">
                      <Star className="h-3 w-3" />
                      Cel mai popular
                    </Badge>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-xl ${getColorClasses(plan.color, 'bg')} flex items-center justify-center mb-4`}>
                    <plan.icon className={`h-6 w-6 ${getColorClasses(plan.color, 'text')}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {isYearly 
                        ? Math.round(plan.price.yearly / 12)
                        : plan.price.monthly
                      }€
                    </span>
                    <span className="text-muted-foreground">/lună</span>
                  </div>
                  {isYearly && plan.price.yearly > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Facturat {plan.price.yearly}€/an
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${
                        feature.included ? 'text-foreground' : 'text-muted-foreground/60'
                      }`}>
                        {feature.name}
                        {typeof feature.included === 'string' && (
                          <span className="text-primary font-medium ml-1">
                            ({feature.included})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button 
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full gap-2 ${
                    plan.popular 
                      ? '' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                  variant={plan.popular ? 'default' : 'secondary'}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ or Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            Ai întrebări? <a href="/settings" className="text-primary hover:underline">Contactează-ne</a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
