import { useAuth } from '@/lib/auth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Target, 
  Package, 
  MessageSquare, 
  FileText,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp
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
}

export default function Dashboard() {
  const { profile } = useAuth();

  // Calculate freedom score based on completed steps
  const freedomScore = profile?.freedom_score ?? 0;

  // Define the Freedom Path steps
  const pathSteps: PathStep[] = [
    {
      id: 'skills',
      title: 'Skill Scanner',
      description: 'Descoperă-ți competențele monetizabile',
      icon: <Sparkles className="w-6 h-6" />,
      route: '/wizard/skill-scanner',
      completed: freedomScore >= 20,
      current: freedomScore < 20,
    },
    {
      id: 'ikigai',
      title: 'Ikigai Builder',
      description: 'Găsește-ți poziționarea unică',
      icon: <Target className="w-6 h-6" />,
      route: '/wizard/ikigai',
      completed: freedomScore >= 40,
      current: freedomScore >= 20 && freedomScore < 40,
    },
    {
      id: 'offer',
      title: 'Offer Builder',
      description: 'Creează-ți pachetele de servicii',
      icon: <Package className="w-6 h-6" />,
      route: '/offer-builder',
      completed: freedomScore >= 60,
      current: freedomScore >= 40 && freedomScore < 60,
    },
    {
      id: 'outreach',
      title: 'Outreach Generator',
      description: 'Generează mesaje de prospectare',
      icon: <MessageSquare className="w-6 h-6" />,
      route: '/outreach',
      completed: freedomScore >= 80,
      current: freedomScore >= 60 && freedomScore < 80,
    },
    {
      id: 'export',
      title: 'Freedom Plan',
      description: 'Exportă-ți planul complet',
      icon: <FileText className="w-6 h-6" />,
      route: '/export',
      completed: freedomScore >= 100,
      current: freedomScore >= 80 && freedomScore < 100,
    },
  ];

  const currentStep = pathSteps.find(step => step.current) || pathSteps[0];
  const completedSteps = pathSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / pathSteps.length) * 100;

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
            Bună, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Continuă-ți călătoria către libertatea financiară.
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
              <span className="text-muted-foreground">Freedom Score</span>
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
              <span className="text-muted-foreground">Pași completați</span>
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
              <span className="text-muted-foreground">Domeniu</span>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              {profile?.study_field || 'Nesetat'}
            </span>
          </Card>
        </motion.div>

        {/* Next Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass border-primary/20 p-6 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  {currentStep.icon}
                </div>
                <div>
                  <p className="text-sm text-primary font-medium mb-1">Următorul pas</p>
                  <h3 className="text-xl font-bold text-foreground">{currentStep.title}</h3>
                  <p className="text-muted-foreground">{currentStep.description}</p>
                </div>
              </div>
              <Button asChild className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link to={currentStep.route}>
                  Începe acum
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Freedom Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">Freedom Path</h2>
          <div className="space-y-4">
            {pathSteps.map((step, index) => (
              <Card
                key={step.id}
                className={`glass border-white/10 p-4 transition-all ${
                  step.current 
                    ? 'border-primary/50 bg-primary/5' 
                    : step.completed 
                    ? 'opacity-75' 
                    : 'opacity-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Step number/status */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step.completed 
                      ? 'bg-accent text-accent-foreground' 
                      : step.current 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.completed ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>

                  {/* Step info */}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${step.current || step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>

                  {/* Action */}
                  {(step.current || step.completed) && (
                    <Button
                      variant={step.current ? 'default' : 'outline'}
                      size="sm"
                      asChild
                      className={step.current ? 'bg-gradient-to-r from-primary to-accent' : ''}
                    >
                      <Link to={step.route}>
                        {step.completed ? 'Revizuiește' : 'Start'}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  )}

                  {!step.current && !step.completed && (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
