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
  Check,
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
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
  },
  {
    key: 'ikigaiBuilder',
    icon: Target,
    url: '/wizard/ikigai',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    key: 'offerBuilder',
    icon: Package,
    url: '/wizard/offer',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    key: 'profileBuilder',
    icon: User,
    url: '/wizard/profile',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    key: 'outreachGenerator',
    icon: MessageSquare,
    url: '/wizard/outreach',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
  },
  {
    key: 'freedomPlanExport',
    icon: FileDown,
    url: '/wizard/export',
    color: 'from-primary to-accent',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
];

export default function DefineYourPath() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            {t.sidebar.defineYourPath}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold"
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
        </div>

        {/* Steps Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pathSteps.map((step, index) => {
            const Icon = step.icon;
            const title = t.sidebar[step.key as keyof typeof t.sidebar] || step.key;
            
            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                    step.bgColor,
                    step.borderColor
                  )}
                  onClick={() => navigate(step.url)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                        step.color
                      )}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Pasul {index + 1}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-4 group-hover:text-primary transition-colors">
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="ghost"
                      className="w-full justify-between group-hover:bg-background/50"
                    >
                      <span>Începe</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>💡 Completează toți pașii pentru a debloca planul tău complet de libertate</p>
        </motion.div>
      </div>
    </MainLayout>
  );
}
