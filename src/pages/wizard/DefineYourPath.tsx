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
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const pathSteps = [
  {
    key: 'skillScanner',
    icon: Sparkles,
    url: '/wizard/skill-scanner',
    color: 'from-violet-500 to-purple-600',
    glowColor: 'violet',
    shadowColor: 'shadow-violet-500/25',
  },
  {
    key: 'ikigaiBuilder',
    icon: Target,
    url: '/wizard/ikigai',
    color: 'from-amber-500 to-orange-600',
    glowColor: 'amber',
    shadowColor: 'shadow-amber-500/25',
  },
  {
    key: 'offerBuilder',
    icon: Package,
    url: '/wizard/offer',
    color: 'from-emerald-500 to-teal-600',
    glowColor: 'emerald',
    shadowColor: 'shadow-emerald-500/25',
  },
  {
    key: 'profileBuilder',
    icon: User,
    url: '/wizard/profile',
    color: 'from-blue-500 to-cyan-600',
    glowColor: 'blue',
    shadowColor: 'shadow-blue-500/25',
  },
  {
    key: 'outreachGenerator',
    icon: MessageSquare,
    url: '/wizard/outreach',
    color: 'from-pink-500 to-rose-600',
    glowColor: 'pink',
    shadowColor: 'shadow-pink-500/25',
  },
  {
    key: 'freedomPlanExport',
    icon: FileDown,
    url: '/wizard/export',
    color: 'from-primary to-accent',
    glowColor: 'primary',
    shadowColor: 'shadow-primary/25',
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
            {t.sidebar.defineYourPath}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
            className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text"
          >
            {t.sidebar.defineYourPath}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Parcurge pașii pentru a-ți construi calea către libertatea financiară
          </motion.p>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-2 pt-4"
          >
            {pathSteps.map((step, index) => (
              <motion.div
                key={step.key}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === 0 ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                )}
              />
            ))}
          </motion.div>
        </div>

        {/* Steps Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {pathSteps.map((step, index) => {
            const Icon = step.icon;
            const title = t.sidebar[step.key as keyof typeof t.sidebar] || step.key;
            
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
                    step.shadowColor
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
                      "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      step.color
                    )}
                    initial={{ scaleX: 0 }}
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
                      
                      <motion.div
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs font-semibold transition-all duration-300",
                            "group-hover:bg-primary/10 group-hover:border-primary/50 group-hover:text-primary"
                          )}
                        >
                          Pasul {index + 1}
                        </Badge>
                      </motion.div>
                    </div>
                    
                    <CardTitle className="text-lg mt-4 group-hover:text-primary transition-colors duration-300">
                      {title}
                    </CardTitle>
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
                          "group-hover:bg-primary/10 group-hover:text-primary"
                        )}
                      >
                        <span className="font-medium">Începe</span>
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
              Completează toți pașii pentru a debloca{" "}
              <span className="font-semibold text-primary">planul tău complet de libertate</span>
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
