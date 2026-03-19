import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Target,
  Package,
  User,
  MessageSquare,
  FileDown,
  ArrowRight,
  CheckCircle2,
  Download,
  Dna,
  Briefcase,
  Laptop,
  Rocket,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { DnaQuizContainer } from '@/components/dna-quiz/DnaQuizContainer';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { DnaProfile, QuizLang } from '@/components/dna-quiz/quizData';

const pathSteps = [
  {
    key: 'skillScanner',
    icon: Sparkles,
    url: '/wizard/skill-scanner',
    table: 'skill_entries',
  },
  {
    key: 'ikigaiBuilder',
    icon: Target,
    url: '/wizard/ikigai',
    table: 'ikigai_results',
  },
  {
    key: 'offerBuilder',
    icon: Package,
    url: '/wizard/offer',
    table: 'offers',
  },
  {
    key: 'profileBuilder',
    icon: User,
    url: '/wizard/profile',
    table: 'social_profiles',
  },
  {
    key: 'outreachGenerator',
    icon: MessageSquare,
    url: '/wizard/outreach',
    table: 'outreach_templates',
  },
  {
    key: 'freedomPlanExport',
    icon: FileDown,
    url: '/wizard/export',
    table: null,
  },
];

export default function DefineYourPath() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();

  // Query to check completion status and count for each step
  const { data: completionData } = useQuery({
    queryKey: ['path-completion-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return { status: {}, counts: {} };

      const [skills, ikigai, offers, profiles, outreach] = await Promise.all([
        supabase.from('skill_entries').select('id').eq('user_id', user.id),
        supabase.from('ikigai_results').select('id').eq('user_id', user.id),
        supabase.from('offers').select('id').eq('user_id', user.id),
        supabase.from('social_profiles').select('id').eq('user_id', user.id),
        supabase.from('outreach_templates').select('id').eq('user_id', user.id),
      ]);

      const status: Record<string, boolean> = {
        skillScanner: (skills.data?.length || 0) > 0,
        ikigaiBuilder: (ikigai.data?.length || 0) > 0,
        offerBuilder: (offers.data?.length || 0) > 0,
        profileBuilder: (profiles.data?.length || 0) > 0,
        outreachGenerator: (outreach.data?.length || 0) > 0,
      };

      const counts: Record<string, number> = {
        skillScanner: skills.data?.length || 0,
        ikigaiBuilder: ikigai.data?.length || 0,
        offerBuilder: offers.data?.length || 0,
        profileBuilder: profiles.data?.length || 0,
        outreachGenerator: outreach.data?.length || 0,
      };

      // Freedom Plan Export is complete when all others are complete
      status.freedomPlanExport = Object.values(status).every(Boolean);

      return { status, counts };
    },
    enabled: !!user?.id,
  });

  const completionStatus = completionData?.status || {};
  const itemCounts = completionData?.counts || {};
  const allCompleted = Object.values(completionStatus).length > 0 && 
    Object.values(completionStatus).every(Boolean);

  // Get translations with fallback
  const getStepTitle = (key: string) => {
    const translations = t.defineYourPath?.steps?.[key as keyof typeof t.defineYourPath.steps];
    if (translations && typeof translations === 'object' && 'title' in translations) {
      return translations.title;
    }
    return t.sidebar[key as keyof typeof t.sidebar] || key;
  };

  const getStepDescription = (key: string) => {
    const translations = t.defineYourPath?.steps?.[key as keyof typeof t.defineYourPath.steps];
    if (translations && typeof translations === 'object' && 'description' in translations) {
      return translations.description;
    }
    return '';
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Completion Banner */}
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 border-primary/30 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-primary font-medium">🎉 {t.common.completed}!</p>
                    <p className="font-semibold text-foreground">
                      {t.defineYourPath?.completedTitle || 'Felicitări! Ai completat toate modulele și poți exporta planul tău.'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.defineYourPath?.completedDescription || 'Documentul include toate informațiile din cele 5 module: competențe, Ikigai, oferte de servicii, profiluri sociale și template-uri de outreach.'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/wizard/export')}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shrink-0"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t.defineYourPath?.downloadPdf || 'Descarcă PDF'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t.defineYourPath?.pathTitle || 'Freedom Path'}
          </h1>
        </div>

        {/* Steps List */}
        <div className="flex flex-col gap-3">
          {pathSteps.map((step, index) => {
            const Icon = step.icon;
            const title = getStepTitle(step.key);
            const description = getStepDescription(step.key);
            const isCompleted = completionStatus?.[step.key] || false;
            const count = itemCounts?.[step.key] || 0;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:border-primary/50",
                    "bg-card border-border/50",
                    isCompleted && "border-l-4 border-l-primary"
                  )}
                  onClick={() => navigate(step.url)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={cn(
                        "p-3 rounded-xl",
                        isCompleted 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{title}</span>
                          {isCompleted && count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {count} {count === 1 ? 'element' : 'elemente'}
                            </Badge>
                          )}
                          {isCompleted && count === 0 && (
                            <Badge className="bg-primary/20 text-primary border-0 text-xs">
                              {t.common.completed}
                            </Badge>
                          )}
                        </div>
                        {description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                    >
                      {isCompleted ? t.common.review : (t.defineYourPath?.startButton || 'Începe')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
