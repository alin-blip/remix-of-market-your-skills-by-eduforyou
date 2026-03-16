import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  Target, 
  CheckCircle2,
  TrendingUp,
  Zap,
  Calendar,
  ArrowRight,
  Compass,
  Briefcase,
  BookOpen,
} from 'lucide-react';
import { VisionBoard } from '@/components/life-os/VisionBoard';
import { AreaIcon } from '@/components/life-os/AreaIcon';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { 
  useWeeklySprint, 
  useDailyTasks,
  useUpdateDailyTask,
} from '@/hooks/useLifeOS';
import { DAYS_OF_WEEK, DAY_LABELS } from '@/types/lifeOS';
import { cn } from '@/lib/utils';

interface ProgressData {
  skillsCount: number;
  hasIkigai: boolean;
  hasOffer: boolean;
  outreachCount: number;
  hasLifeOS: boolean;
  hasGigs: boolean;
}

// Next Steps configuration
interface NextStep {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  priority: number;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const dateLocale = locale === 'ro' ? ro : enUS;
  
  const [progressData, setProgressData] = useState<ProgressData>({
    skillsCount: 0,
    hasIkigai: false,
    hasOffer: false,
    outreachCount: 0,
    hasLifeOS: false,
    hasGigs: false,
  });
  const [loading, setLoading] = useState(true);
  const confettiTriggered = useRef(false);

  // Life OS data for tasks
  const { data: sprint } = useWeeklySprint();
  const { data: allTasks } = useDailyTasks(sprint?.id);
  const updateTask = useUpdateDailyTask();
  
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const [selectedDate, setSelectedDate] = useState(today);
  
  // Get tasks for selected date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const tasksForDay = allTasks?.filter(t => t.day_date === selectedDateStr) || [];
  const bigTask = tasksForDay.find(t => t.task_type === 'big');
  const smallTasks = tasksForDay.filter(t => t.task_type === 'small');
  
  // Calculate progress
  const completedToday = tasksForDay.filter(t => t.is_completed).length;
  const totalToday = tasksForDay.length;
  const progressToday = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  // Week days for navigation
  const weekDays = DAYS_OF_WEEK.map((day, index) => {
    const date = addDays(weekStart, index);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTasks = allTasks?.filter(t => t.day_date === dateStr) || [];
    const completed = dayTasks.filter(t => t.is_completed).length;
    const total = dayTasks.length;
    
    return {
      day,
      date,
      dateStr,
      isToday: isToday(date),
      isSelected: isSameDay(date, selectedDate),
      completed,
      total,
      status: total === 0 ? 'empty' : completed === total ? 'done' : 'partial',
    };
  });

  const handleToggleTask = (taskId: string, isCompleted: boolean) => {
    updateTask.mutate({
      id: taskId,
      updates: { 
        is_completed: !isCompleted,
        completed_at: !isCompleted ? new Date().toISOString() : undefined,
      },
    });
  };

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;

    try {
      const [skillsRes, ikigaiRes, offerRes, outreachRes, lifeAreasRes, gigsRes] = await Promise.all([
        supabase.from('skill_entries').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('ikigai_results').select('id').eq('user_id', user.id).maybeSingle(),
        supabase.from('offers').select('id').eq('user_id', user.id).maybeSingle(),
        supabase.from('outreach_templates').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('life_areas').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('gigs_jobs').select('id', { count: 'exact' }).eq('user_id', user.id),
      ]);

      setProgressData({
        skillsCount: skillsRes.count || 0,
        hasIkigai: !!ikigaiRes.data,
        hasOffer: !!offerRes.data,
        outreachCount: outreachRes.count || 0,
        hasLifeOS: (lifeAreasRes.count || 0) > 0,
        hasGigs: (gigsRes.count || 0) > 0,
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

  // Calculate freedom score
  const completedSteps = [
    progressData.skillsCount > 0,
    progressData.hasIkigai,
    progressData.hasOffer,
    progressData.outreachCount > 0,
    allModulesCompleted,
  ].filter(Boolean).length;
  const totalSteps = 5;
  const freedomScore = Math.round((completedSteps / totalSteps) * 100);

  // Get dynamic next steps based on progress
  const getNextSteps = (): NextStep[] => {
    const steps: NextStep[] = [];
    
    // Priority 1: Complete Freedom Path if not done
    if (!allModulesCompleted) {
      steps.push({
        id: 'freedom-path',
        title: locale === 'ro' ? 'Continuă Freedom Path' : 'Continue Freedom Path',
        description: locale === 'ro' 
          ? 'Descoperă-ți competențele și creează-ți oferta' 
          : 'Discover your skills and create your offer',
        path: '/wizard/path',
        icon: <Compass className="h-5 w-5" />,
        priority: 1,
      });
    }
    
    // Priority 2: Set up Life OS if wizard complete but no Life OS
    if (allModulesCompleted && !progressData.hasLifeOS) {
      steps.push({
        id: 'life-os',
        title: locale === 'ro' ? 'Configurează Life OS' : 'Set up Life OS',
        description: locale === 'ro' 
          ? 'Organizează-ți obiectivele și task-urile' 
          : 'Organize your goals and tasks',
        path: '/life-os/setup',
        icon: <Target className="h-5 w-5" />,
        priority: 2,
      });
    }
    
    // Priority 3: Create first gig if offer exists but no gigs
    if (progressData.hasOffer && !progressData.hasGigs) {
      steps.push({
        id: 'first-gig',
        title: locale === 'ro' ? 'Publică primul gig' : 'Publish your first gig',
        description: locale === 'ro' 
          ? 'Transformă oferta ta în gig-uri pe platforme' 
          : 'Transform your offer into platform gigs',
        path: '/wizard/gig-job-builder',
        icon: <Briefcase className="h-5 w-5" />,
        priority: 3,
      });
    }
    
    // Priority 4: Learn more
    if (allModulesCompleted) {
      steps.push({
        id: 'learn',
        title: locale === 'ro' ? 'Explorează cursurile' : 'Explore courses',
        description: locale === 'ro' 
          ? 'Continuă să înveți cu Learning Hub' 
          : 'Continue learning with Learning Hub',
        path: '/learning-hub',
        icon: <BookOpen className="h-5 w-5" />,
        priority: 4,
      });
    }
    
    return steps.sort((a, b) => a.priority - b.priority).slice(0, 3);
  };

  const nextSteps = getNextSteps();

  // Trigger confetti when all steps are completed
  useEffect(() => {
    if (allModulesCompleted && !loading && !confettiTriggered.current) {
      confettiTriggered.current = true;
      
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: colors
        });
      }, 200);
    }
  }, [allModulesCompleted, loading]);

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
            {t.dashboard.greeting}, <span className="text-gradient">{profile?.full_name?.split(' ')[0] || 'Student'}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.dashboard.subtitle}
          </p>
        </motion.div>

        {/* Next Steps Section - Dynamic CTA */}
        {nextSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <Card className="card-gold-accent">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">
                    {locale === 'ro' ? 'Următorii pași' : 'Next Steps'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {nextSteps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => navigate(step.path)}
                      className={cn(
                        'flex items-start gap-3 p-4 rounded-xl border text-left transition-all hover:border-primary/50 hover:bg-primary/5',
                        index === 0 ? 'border-primary/30 bg-primary/10' : 'border-border'
                      )}
                    >
                      <div className={cn(
                        'p-2 rounded-lg',
                        index === 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      )}>
                        {step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{step.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{step.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Vision Board Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <VisionBoard compact />
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Freedom Score */}
          <Card className="card-gold p-6">
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

          {/* Freedom Path Progress - Simplified */}
          <Card className="card-gold p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">{t.dashboard.freedomPath}</span>
              {allModulesCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-accent" />
              ) : (
                <Target className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-foreground">{completedSteps}</span>
              <span className="text-muted-foreground mb-1">/{totalSteps}</span>
            </div>
            {allModulesCompleted ? (
              <Badge className="mt-3 bg-accent/20 text-accent">{t.common.completed} ✓</Badge>
            ) : (
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link to="/wizard/path">{t.dashboard.startNow || 'Continue'}</Link>
              </Button>
            )}
          </Card>

          {/* Domain Card */}
          <Card className="card-gold p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">{t.dashboard.domain}</span>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              {profile?.study_field || t.dashboard.notSet}
            </span>
          </Card>
        </motion.div>

        {/* Today's Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">
              {t.lifeOS?.dashboard || "Today's Tasks"}
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/life-os')}>
              <Calendar className="h-4 w-4 mr-2" />
              {t.lifeOS?.title || 'Life OS'}
            </Button>
          </div>

          {/* Week Navigation - Compact */}
          <Card className="mb-4">
            <CardContent className="py-3">
              <div className="flex gap-2 overflow-x-auto">
                {weekDays.map(({ day, date, isToday: dayIsToday, isSelected, status }) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      'flex-1 min-w-[60px] p-2 rounded-lg border text-center transition-all',
                      isSelected && 'border-primary bg-primary/10',
                      dayIsToday && !isSelected && 'border-primary/50',
                      !isSelected && !dayIsToday && 'border-border hover:border-primary/30',
                    )}
                  >
                    <p className="text-xs text-muted-foreground">
                      {DAY_LABELS[day][locale].slice(0, 3)}
                    </p>
                    <p className={cn(
                      'text-sm font-semibold',
                      dayIsToday && 'text-primary',
                    )}>
                      {format(date, 'd')}
                    </p>
                    {status === 'done' && (
                      <CheckCircle2 className="h-3 w-3 mx-auto text-green-500 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tasks Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Big Task */}
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{t.lifeOS?.tasks?.bigTask || 'Big Task'}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {bigTask ? (
                  <div 
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all',
                      bigTask.is_completed 
                        ? 'border-green-500/50 bg-green-500/10' 
                        : 'border-primary/30 bg-card'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={bigTask.is_completed}
                        onCheckedChange={() => handleToggleTask(bigTask.id, bigTask.is_completed || false)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <p className={cn(
                          'font-medium text-sm',
                          bigTask.is_completed && 'line-through text-muted-foreground'
                        )}>
                          {bigTask.title}
                        </p>
                        {bigTask.area_key && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            <AreaIcon areaKey={bigTask.area_key} className="h-3 w-3 mr-1" />
                            {t.lifeOS?.areas?.[bigTask.area_key] || bigTask.area_key}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full h-16 border-dashed"
                    onClick={() => navigate('/life-os/sprint')}
                  >
                    {t.lifeOS?.tasks?.addTask || 'Add Task'}
                  </Button>
                )}
              </CardContent>
            </Card>
            
            {/* Small Tasks */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <CardTitle className="text-base">{t.lifeOS?.tasks?.smallTasks || 'Small Tasks'}</CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {smallTasks.filter(t => t.is_completed).length}/{smallTasks.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {smallTasks.length > 0 ? (
                  <div className="space-y-2">
                    {smallTasks.slice(0, 3).map((task) => (
                      <div 
                        key={task.id}
                        className={cn(
                          'flex items-center gap-3 p-2 rounded-lg border transition-all',
                          task.is_completed 
                            ? 'border-green-500/30 bg-green-500/5' 
                            : 'border-border'
                        )}
                      >
                        <Checkbox
                          checked={task.is_completed}
                          onCheckedChange={() => handleToggleTask(task.id, task.is_completed || false)}
                        />
                        <span className={cn(
                          'flex-1 text-sm',
                          task.is_completed && 'line-through text-muted-foreground'
                        )}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                    {smallTasks.length > 3 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate('/life-os')}
                      >
                        +{smallTasks.length - 3} {t.lifeOS?.visionBoard?.more || 'more'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full h-16 border-dashed"
                    onClick={() => navigate('/life-os/sprint')}
                  >
                    {t.lifeOS?.tasks?.addTask || 'Add Task'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progress for the day */}
          {totalToday > 0 && (
            <Card className="mt-4">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {'Progress'} • {format(selectedDate, 'EEEE', { locale: dateLocale })}
                  </span>
                  <span className="text-sm font-medium">{Math.round(progressToday)}%</span>
                </div>
                <Progress value={progressToday} className="h-2" />
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}
