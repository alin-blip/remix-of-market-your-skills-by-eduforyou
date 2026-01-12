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
  Circle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

const pathSteps = [
  {
    key: 'skillScanner',
    icon: Sparkles,
    url: '/wizard/skill-scanner',
    color: 'from-violet-500 to-purple-600',
    glowColor: 'violet',
    shadowColor: 'shadow-violet-500/25',
    table: 'skill_entries',
  },
  {
    key: 'ikigaiBuilder',
    icon: Target,
    url: '/wizard/ikigai',
    color: 'from-amber-500 to-orange-600',
    glowColor: 'amber',
    shadowColor: 'shadow-amber-500/25',
    table: 'ikigai_results',
  },
  {
    key: 'offerBuilder',
    icon: Package,
    url: '/wizard/offer',
    color: 'from-emerald-500 to-teal-600',
    glowColor: 'emerald',
    shadowColor: 'shadow-emerald-500/25',
    table: 'offers',
  },
  {
    key: 'profileBuilder',
    icon: User,
    url: '/wizard/profile',
    color: 'from-blue-500 to-cyan-600',
    glowColor: 'blue',
    shadowColor: 'shadow-blue-500/25',
    table: 'social_profiles',
  },
  {
    key: 'outreachGenerator',
    icon: MessageSquare,
    url: '/wizard/outreach',
    color: 'from-pink-500 to-rose-600',
    glowColor: 'pink',
    shadowColor: 'shadow-pink-500/25',
    table: 'outreach_templates',
  },
  {
    key: 'freedomPlanExport',
    icon: FileDown,
    url: '/wizard/export',
    color: 'from-primary to-accent',
    glowColor: 'primary',
    shadowColor: 'shadow-primary/25',
    table: null, // Export doesn't have a table, it's complete when all others are
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.9,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const iconVariants = {
  rest: { rotate: 0, scale: 1 },
  hover: { 
    rotate: [0, -10, 10, -5, 5, 0],
    scale: 1.1,
    transition: {
      rotate: {
        duration: 0.5,
        ease: "easeInOut" as const,
      },
      scale: {
        duration: 0.2,
      },
    },
  },
};

const arrowVariants = {
  rest: { x: 0 },
  hover: { 
    x: 5,
    transition: {
      repeat: Infinity,
      repeatType: "reverse" as const,
      duration: 0.4,
    },
  },
};

const shimmerVariants = {
  rest: { x: "-100%", opacity: 0 },
  hover: { 
    x: "100%", 
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeInOut" as const,
    },
  },
};

export default function DefineYourPath() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();

  // Query to check completion status for each step
  const { data: completionStatus } = useQuery({
    queryKey: ['path-completion-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};

      const [skills, ikigai, offers, profiles, outreach] = await Promise.all([
        supabase.from('skill_entries').select('id').eq('user_id', user.id).limit(1),
        supabase.from('ikigai_results').select('id').eq('user_id', user.id).limit(1),
        supabase.from('offers').select('id').eq('user_id', user.id).limit(1),
        supabase.from('social_profiles').select('id').eq('user_id', user.id).limit(1),
        supabase.from('outreach_templates').select('id').eq('user_id', user.id).limit(1),
      ]);

      const status: Record<string, boolean> = {
        skillScanner: (skills.data?.length || 0) > 0,
        ikigaiBuilder: (ikigai.data?.length || 0) > 0,
        offerBuilder: (offers.data?.length || 0) > 0,
        profileBuilder: (profiles.data?.length || 0) > 0,
        outreachGenerator: (outreach.data?.length || 0) > 0,
      };

      // Freedom Plan Export is complete when all others are complete
      status.freedomPlanExport = Object.values(status).every(Boolean);

      return status;
    },
    enabled: !!user?.id,
  });

  const completedCount = Object.values(completionStatus || {}).filter(Boolean).length;
  const totalSteps = pathSteps.length;
  const progressPercent = (completedCount / totalSteps) * 100;
  const allCompleted = completedCount === totalSteps;

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
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
            {t.defineYourPath?.title || t.sidebar.defineYourPath}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
            className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text"
          >
            {t.defineYourPath?.title || t.sidebar.defineYourPath}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {t.defineYourPath?.subtitle || 'Parcurge pașii pentru a-ți construi calea către libertatea financiară'}
          </motion.p>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto pt-4 space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t.defineYourPath?.progressLabel || 'Progres'}
              </span>
              <span className="font-medium text-primary">
                {allCompleted ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {t.defineYourPath?.allCompleted || 'Ai completat toate etapele! 🎉'}
                  </span>
                ) : (
                  `${completedCount} ${t.defineYourPath?.stepsCompleted || 'pași completați din'} ${totalSteps}`
                )}
              </span>
            </div>
            <div className="relative">
              <Progress value={progressPercent} className="h-3" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-primary via-accent to-primary opacity-50 blur-sm"
              />
            </div>
          </motion.div>

          {/* Step indicators */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center justify-center gap-2 pt-2"
          >
            {pathSteps.map((step, index) => {
              const isCompleted = completionStatus?.[step.key] || false;
              return (
                <motion.div
                  key={step.key}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="relative"
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-3 w-3 rounded-full bg-primary flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-2 w-2 text-primary-foreground" />
                    </motion.div>
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground/40" />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Steps List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4 max-w-2xl mx-auto"
        >
          {pathSteps.map((step, index) => {
            const Icon = step.icon;
            const title = getStepTitle(step.key);
            const description = getStepDescription(step.key);
            const isCompleted = completionStatus?.[step.key] || false;
            
            return (
              <motion.div
                key={step.key}
                variants={cardVariants}
                whileHover="hover"
                initial="rest"
                animate="rest"
                className="relative group"
              >
                {/* Glow effect behind card */}
                <motion.div
                  className={cn(
                    "absolute -inset-0.5 rounded-xl bg-gradient-to-r opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-75",
                    step.color
                  )}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.5 }}
                />
                
                <Card
                  className={cn(
                    "relative cursor-pointer transition-all duration-500 overflow-hidden",
                    "bg-card/80 backdrop-blur-sm border-border/50",
                    "hover:border-primary/50 hover:shadow-2xl",
                    step.shadowColor,
                    isCompleted && "ring-2 ring-primary/30"
                  )}
                  onClick={() => navigate(step.url)}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    variants={shimmerVariants}
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
                  />

                  {/* Gradient border top */}
                  <motion.div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                      step.color,
                      isCompleted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                    initial={{ scaleX: isCompleted ? 1 : 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <motion.div 
                        variants={iconVariants}
                        className={cn(
                          "p-3 rounded-xl bg-gradient-to-br shadow-lg relative overflow-hidden",
                          step.color
                        )}
                      >
                        {/* Icon inner glow */}
                        <motion.div
                          className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <Icon className="h-6 w-6 text-white relative z-10" />
                      </motion.div>
                      
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {t.common.completed}
                          </motion.div>
                        )}
                        <motion.div
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs font-semibold transition-all duration-300",
                              "group-hover:bg-primary/10 group-hover:border-primary/50 group-hover:text-primary",
                              isCompleted && "bg-primary/10 border-primary/50 text-primary"
                            )}
                          >
                            {t.defineYourPath?.step || 'Pasul'} {index + 1}
                          </Badge>
                        </motion.div>
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg mt-4 group-hover:text-primary transition-colors duration-300">
                      {title}
                    </CardTitle>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {description}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between transition-all duration-300",
                          "group-hover:bg-primary/10 group-hover:text-primary",
                          isCompleted && "bg-primary/5"
                        )}
                      >
                        <span className="font-medium">
                          {isCompleted ? t.common.review : (t.defineYourPath?.startButton || 'Începe')}
                        </span>
                        <motion.div variants={arrowVariants}>
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </CardContent>

                  {/* Corner decoration */}
                  <motion.div
                    className={cn(
                      "absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-500",
                      step.color
                    )}
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <motion.div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/10"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.span
              animate={{ 
                rotate: [0, 10, -10, 0],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-2xl"
            >
              💡
            </motion.span>
            <p className="text-sm text-muted-foreground">
              {t.defineYourPath?.tipText || 'Completează toți pașii pentru a debloca'}{" "}
              <span className="font-semibold text-primary">
                {t.defineYourPath?.tipText ? '' : 'planul tău complet de libertate'}
              </span>
            </p>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle2 className="h-5 w-5 text-primary/50" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
