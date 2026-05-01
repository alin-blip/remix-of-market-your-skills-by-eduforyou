import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeedbackDialog } from '@/components/feedback/FeedbackDialog';
import { useFeedback } from '@/hooks/useFeedback';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useAdminRole } from '@/hooks/useAdminRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { IkigaiCircles } from '@/components/ikigai/IkigaiCircles';
import { useI18n } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Target, 
  ArrowRight, 
  Loader2, 
  Heart, 
  Zap, 
  Globe,
  Coins,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Quote,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Lock
} from 'lucide-react';

interface ServiceAngle {
  title: string;
  description: string;
  target_audience: string;
  unique_value: string;
}

interface IkigaiStatement {
  statement: string;
  explanation: string;
}

interface IkigaiResult {
  what_you_love: string[];
  what_youre_good_at: string[];
  what_world_needs: string[];
  what_you_can_be_paid_for: string[];
  ikigai_statements: IkigaiStatement[];
  service_angles: ServiceAngle[];
  core_positioning: string;
}

interface Skill {
  id: string;
  skill: string;
  category: string;
  confidence: number;
}

export default function IkigaiBuilder() {
  const { user, profile } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const navigate = useNavigate();
  const { t } = useI18n();
  
  const [step, setStep] = useState<'loading' | 'no-skills' | 'ready' | 'generating' | 'results'>('loading');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [result, setResult] = useState<IkigaiResult | null>(null);
  const [selectedStatement, setSelectedStatement] = useState<number>(0);
  const [hasSavedResult, setHasSavedResult] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showFeedback, setShowFeedback, triggerFeedback } = useFeedback('ikigai-builder');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const [skillsResponse, ikigaiResponse] = await Promise.all([
      supabase.from('skill_entries').select('*').eq('user_id', user.id),
      supabase.from('ikigai_results').select('*').eq('user_id', user.id).maybeSingle()
    ]);

    if (skillsResponse.error) {
      console.error('Error loading skills:', skillsResponse.error);
    }

    const loadedSkills = skillsResponse.data || [];
    setSkills(loadedSkills);

    if (ikigaiResponse.data) {
      const savedResult: IkigaiResult = {
        what_you_love: (ikigaiResponse.data.what_you_love as unknown as string[]) || [],
        what_youre_good_at: (ikigaiResponse.data.what_youre_good_at as unknown as string[]) || [],
        what_world_needs: (ikigaiResponse.data.what_world_needs as unknown as string[]) || [],
        what_you_can_be_paid_for: (ikigaiResponse.data.what_you_can_be_paid_for as unknown as string[]) || [],
        ikigai_statements: (ikigaiResponse.data.ikigai_statements as unknown as IkigaiStatement[]) || [],
        service_angles: (ikigaiResponse.data.service_angles as unknown as ServiceAngle[]) || [],
        core_positioning: (ikigaiResponse.data.ikigai_statements as unknown as any)?.[0]?.statement || '',
      };
      setResult(savedResult);
      setHasSavedResult(true);
      setStep('results');
    } else if (loadedSkills.length > 0) {
      setStep('ready');
    } else {
      setStep('no-skills');
    }
  };

  const requestGenerate = () => {
    if (skills.length === 0) {
      toast.error(t.ikigaiBuilder.needSkillsFirst);
      navigate('/wizard/skill-scanner');
      return;
    }
    if (!isAdmin) {
      toast.error('Acces restricționat — doar administratorii pot rula Partnership Fit Matrix.');
      return;
    }
    setConfirmOpen(true);
  };

  const handleGenerate = async () => {
    setConfirmOpen(false);
    if (skills.length === 0) {
      toast.error(t.ikigaiBuilder.needSkillsFirst);
      navigate('/wizard/skill-scanner');
      return;
    }

    setStep('generating');
    setGenerateProgress(0);

    const progressInterval = setInterval(() => {
      setGenerateProgress(prev => Math.min(prev + Math.random() * 12, 90));
    }, 600);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ikigai-builder`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            skills,
            studyField: profile?.study_field || '',
            goals: (profile as any)?.goals || [],
            values: (profile as any)?.values || [],
          }),
        }
      );

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t.ikigaiBuilder.generateError);
      }

      const data: IkigaiResult = await response.json();
      setGenerateProgress(100);
      
      setTimeout(() => {
        setResult(data);
        setHasSavedResult(false);
        setStep('results');
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Generate error:', error);
      toast.error(error instanceof Error ? error.message : t.ikigaiBuilder.generateError);
      setStep('ready');
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;

    try {
      const { data: existing } = await supabase
        .from('ikigai_results')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('ikigai_results')
          .update({
            what_you_love: result.what_you_love as unknown as null,
            what_youre_good_at: result.what_youre_good_at as unknown as null,
            what_world_needs: result.what_world_needs as unknown as null,
            what_you_can_be_paid_for: result.what_you_can_be_paid_for as unknown as null,
            ikigai_statements: result.ikigai_statements as unknown as null,
            service_angles: result.service_angles as unknown as null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ikigai_results')
          .insert([{
            user_id: user.id,
            what_you_love: result.what_you_love as unknown as null,
            what_youre_good_at: result.what_youre_good_at as unknown as null,
            what_world_needs: result.what_world_needs as unknown as null,
            what_you_can_be_paid_for: result.what_you_can_be_paid_for as unknown as null,
            ikigai_statements: result.ikigai_statements as unknown as null,
            service_angles: result.service_angles as unknown as null,
          }]);

        if (error) throw error;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ freedom_score: 40 })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success(t.ikigaiBuilder.ikigaiSaved);
      setHasSavedResult(true);
      triggerFeedback();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t.ikigaiBuilder.saveError);
    }
  };

  const quadrantConfig = [
    { key: 'what_you_love', label: t.ikigaiBuilder.quadrants.whatYouLove, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/20' },
    { key: 'what_youre_good_at', label: t.ikigaiBuilder.quadrants.whatYoureGoodAt, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { key: 'what_world_needs', label: t.ikigaiBuilder.quadrants.whatWorldNeeds, icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { key: 'what_you_can_be_paid_for', label: t.ikigaiBuilder.quadrants.whatYouCanBePaidFor, icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  ];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-muted-foreground mt-4">{t.common.loading}</p>
            </motion.div>
          )}

          {/* No Skills State */}
          {step === 'no-skills' && (
            <motion.div
              key="no-skills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/20 mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {t.ikigaiBuilder.noSkillsTitle}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t.ikigaiBuilder.noSkillsDescription}
              </p>
              <Button 
                onClick={() => navigate('/wizard/skill-scanner')}
                className="gap-2 bg-gradient-to-r from-primary to-accent"
              >
                <Sparkles className="w-5 h-5" />
                {t.ikigaiBuilder.goToSkillScanner}
              </Button>
            </motion.div>
          )}

          {/* Ready State */}
          {step === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {t.ikigaiBuilder.title}
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  {t.ikigaiBuilder.subtitle}
                </p>
              </div>

              {/* Skills Preview */}
              <Card className="glass border-white/10 p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  {t.ikigaiBuilder.yourSkills} ({skills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge 
                      key={skill.id} 
                      variant="outline"
                      className={`${
                        skill.category === 'technical' ? 'border-blue-500/50 text-blue-400' :
                        skill.category === 'soft' ? 'border-purple-500/50 text-purple-400' :
                        'border-amber-500/50 text-amber-400'
                      }`}
                    >
                      {skill.skill}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Ikigai Explanation */}
              <Card className="glass border-primary/20 p-6 bg-gradient-to-r from-primary/5 to-accent/5">
                <h3 className="font-semibold text-foreground mb-3">{t.ikigaiBuilder.whatIsIkigai}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t.ikigaiBuilder.ikigaiDescription}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {quadrantConfig.map(q => (
                    <div key={q.key} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${q.bg} flex items-center justify-center`}>
                        <q.icon className={`w-4 h-4 ${q.color}`} />
                      </div>
                      <span className="text-sm text-foreground">{q.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex justify-center">
                <div className="flex flex-col items-center gap-3">
                  {!adminLoading && (
                    <Badge
                      variant="outline"
                      className={
                        isAdmin
                          ? 'gap-1.5 border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                          : 'gap-1.5 border-amber-500/40 text-amber-400 bg-amber-500/10'
                      }
                    >
                      {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {isAdmin ? 'Admin Mode' : 'Restricted — admin only'}
                    </Badge>
                  )}
                  <Button
                    onClick={requestGenerate}
                    disabled={adminLoading || !isAdmin}
                    className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-60"
                    size="lg"
                  >
                    <Target className="w-5 h-5" />
                    {t.ikigaiBuilder.generateButton}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Generating State */}
          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6 animate-pulse">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {t.ikigaiBuilder.generating}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {t.ikigaiBuilder.generatingDescription}
              </p>
              <div className="max-w-md mx-auto">
                <Progress value={generateProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{Math.round(generateProgress)}%</p>
              </div>
            </motion.div>
          )}

          {/* Results State */}
          {step === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {hasSavedResult ? t.ikigaiBuilder.resultsSavedTitle : t.ikigaiBuilder.resultsTitle}
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  {result.core_positioning || result.ikigai_statements?.[0]?.statement || ''}
                </p>
              </div>

              {/* Interactive Ikigai Visualization */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <IkigaiCircles
                  whatYouLove={result.what_you_love}
                  whatYoureGoodAt={result.what_youre_good_at}
                  whatWorldNeeds={result.what_world_needs}
                  whatYouCanBePaidFor={result.what_you_can_be_paid_for}
                />
              </motion.div>

              {/* Ikigai Quadrants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quadrantConfig.map((q, index) => (
                  <motion.div
                    key={q.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass border-white/10 p-5 h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl ${q.bg} flex items-center justify-center`}>
                          <q.icon className={`w-5 h-5 ${q.color}`} />
                        </div>
                        <h3 className="font-semibold text-foreground">{q.label}</h3>
                      </div>
                      <ul className="space-y-2">
                        {(result[q.key as keyof IkigaiResult] as string[])?.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${q.bg.replace('/20', '')}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Ikigai Statements */}
              {result.ikigai_statements && result.ikigai_statements.length > 0 && (
                <Card className="glass border-primary/20 p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Quote className="w-5 h-5 text-primary" />
                    {t.ikigaiBuilder.positioningStatements}
                  </h3>
                  <div className="space-y-3">
                    {result.ikigai_statements.map((stmt, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedStatement === index
                            ? 'bg-primary/10 border border-primary/30'
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedStatement(index)}
                      >
                        <p className="font-medium text-foreground">{stmt.statement}</p>
                        {selectedStatement === index && stmt.explanation && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-sm text-muted-foreground mt-2"
                          >
                            {stmt.explanation}
                          </motion.p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Service Angles */}
              {result.service_angles && result.service_angles.length > 0 && (
                <Card className="glass border-accent/20 p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-accent" />
                    {t.ikigaiBuilder.serviceAngles}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {result.service_angles.map((angle, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="p-4 rounded-lg bg-accent/5 border border-accent/20"
                      >
                        <h4 className="font-semibold text-foreground mb-2">{angle.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{angle.description}</p>
                        <div className="space-y-1 text-xs">
                          <p className="text-muted-foreground">
                            <span className="text-accent">Target:</span> {angle.target_audience}
                          </p>
                          <p className="text-muted-foreground">
                            <span className="text-accent">USP:</span> {angle.unique_value}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setStep('ready');
                      setHasSavedResult(false);
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t.ikigaiBuilder.regenerate}
                  </Button>
                  {!hasSavedResult && (
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      className="gap-2"
                    >
                      {t.ikigaiBuilder.saveButton}
                    </Button>
                  )}
                </div>
                <Button
                  onClick={() => navigate('/wizard/offer')}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                >
                  {t.ikigaiBuilder.continueToOffer}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <FeedbackDialog open={showFeedback} onOpenChange={setShowFeedback} stepKey="ikigai-builder" />
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Confirmă rularea Partnership Fit Matrix
              </DialogTitle>
              <DialogDescription>
                Această acțiune va genera ICP, IPP și unghiuri de parteneriat folosind AI și va fi înregistrată în audit log.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-sm">
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/40">
                <span className="text-muted-foreground">Cont</span>
                <span className="font-medium text-foreground truncate ml-2">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/40">
                <span className="text-muted-foreground">Rol detectat</span>
                <Badge className="gap-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/40">
                <span className="text-muted-foreground">Active trimise spre AI</span>
                <span className="font-medium text-foreground">{skills.length} skill-uri</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-xs">
                  Datele de profil al companiei și skill-urile vor fi trimise modelului AI și salvate în <code>ai_outputs</code> + <code>admin_audit_log</code>.
                </span>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Anulează
              </Button>
              <Button
                onClick={handleGenerate}
                className="gap-2 bg-gradient-to-r from-primary to-accent"
              >
                <Target className="w-4 h-4" />
                Confirm & Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
