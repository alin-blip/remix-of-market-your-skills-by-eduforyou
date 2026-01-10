import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  Target, 
  Package, 
  MessageSquare, 
  FileText,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Lock,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PathStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  completed: boolean;
  current: boolean;
  locked: boolean;
  dataCount?: number;
}

interface ProgressData {
  skillsCount: number;
  hasIkigai: boolean;
  hasOffer: boolean;
  outreachCount: number;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const [progressData, setProgressData] = useState<ProgressData>({
    skillsCount: 0,
    hasIkigai: false,
    hasOffer: false,
    outreachCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;

    try {
      const [skillsRes, ikigaiRes, offerRes, outreachRes] = await Promise.all([
        supabase.from('skill_entries').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('ikigai_results').select('id').eq('user_id', user.id).maybeSingle(),
        supabase.from('offers').select('id').eq('user_id', user.id).maybeSingle(),
        supabase.from('outreach_templates').select('id', { count: 'exact' }).eq('user_id', user.id),
      ]);

      setProgressData({
        skillsCount: skillsRes.count || 0,
        hasIkigai: !!ikigaiRes.data,
        hasOffer: !!offerRes.data,
        outreachCount: outreachRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if all 4 main modules are completed
  const allModulesCompleted = 
    progressData.skillsCount > 0 && 
    progressData.hasIkigai && 
    progressData.hasOffer && 
    progressData.outreachCount > 0;

  // Define the Freedom Path steps with correct routes
  const pathSteps: PathStep[] = [
    {
      id: 'skills',
      title: t.pathSteps.skills.title,
      description: t.pathSteps.skills.description,
      icon: <Sparkles className="w-6 h-6" />,
      route: '/wizard/skill-scanner',
      completed: progressData.skillsCount > 0,
      current: progressData.skillsCount === 0,
      locked: false,
      dataCount: progressData.skillsCount,
    },
    {
      id: 'ikigai',
      title: t.pathSteps.ikigai.title,
      description: t.pathSteps.ikigai.description,
      icon: <Target className="w-6 h-6" />,
      route: '/wizard/ikigai',
      completed: progressData.hasIkigai,
      current: progressData.skillsCount > 0 && !progressData.hasIkigai,
      locked: progressData.skillsCount === 0,
    },
    {
      id: 'offer',
      title: t.pathSteps.offer.title,
      description: t.pathSteps.offer.description,
      icon: <Package className="w-6 h-6" />,
      route: '/wizard/offer',
      completed: progressData.hasOffer,
      current: progressData.hasIkigai && !progressData.hasOffer,
      locked: !progressData.hasIkigai,
    },
    {
      id: 'outreach',
      title: t.pathSteps.outreach.title,
      description: t.pathSteps.outreach.description,
      icon: <MessageSquare className="w-6 h-6" />,
      route: '/wizard/outreach',
      completed: progressData.outreachCount > 0,
      current: progressData.hasOffer && progressData.outreachCount === 0,
      locked: !progressData.hasOffer,
      dataCount: progressData.outreachCount,
    },
    {
      id: 'export',
      title: t.pathSteps.export.title,
      description: t.pathSteps.export.description,
      icon: <FileText className="w-6 h-6" />,
      route: '/wizard/export',
      completed: allModulesCompleted,
      current: progressData.outreachCount > 0 && !allModulesCompleted,
      locked: progressData.outreachCount === 0,
    },
  ];

  const currentStep = pathSteps.find(step => step.current);
  const completedSteps = pathSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / pathSteps.length) * 100;
  
  // Calculate freedom score dynamically based on completed steps
  const freedomScore = Math.round((completedSteps / pathSteps.length) * 100);
  const allStepsCompleted = completedSteps === pathSteps.length;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t.dashboard.greeting}, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.dashboard.subtitle}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Freedom Score */}
          <Card className="glass border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">{t.dashboard.freedomScore}</span>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-foreground">{freedomScore}</span>
              <span className="text-muted-foreground mb-1">/100</span>
            </div>
            <Progress value={freedomScore} className="mt-3 h-2" />
          </Card>

          {/* Progress Card */}
          <Card className="glass border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">{t.dashboard.stepsCompleted}</span>
              <CheckCircle2 className="w-5 h-5 text-accent" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-foreground">{completedSteps}</span>
              <span className="text-muted-foreground mb-1">/{pathSteps.length}</span>
            </div>
            <Progress value={progressPercentage} className="mt-3 h-2" />
          </Card>

          {/* Domain Card */}
          <Card className="glass border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">{t.dashboard.domain}</span>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              {profile?.study_field || t.dashboard.notSet}
            </span>
          </Card>
        </motion.div>

        {/* Next Action Card - show congratulations when all complete */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {allStepsCompleted ? (
            <Card className="glass border-accent/30 p-6 bg-gradient-to-r from-accent/10 to-primary/10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm text-accent font-medium mb-1">🎉 {t.common.completed}</p>
                    <h3 className="text-xl font-bold text-foreground">{t.export.allCompletedDescription}</h3>
                    <p className="text-muted-foreground">{t.export.planReadyDescription}</p>
                  </div>
                </div>
                <Button asChild className="gap-2 bg-gradient-to-r from-accent to-primary hover:opacity-90">
                  <Link to="/wizard/export">
                    {t.export.downloadPdf}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ) : currentStep ? (
            <Card className="glass border-primary/20 p-6 bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                    {currentStep.icon}
                  </div>
                  <div>
                    <p className="text-sm text-primary font-medium mb-1">{t.dashboard.nextStep}</p>
                    <h3 className="text-xl font-bold text-foreground">{currentStep.title}</h3>
                    <p className="text-muted-foreground">{currentStep.description}</p>
                  </div>
                </div>
                <Button asChild className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Link to={currentStep.route}>
                    {t.dashboard.startNow}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ) : null}
        </motion.div>

        {/* Freedom Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">{t.dashboard.freedomPath}</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {pathSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`glass border-white/10 p-4 transition-all hover-lift ${
                      step.current 
                        ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/10' 
                        : step.completed 
                        ? 'border-accent/30' 
                        : step.locked
                        ? 'opacity-40'
                        : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Step number/status */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold transition-all ${
                        step.completed 
                          ? 'bg-accent text-accent-foreground' 
                          : step.current 
                          ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground' 
                          : step.locked
                          ? 'bg-muted/50 text-muted-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.completed ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : step.locked ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          step.icon
                        )}
                      </div>

                      {/* Step info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className={`font-semibold ${step.current || step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.title}
                          </h3>
                          {step.completed && step.dataCount !== undefined && step.dataCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {step.dataCount} {step.dataCount === 1 ? t.common.item : t.common.items}
                            </Badge>
                          )}
                          {step.completed && !step.dataCount && (
                            <Badge className="bg-accent/20 text-accent text-xs">{t.common.completed}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{step.description}</p>
                      </div>

                      {/* Action */}
                      {step.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="shrink-0 gap-1"
                        >
                          <Link to={step.route}>
                            {t.common.review}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}

                      {step.current && (
                        <Button
                          size="sm"
                          asChild
                          className="shrink-0 gap-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        >
                          <Link to={step.route}>
                            {t.common.start}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}

                      {step.locked && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Lock className="w-3 h-3" />
                          {t.common.locked}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}
