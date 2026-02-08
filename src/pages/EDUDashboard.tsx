import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/auth';
import { useStudentApplication } from '@/hooks/useStudentApplication';
import { EDUJourneyTracker } from '@/components/edu/EDUJourneyTracker';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  GraduationCap,
  Clock,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function EDUDashboard() {
  const { profile } = useAuth();
  const { application, isLoading, createApplication, getProgress } = useStudentApplication();
  const progress = getProgress();

  const daysSinceStart = application?.started_at 
    ? differenceInDays(new Date(), new Date(application.started_at)) 
    : 0;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Welcome, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                Your E.D.U Method journey — from evaluation to university enrollment.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="text-sm py-1.5 px-3">
                <GraduationCap className="h-4 w-4 mr-1.5" />
                Eduforyou
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        {application && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card className="glass border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{daysSinceStart}</p>
                  <p className="text-xs text-muted-foreground">Days Active</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <GraduationCap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold capitalize">{application.current_phase}</p>
                  <p className="text-xs text-muted-foreground">Current Phase</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress.completedSteps}/{progress.totalSteps}</p>
                  <p className="text-xs text-muted-foreground">Steps Done</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <User className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {application.university_choice || '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">University</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* E.D.U Journey Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <EDUJourneyTracker
            application={application}
            onCreateApplication={() => createApplication.mutate()}
          />
        </motion.div>
      </div>
    </MainLayout>
  );
}
