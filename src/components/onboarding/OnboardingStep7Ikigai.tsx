import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { Target, Loader2, Check, RefreshCw, Heart, Briefcase, Globe, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface IkigaiResult {
  what_you_love: string[];
  what_youre_good_at: string[];
  what_world_needs: string[];
  what_you_can_be_paid_for: string[];
  ikigai_statements: Array<{
    statement: string;
    explanation: string;
  }>;
  service_angles: Array<{
    title: string;
    description: string;
    target_audience: string;
    pricing_potential: string;
  }>;
}

interface Props {
  data: {
    study_field: string;
    goals: string[];
    values: string[];
  };
  onIkigaiGenerated: (hasIkigai: boolean) => void;
}

export default function OnboardingStep7Ikigai({ data, onIkigaiGenerated }: Props) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [step, setStep] = useState<'idle' | 'generating' | 'results'>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<IkigaiResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingIkigai, setHasExistingIkigai] = useState(false);

  useEffect(() => {
    checkExistingIkigai();
  }, [user]);

  const checkExistingIkigai = async () => {
    if (!user) return;
    
    const { data: ikigai, error } = await supabase
      .from('ikigai_results')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && ikigai) {
      setHasExistingIkigai(true);
      onIkigaiGenerated(true);
    }
  };

  const loadSkills = async () => {
    if (!user) return [];
    
    const { data: skills } = await supabase
      .from('skill_entries')
      .select('skill, category, confidence')
      .eq('user_id', user.id);

    return skills || [];
  };

  const handleGenerate = async () => {
    if (!user) return;
    
    setStep('generating');
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 12, 90));
    }, 600);

    try {
      const skills = await loadSkills();
      
      if (skills.length === 0) {
        throw new Error(t.onboardingStep7.noSkillsError);
      }

      const response = await supabase.functions.invoke('ikigai-builder', {
        body: {
          skills: skills.map(s => ({
            name: s.skill,
            category: s.category,
            confidence: s.confidence,
          })),
          studyField: data.study_field,
          goals: data.goals,
          values: data.values,
        },
      });

      clearInterval(progressInterval);

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResult(response.data as IkigaiResult);
      setProgress(100);
      setTimeout(() => setStep('results'), 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('Ikigai error:', error);
      toast.error(error.message || t.onboardingStep7.generateError);
      setStep('idle');
    }
  };

  const handleSave = async () => {
    if (!user || !result) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ikigai_results')
        .upsert({
          user_id: user.id,
          what_you_love: result.what_you_love,
          what_youre_good_at: result.what_youre_good_at,
          what_world_needs: result.what_world_needs,
          what_you_can_be_paid_for: result.what_you_can_be_paid_for,
          ikigai_statements: result.ikigai_statements,
          service_angles: result.service_angles,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Update freedom score
      await supabase
        .from('profiles')
        .update({ freedom_score: 40 })
        .eq('id', user.id);

      toast.success(t.onboardingStep7.ikigaiSaved);
      setHasExistingIkigai(true);
      onIkigaiGenerated(true);
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || t.onboardingStep7.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const quadrantConfig = [
    { key: 'what_you_love', label: t.onboardingStep7.whatYouLove, icon: Heart, color: 'text-pink-400 bg-pink-500/10' },
    { key: 'what_youre_good_at', label: t.onboardingStep7.whatYoureGoodAt, icon: Target, color: 'text-blue-400 bg-blue-500/10' },
    { key: 'what_world_needs', label: t.onboardingStep7.whatWorldNeeds, icon: Globe, color: 'text-green-400 bg-green-500/10' },
    { key: 'what_you_can_be_paid_for', label: t.onboardingStep7.whatYouCanBePaidFor, icon: DollarSign, color: 'text-yellow-400 bg-yellow-500/10' },
  ];

  if (hasExistingIkigai && step === 'idle') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{t.onboardingStep7.ikigaiGeneratedTitle}</h3>
          <p className="text-muted-foreground">
            {t.onboardingStep7.ikigaiGeneratedDescription}
          </p>
        </div>
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => {
              setHasExistingIkigai(false);
              handleGenerate();
            }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t.onboardingStep7.regenerateIkigai}
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
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Target className="w-8 h-8 text-primary" />
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{t.onboardingStep7.buildingTitle}</h3>
          <p className="text-muted-foreground">
            {t.onboardingStep7.buildingDescription}
          </p>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-center text-sm text-muted-foreground">
          {progress < 30 && t.onboardingStep7.analyzingSkills}
          {progress >= 30 && progress < 60 && t.onboardingStep7.identifyingIntersections}
          {progress >= 60 && progress < 90 && t.onboardingStep7.generatingDirections}
          {progress >= 90 && t.onboardingStep7.finalizing}
        </p>
      </div>
    );
  }

  if (step === 'results' && result) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{t.onboardingStep7.yourIkigai}</h3>
        </div>

        {/* Quadrants Preview */}
        <div className="grid grid-cols-2 gap-3">
          {quadrantConfig.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="p-3 rounded-lg bg-background/50 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className={`p-1.5 rounded ${color}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <ul className="space-y-1">
                {(result[key as keyof IkigaiResult] as string[]).slice(0, 2).map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground truncate">
                    • {item}
                  </li>
                ))}
                {(result[key as keyof IkigaiResult] as string[]).length > 2 && (
                  <li className="text-xs text-primary">
                    {t.onboardingStep7.moreItems.replace('{count}', String((result[key as keyof IkigaiResult] as string[]).length - 2))}
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Main Statement */}
        {result.ikigai_statements.length > 0 && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <p className="text-sm text-foreground italic text-center">
              "{result.ikigai_statements[0].statement}"
            </p>
          </div>
        )}

        {/* Service Angles Preview */}
        {result.service_angles.length > 0 && (
          <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {t.onboardingStep7.serviceDirections}
            </h4>
            <div className="space-y-1">
              {result.service_angles.slice(0, 2).map((angle, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  • {angle.title}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.onboardingStep7.savingIkigai}
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {t.onboardingStep7.saveAndContinue}
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
          <Target className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{t.onboardingStep7.builderTitle}</h3>
        <p className="text-muted-foreground">
          {t.onboardingStep7.builderDescription}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quadrantConfig.map(({ label, icon: Icon, color }) => (
          <div key={label} className="p-3 rounded-lg bg-background/30 border border-white/5 text-center">
            <span className={`inline-flex p-2 rounded-lg ${color} mb-2`}>
              <Icon className="w-5 h-5" />
            </span>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={handleGenerate} size="lg" className="gap-2">
          <Target className="w-5 h-5" />
          {t.onboardingStep7.generateButton}
        </Button>
      </div>
    </div>
  );
}
