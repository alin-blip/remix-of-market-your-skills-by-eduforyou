import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Sparkles, 
  Crown, 
  GraduationCap,
  ArrowRight,
  Star,
  Loader2,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useSubscription } from '@/hooks/useSubscription';

interface PlanFeature {
  name: string;
  included: boolean | string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  priceNote?: string;
  icon: React.ElementType;
  features: PlanFeature[];
  popular?: boolean;
  cta: string;
  trial?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Începe cu 7 zile gratuit — card necesar',
    price: 'Gratuit',
    priceNote: '7 zile trial, apoi £97/lună',
    icon: Sparkles,
    cta: 'Începe Trial 7 Zile',
    trial: true,
    features: [
      { name: '3 platforme de freelancing', included: true },
      { name: '15 gig-uri active', included: true },
      { name: 'Skill Scanner', included: true },
      { name: 'Ikigai Builder', included: true },
      { name: 'AI Generations', included: '50/lună' },
      { name: 'Profile Builder', included: true },
      { name: 'Outreach Templates', included: '5 template-uri' },
      { name: 'Income Tracker', included: true },
      { name: 'Export PDF/DOCX', included: true },
      { name: 'Dream 100 Tracker', included: false },
      { name: 'CV Generator', included: false },
      { name: 'Outreach Sequences', included: false },
      { name: 'Certificări cursuri', included: false },
      { name: 'Priority Support', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Toate funcționalitățile deblocate',
    price: '£97',
    priceNote: '/lună',
    icon: Crown,
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
      { name: 'Dream 100 Tracker', included: true },
      { name: 'CV Generator', included: true },
      { name: 'Outreach Sequences', included: true },
      { name: 'Certificări cursuri', included: true },
      { name: 'Priority Support', included: true },
    ],
  },
  {
    id: 'eduforyou',
    name: 'EduForYou',
    description: 'Acces complet Pro pentru membrii Privilege Card',
    price: 'Gratuit',
    priceNote: 'Privilege Card',
    icon: GraduationCap,
    cta: 'Contactează Admin',
    features: [
      { name: 'Toate funcțiile Pro incluse', included: true },
      { name: 'Platforme nelimitate', included: true },
      { name: 'AI Generations nelimitate', included: true },
      { name: 'Dream 100 Tracker', included: true },
      { name: 'CV Generator', included: true },
      { name: 'Outreach Sequences', included: true },
      { name: 'Activat de admin', included: true },
      { name: 'Fără plată', included: true },
      { name: 'Learning Hub (cursuri separate)', included: false },
    ],
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkoutPro, isLoading } = useStripeCheckout();
  const { plan: currentPlan } = useSubscription();

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      toast.info('Trebuie să te autentifici pentru a continua');
      navigate('/auth/login');
      return;
    }
    
    if (plan.id === 'eduforyou') {
      toast.info('Contactează un administrator pentru activarea Privilege Card');
      return;
    }
    
    if (plan.id === 'starter') {
      // Start 7-day trial
      await checkoutPro(true);
    } else if (plan.id === 'pro') {
      await checkoutPro(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4 gap-2">
            <Shield className="h-4 w-4" />
            7 zile trial gratuit — anulează oricând
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Alege Planul Tău de{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Freedom
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Deblochează potențialul tău de freelancer. Începe cu 7 zile gratuit.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                      Recomandat
                    </Badge>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.priceNote && (
                      <span className="text-muted-foreground text-sm">{plan.priceNote}</span>
                    )}
                  </div>
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

                {/* Current plan indicator */}
                {currentPlan === plan.id && (
                  <div className="mb-3 text-center">
                    <Badge variant="outline" className="border-primary text-primary">
                      Planul tău actual
                    </Badge>
                  </div>
                )}

                {/* CTA */}
                <Button 
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isLoading || currentPlan === plan.id || (currentPlan === 'pro' && plan.id === 'starter')}
                  className={`w-full gap-2 ${
                    plan.popular
                      ? '' 
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'secondary'}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {currentPlan === plan.id ? 'Plan Activ' : plan.cta}
                  {currentPlan !== plan.id && <ArrowRight className="h-4 w-4" />}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            Ai întrebări? <a href="/settings" className="text-primary hover:underline">Contactează-ne</a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
