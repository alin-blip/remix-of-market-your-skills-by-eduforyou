import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { Sparkles, Brain, Users, Zap, Code, Loader2, Check, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { CVUpload } from '@/components/shared/CVUpload';

interface Skill {
  name: string;
  category: 'technical' | 'soft' | 'hidden';
  confidence: number;
  description: string;
  monetization_potential: 'low' | 'medium' | 'high';
}

interface ScanResult {
  skills: Skill[];
  summary: string;
  top_recommendation: string;
}

interface Props {
  data: {
    study_field: string;
    interests: string[];
    projects_experience: string;
  };
  onSkillsGenerated: (hasSkills: boolean) => void;
}

export default function OnboardingStep6Skills({ data, onSkillsGenerated }: Props) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [step, setStep] = useState<'idle' | 'scanning' | 'results'>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedSkills, setHasSavedSkills] = useState(false);

  useEffect(() => {
    checkExistingSkills();
  }, [user]);

  const checkExistingSkills = async () => {
    if (!user) return;
    
    const { data: skills, error } = await supabase
      .from('skill_entries')
      .select('*')
      .eq('user_id', user.id);

    if (!error && skills && skills.length > 0) {
      setHasSavedSkills(true);
      onSkillsGenerated(true);
    }
  };

  const handleScan = async () => {
    if (!user) return;
    
    setStep('scanning');
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    try {
      const response = await supabase.functions.invoke('skill-scanner', {
        body: {
          experiences: data.projects_experience,
          studyField: data.study_field,
          interests: data.interests,
        },
      });

      clearInterval(progressInterval);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const scanResult = response.data as ScanResult;
      setResult(scanResult);
      
      // Pre-select all skills with high monetization potential
      const highPotentialSkills = scanResult.skills
        .filter(s => s.monetization_potential === 'high' || s.monetization_potential === 'medium')
        .map(s => s.name);
      setSelectedSkills(new Set(highPotentialSkills));
      
      setProgress(100);
      setTimeout(() => setStep('results'), 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('Scan error:', error);
      toast.error(error.message || t.onboardingStep6.scanError);
      setStep('idle');
    }
  };

  const handleSaveSkills = async () => {
    if (!user || !result) return;
    
    setIsSaving(true);
    try {
      const skillsToSave = result.skills.filter(s => selectedSkills.has(s.name));
      
      // Delete existing skills first
      await supabase.from('skill_entries').delete().eq('user_id', user.id);
      
      // Insert new skills
      const { error } = await supabase.from('skill_entries').insert(
        skillsToSave.map(skill => ({
          user_id: user.id,
          skill: skill.name,
          category: skill.category,
          confidence: skill.confidence,
          description: skill.description,
        }))
      );

      if (error) throw error;

      // Update profile freedom score
      await supabase
        .from('profiles')
        .update({ freedom_score: 20 })
        .eq('id', user.id);

      toast.success(t.onboardingStep6.skillsSaved.replace('{count}', String(skillsToSave.length)));
      setHasSavedSkills(true);
      onSkillsGenerated(true);
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || t.onboardingStep6.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSkill = (skillName: string) => {
    setSelectedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillName)) {
        newSet.delete(skillName);
      } else {
        newSet.add(skillName);
      }
      return newSet;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Code className="w-4 h-4" />;
      case 'soft': return <Users className="w-4 h-4" />;
      case 'hidden': return <Zap className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'text-blue-400 bg-blue-500/10';
      case 'soft': return 'text-green-400 bg-green-500/10';
      case 'hidden': return 'text-purple-400 bg-purple-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  if (hasSavedSkills && step === 'idle') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{t.onboardingStep6.skillsSavedTitle}</h3>
          <p className="text-muted-foreground">
            {t.onboardingStep6.skillsSavedDescription}
          </p>
        </div>
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => {
              setHasSavedSkills(false);
              handleScan();
            }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t.onboardingStep6.regenerateSkills}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'scanning') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <motion.div 
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{t.onboardingStep6.analyzingTitle}</h3>
          <p className="text-muted-foreground">
            {t.onboardingStep6.analyzingDescription}
          </p>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-center text-sm text-muted-foreground">
          {progress < 30 && t.onboardingStep6.processing}
          {progress >= 30 && progress < 60 && t.onboardingStep6.identifyingPatterns}
          {progress >= 60 && progress < 90 && t.onboardingStep6.evaluatingPotential}
          {progress >= 90 && t.onboardingStep6.finalizing}
        </p>
      </div>
    );
  }

  if (step === 'results' && result) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t.onboardingStep6.identifiedSkills.replace('{count}', String(result.skills.length))}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t.onboardingStep6.selectSkillsToSave}
          </p>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {result.skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedSkills.has(skill.name)
                  ? 'border-primary bg-primary/5'
                  : 'border-white/10 bg-background/50 hover:border-white/20'
              }`}
              onClick={() => toggleSkill(skill.name)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedSkills.has(skill.name)}
                  onCheckedChange={() => toggleSkill(skill.name)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`p-1 rounded ${getCategoryColor(skill.category)}`}>
                      {getCategoryIcon(skill.category)}
                    </span>
                    <span className="font-medium text-foreground">{skill.name}</span>
                    {skill.monetization_potential === 'high' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                        💰 {t.onboardingStep6.highPotential}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {skill.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span className="text-sm text-muted-foreground">
            {t.onboardingStep6.selectedOf
              .replace('{selected}', String(selectedSkills.size))
              .replace('{total}', String(result.skills.length))}
          </span>
          <Button
            onClick={handleSaveSkills}
            disabled={selectedSkills.size === 0 || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.onboardingStep6.savingSkills}
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {t.onboardingStep6.saveAndContinue}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Idle state - show scan button
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{t.onboardingStep6.scannerTitle}</h3>
        <p className="text-muted-foreground">
          {t.onboardingStep6.scannerDescription}
        </p>
      </div>

      <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
        <h4 className="font-medium text-foreground mb-2">{t.onboardingStep6.whatWeAnalyze}</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            {t.onboardingStep6.yourCourse} <span className="text-foreground">{data.study_field}</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            {t.onboardingStep6.interestsSelected.replace('{count}', String(data.interests.length))}
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            {t.onboardingStep6.experiencesAndProjects}
          </li>
        </ul>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleScan} size="lg" className="gap-2">
          <Sparkles className="w-5 h-5" />
          {t.onboardingStep6.scanButton}
        </Button>
      </div>
    </div>
  );
}
