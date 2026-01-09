import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Package, Loader2, Check, RefreshCw, Star, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Json } from '@/integrations/supabase/types';

interface PackageData {
  name: string;
  price: number;
  delivery_time: string;
  deliverables: string[];
}

interface OfferResult {
  smv: string;
  target_market: string;
  pricing_justification: string;
  starter_package: PackageData;
  standard_package: PackageData;
  premium_package: PackageData;
}

interface Props {
  onOfferGenerated: (hasOffer: boolean) => void;
}

export default function OnboardingStep8Offer({ onOfferGenerated }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<'idle' | 'generating' | 'results'>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OfferResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingOffer, setHasExistingOffer] = useState(false);

  useEffect(() => {
    checkExistingOffer();
  }, [user]);

  const checkExistingOffer = async () => {
    if (!user) return;
    
    const { data: offer, error } = await supabase
      .from('offers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && offer) {
      setHasExistingOffer(true);
      onOfferGenerated(true);
    }
  };

  const loadData = async () => {
    if (!user) return { skills: [], ikigai: null, profile: null };
    
    const [skillsRes, ikigaiRes, profileRes] = await Promise.all([
      supabase.from('skill_entries').select('*').eq('user_id', user.id),
      supabase.from('ikigai_results').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('profiles').select('study_field, locale').eq('id', user.id).single(),
    ]);

    return {
      skills: skillsRes.data || [],
      ikigai: ikigaiRes.data,
      profile: profileRes.data,
    };
  };

  const handleGenerate = async () => {
    if (!user) return;
    
    setStep('generating');
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 10, 90));
    }, 700);

    try {
      const { skills, ikigai, profile } = await loadData();
      
      if (skills.length === 0) {
        throw new Error('Nu ai competențe salvate.');
      }
      
      if (!ikigai) {
        throw new Error('Nu ai Ikigai generat.');
      }

      const response = await supabase.functions.invoke('offer-builder', {
        body: {
          skills: skills.map(s => ({
            name: s.skill,
            category: s.category,
            confidence: s.confidence,
          })),
          ikigaiResult: {
            service_angles: ikigai.service_angles,
            core_positioning: ikigai.ikigai_statements?.[0]?.statement || '',
          },
          studyField: profile?.study_field || '',
          locale: profile?.locale || 'ro',
        },
      });

      clearInterval(progressInterval);

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResult(response.data as OfferResult);
      setProgress(100);
      setTimeout(() => setStep('results'), 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('Offer error:', error);
      toast.error(error.message || 'A apărut o eroare');
      setStep('idle');
    }
  };

  const handleSave = async () => {
    if (!user || !result) return;
    
    setIsSaving(true);
    try {
      // Check if offer exists
      const { data: existingOffer } = await supabase
        .from('offers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;
      if (existingOffer) {
        const res = await supabase
          .from('offers')
          .update({
            smv: result.smv,
            target_market: result.target_market,
            pricing_justification: result.pricing_justification,
            starter_package: result.starter_package as unknown as Json,
            standard_package: result.standard_package as unknown as Json,
            premium_package: result.premium_package as unknown as Json,
          })
          .eq('user_id', user.id);
        error = res.error;
      } else {
        const res = await supabase
          .from('offers')
          .insert([{
            user_id: user.id,
            smv: result.smv,
            target_market: result.target_market,
            pricing_justification: result.pricing_justification,
            starter_package: result.starter_package as unknown as Json,
            standard_package: result.standard_package as unknown as Json,
            premium_package: result.premium_package as unknown as Json,
          }]);
        error = res.error;
      }

      if (error) throw error;

      // Update freedom score
      await supabase
        .from('profiles')
        .update({ freedom_score: 60 })
        .eq('id', user.id);

      toast.success('Oferta salvată!');
      setHasExistingOffer(true);
      onOfferGenerated(true);
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Eroare la salvare');
    } finally {
      setIsSaving(false);
    }
  };

  const packageConfig = [
    { key: 'starter_package', label: 'Starter', icon: Zap, color: 'border-blue-500/30 bg-blue-500/5' },
    { key: 'standard_package', label: 'Standard', icon: Star, color: 'border-primary/30 bg-primary/5' },
    { key: 'premium_package', label: 'Premium', icon: Crown, color: 'border-yellow-500/30 bg-yellow-500/5' },
  ];

  if (hasExistingOffer && step === 'idle') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Ofertă creată!</h3>
          <p className="text-muted-foreground">
            Ai deja o ofertă cu pachete de servicii. Poți continua sau regenera.
          </p>
        </div>
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => {
              setHasExistingOffer(false);
              handleGenerate();
            }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerează oferta
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <motion.div 
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Package className="w-8 h-8 text-primary" />
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Construim oferta ta...</h3>
          <p className="text-muted-foreground">
            Creăm pachete de servicii personalizate
          </p>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-center text-sm text-muted-foreground">
          {progress < 30 && 'Se analizează competențele...'}
          {progress >= 30 && progress < 60 && 'Se calculează prețurile...'}
          {progress >= 60 && progress < 90 && 'Se construiesc pachetele...'}
          {progress >= 90 && 'Finalizare...'}
        </p>
      </div>
    );
  }

  if (step === 'results' && result) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Oferta ta de servicii</h3>
          <p className="text-sm text-muted-foreground mt-1">{result.smv}</p>
        </div>

        {/* Packages */}
        <div className="space-y-3">
          {packageConfig.map(({ key, label, icon: Icon, color }) => {
            const pkg = result[key as keyof OfferResult] as PackageData;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${color}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-foreground">{pkg.name}</span>
                  </div>
                  <span className="text-lg font-bold text-primary">£{pkg.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Livrare: {pkg.delivery_time}
                </p>
                <ul className="space-y-1">
                  {pkg.deliverables.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {pkg.deliverables.length > 3 && (
                    <li className="text-xs text-primary">+{pkg.deliverables.length - 3} mai multe</li>
                  )}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Se salvează...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Salvează și finalizează
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Idle state
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Package className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Offer Builder</h3>
        <p className="text-muted-foreground">
          Creăm pachete de servicii cu prețuri optimizate pentru piața din UK.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {packageConfig.map(({ label, icon: Icon }) => (
          <div key={label} className="p-3 rounded-lg bg-background/30 border border-white/5 text-center">
            <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={handleGenerate} size="lg" className="gap-2">
          <Package className="w-5 h-5" />
          Generează oferta
        </Button>
      </div>
    </div>
  );
}
