import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EDUPhaseBadge } from './EDUPhaseBadge';
import { EDU_STEPS, type StudentApplication } from '@/hooks/useStudentApplication';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle,
  Clock, 
  ArrowRight, 
  FileCheck, 
  GraduationCap,
  BookOpen,
  FileText,
  Briefcase,
  PoundSterling,
  Gift,
  Users,
  Shield,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface EDUJourneyTrackerProps {
  application: StudentApplication | null;
  onCreateApplication: () => void;
}

const stepIcons: Record<string, React.ReactNode> = {
  eligibility_check: <Shield className="h-4 w-4" />,
  course_matching: <GraduationCap className="h-4 w-4" />,
  edu_plan: <ClipboardCheck className="h-4 w-4" />,
  test_prep: <BookOpen className="h-4 w-4" />,
  documents: <FileText className="h-4 w-4" />,
  cv_builder: <FileCheck className="h-4 w-4" />,
  university_response: <Clock className="h-4 w-4" />,
  offer_accept: <CheckCircle2 className="h-4 w-4" />,
  student_finance: <PoundSterling className="h-4 w-4" />,
  bonuses: <Gift className="h-4 w-4" />,
  enrollment: <GraduationCap className="h-4 w-4" />,
  freedom_circle: <Users className="h-4 w-4" />,
};

const stepRoutes: Record<string, string> = {
  eligibility_check: '/edu/eligibility',
  course_matching: '/edu/course-match',
  edu_plan: '/edu/my-plan',
  test_prep: '/edu/test-prep',
  documents: '/edu/documents',
  cv_builder: '/edu/cv-builder',
  student_finance: '/edu/finance',
  bonuses: '/edu/bonuses',
  freedom_circle: '/edu/community',
};

function getStepStatus(application: StudentApplication | null, stepKey: string): 'completed' | 'in_progress' | 'pending' {
  if (!application) return 'pending';
  
  const statusMap: Record<string, string | null | undefined> = {
    eligibility_check: application.eligibility_status,
    course_matching: application.course_match_status,
    test_prep: application.test_prep_status,
    documents: application.documents_status,
    cv_builder: application.cv_status,
    student_finance: application.finance_status,
    university_response: application.university_response,
    offer_accept: application.offer_status,
    enrollment: application.enrollment_confirmed ? 'completed' : 'not_started',
  };

  const status = statusMap[stepKey];
  if (status === 'completed') return 'completed';
  if (status === 'in_progress') return 'in_progress';
  return 'pending';
}

export function EDUJourneyTracker({ application, onCreateApplication }: EDUJourneyTrackerProps) {
  const navigate = useNavigate();
  const phases = ['evaluate', 'deliver', 'unlock'] as const;

  if (!application) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center gap-4 mb-6">
            {phases.map((phase) => (
              <EDUPhaseBadge key={phase} phase={phase} isActive={false} isCompleted={false} size="lg" />
            ))}
          </div>
          <h3 className="text-2xl font-bold mb-2">Welcome to the E.D.U Method</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Start your journey to a UK university. We'll guide you through every step — from eligibility check to enrollment.
          </p>
          <Button onClick={onCreateApplication} size="lg" className="gradient-accent text-accent-foreground font-semibold">
            Start Your E.D.U Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentPhase = application.current_phase;

  return (
    <div className="space-y-6">
      {/* Phase Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            {phases.map((phase, i) => (
              <div key={phase} className="flex items-center flex-1">
                <EDUPhaseBadge
                  phase={phase}
                  isActive={phase === currentPhase}
                  isCompleted={
                    phases.indexOf(currentPhase) > i
                  }
                />
                {i < 2 && (
                  <div className={cn(
                    'flex-1 h-1 mx-3 rounded-full transition-colors',
                    phases.indexOf(currentPhase) > i ? 'bg-primary' : 'bg-muted'
                  )} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Cards by Phase */}
      {phases.map((phase) => (
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: phases.indexOf(phase) * 0.1 }}
        >
          <Card className={cn(
            'transition-all',
            phase === currentPhase && 'border-primary/30 shadow-lg'
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <EDUPhaseBadge phase={phase} isActive={phase === currentPhase} isCompleted={phases.indexOf(currentPhase) > phases.indexOf(phase)} size="sm" />
                <CardTitle className="text-lg capitalize">
                  {phase === 'evaluate' ? 'E — Evaluate' : phase === 'deliver' ? 'D — Deliver' : 'U — Unlock'}
                </CardTitle>
                {phases.indexOf(currentPhase) > phases.indexOf(phase) && (
                  <Badge variant="secondary" className="ml-auto bg-green-500/10 text-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {EDU_STEPS[phase].map((step) => {
                  const status = getStepStatus(application, step.key);
                  const route = stepRoutes[step.key];
                  
                  return (
                    <button
                      key={step.key}
                      onClick={() => route && navigate(route)}
                      disabled={!route}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                        status === 'completed' && 'border-green-500/30 bg-green-500/5',
                        status === 'in_progress' && 'border-primary/30 bg-primary/5',
                        status === 'pending' && 'border-border hover:border-primary/30 hover:bg-primary/5',
                        !route && 'cursor-default'
                      )}
                    >
                      <div className={cn(
                        'p-1.5 rounded-md',
                        status === 'completed' && 'bg-green-500/20 text-green-500',
                        status === 'in_progress' && 'bg-primary/20 text-primary',
                        status === 'pending' && 'bg-muted text-muted-foreground',
                      )}>
                        {status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : stepIcons[step.key] || <Circle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium',
                          status === 'completed' && 'text-green-500',
                          status === 'in_progress' && 'text-foreground',
                          status === 'pending' && 'text-muted-foreground',
                        )}>
                          {step.label}
                        </p>
                      </div>
                      {route && status !== 'completed' && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
