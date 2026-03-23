import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Check, Lock, Rocket } from 'lucide-react';
import { useSubscription, SubscriptionPlan } from '@/hooks/useSubscription';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredPlan: SubscriptionPlan;
  featureName: string;
  featureDescription?: string;
}

const planInfo: Record<SubscriptionPlan, { name: string; earlyPrice: string; fullPrice: string; features: string[] }> = {
  starter: { 
    name: 'Starter', 
    earlyPrice: '£49/lună',
    fullPrice: '£98/lună',
    features: [
      '3 platforme',
      '15 gig-uri',
      '50 generări AI/lună',
      'Profile Builder',
      'Income Tracker',
      'Export PDF'
    ]
  },
  pro: { 
    name: 'Pro', 
    earlyPrice: '£97/lună',
    fullPrice: '£194/lună',
    features: [
      'Platforme nelimitate',
      'Gig-uri nelimitate',
      'Generări AI nelimitate',
      'Dream 100 Tracker',
      'CV Generator',
      'Outreach Sequences',
      'Certificări cursuri',
      'Suport prioritar',
    ]
  },
  eduforyou: { 
    name: 'EduForYou', 
    earlyPrice: 'Gratuit',
    fullPrice: '',
    features: [
      'Acces complet Pro',
      'Fără plată',
      'Activat de admin'
    ]
  }
};

export function UpgradeModal({ 
  open, 
  onOpenChange, 
  requiredPlan, 
  featureName,
  featureDescription 
}: UpgradeModalProps) {
  const navigate = useNavigate();
  const { plan: currentPlan } = useSubscription();
  const info = planInfo[requiredPlan] || planInfo.pro;

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <Lock className="h-6 w-6 text-amber-500" />
            </div>
            <DialogTitle className="text-xl">Funcție Premium</DialogTitle>
          </div>
          <DialogDescription>
            {featureDescription || `${featureName} necesită un plan ${info.name} sau superior.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/5 to-orange-500/10 border border-amber-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="font-semibold">{info.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {info.fullPrice && (
                  <span className="text-sm text-muted-foreground line-through">{info.fullPrice}</span>
                )}
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  {info.earlyPrice}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-3">
              <Rocket className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-600">Early Bird Rate — blocat pentru totdeauna</span>
            </div>
            
            <ul className="space-y-2">
              {info.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            <span>Planul tău actual: </span>
            <Badge variant="outline">{planInfo[currentPlan]?.name || 'Starter'}</Badge>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Mai târziu
          </Button>
          <Button 
            onClick={handleUpgrade} 
            className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade acum
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
