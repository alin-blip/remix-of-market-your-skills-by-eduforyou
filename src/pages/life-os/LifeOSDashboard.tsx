import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { 
  Target, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Plus,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useI18n } from '@/lib/i18n';
import { 
  useLifeAreas, 
  useWeeklySprint, 
  useDailyTasks,
  useUpdateDailyTask,
  useLifeOSSetupComplete,
  getCurrentWeekKey,
} from '@/hooks/useLifeOS';
import { LIFE_AREAS, DAYS_OF_WEEK, DAY_LABELS, DayOfWeek } from '@/types/lifeOS';
import { cn } from '@/lib/utils';
import { AreaIcon } from '@/components/life-os/AreaIcon';

export default function LifeOSDashboard() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const dateLocale = locale === 'ro' ? ro : enUS;
  
  const { isSetupComplete, hasAreas } = useLifeOSSetupComplete();
  const { data: areas, isLoading: areasLoading } = useLifeAreas();
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
  
  // Redirect to setup if not complete
  useEffect(() => {
    if (!areasLoading && !hasAreas) {
      navigate('/life-os/setup');
    }
  }, [areasLoading, hasAreas, navigate]);
  
  if (areasLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">
              {t.lifeOS?.title || 'Life OS'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t.lifeOS?.dashboard || 'Dashboard'} • {format(today, 'EEEE, d MMMM', { locale: dateLocale })}
            </p>
          </div>
          <Button onClick={() => navigate('/life-os/sprint')} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            {t.lifeOS?.sprint?.planning || 'Sprint Planning'}
          </Button>
        </div>
        
        {/* Areas Progress */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {areas?.map((area) => (
            <Card 
              key={area.id} 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate(`/life-os/area/${area.area_key}`)}
            >
              <CardContent className="p-4 text-center">
                <AreaIcon areaKey={area.area_key} className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium capitalize">
                  {t.lifeOS?.areas?.[area.area_key] || area.area_key}
                </p>
                <Progress value={65} className="h-1.5 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Week Navigation */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {sprint?.week_goal || (t.lifeOS?.sprint?.goal || 'Week Goal')}
                </CardTitle>
                <CardDescription>
                  {t.lifeOS?.timeframes?.weekly || 'Weekly Sprint'}
                </CardDescription>
              </div>
              <Badge variant="outline">
                {getCurrentWeekKey().replace('life-os-', '')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map(({ day, date, isToday: dayIsToday, isSelected, completed, total, status }) => (
                <button
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    'p-3 rounded-lg border text-center transition-all',
                    isSelected && 'border-primary bg-primary/10',
                    dayIsToday && !isSelected && 'border-primary/50',
                    !isSelected && !dayIsToday && 'border-border hover:border-primary/30',
                  )}
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    {DAY_LABELS[day][locale]}
                  </p>
                  <p className={cn(
                    'text-lg font-semibold',
                    dayIsToday && 'text-primary',
                  )}>
                    {format(date, 'd')}
                  </p>
                  <div className="mt-2">
                    {status === 'done' && (
                      <CheckCircle2 className="h-4 w-4 mx-auto text-green-500" />
                    )}
                    {status === 'partial' && (
                      <div className="text-xs text-muted-foreground">{completed}/{total}</div>
                    )}
                    {status === 'empty' && (
                      <Circle className="h-4 w-4 mx-auto text-muted-foreground/30" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Today's Tasks */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Big Task */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>{t.lifeOS?.tasks?.bigTask || 'Big Task'}</CardTitle>
              </div>
              <CardDescription>
                {format(selectedDate, 'EEEE, d MMMM', { locale: dateLocale })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bigTask ? (
                <div 
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all',
                    bigTask.is_completed 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : 'border-primary/30 bg-card'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={bigTask.is_completed}
                      onCheckedChange={() => handleToggleTask(bigTask.id, bigTask.is_completed)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className={cn(
                        'font-medium',
                        bigTask.is_completed && 'line-through text-muted-foreground'
                      )}>
                        {bigTask.title}
                      </p>
                      {bigTask.area_key && (
                        <Badge variant="secondary" className="mt-2">
                          {t.lifeOS?.areas?.[bigTask.area_key] || bigTask.area_key}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-24 border-dashed"
                  onClick={() => navigate('/life-os/sprint')}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {t.lifeOS?.tasks?.addTask || 'Add Task'}
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Small Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <CardTitle>{t.lifeOS?.tasks?.smallTasks || 'Small Tasks'}</CardTitle>
                </div>
                <span className="text-sm text-muted-foreground">
                  {smallTasks.filter(t => t.is_completed).length}/{smallTasks.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {smallTasks.length > 0 ? (
                smallTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border transition-all',
                      task.is_completed && 'bg-muted/50'
                    )}
                  >
                    <Checkbox
                      checked={task.is_completed}
                      onCheckedChange={() => handleToggleTask(task.id, task.is_completed)}
                    />
                    <span className={cn(
                      'flex-1',
                      task.is_completed && 'line-through text-muted-foreground'
                    )}>
                      {task.title}
                    </span>
                    {task.area_key && (
                      <AreaIcon areaKey={task.area_key} className="h-4 w-4" />
                    )}
                  </div>
                ))
              ) : (
                <Button 
                  variant="ghost" 
                  className="w-full border border-dashed"
                  onClick={() => navigate('/life-os/sprint')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t.lifeOS?.tasks?.addTask || 'Add Tasks'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>{t.lifeOS?.dashboard || 'Progress'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    {format(selectedDate, 'EEEE', { locale: dateLocale })}
                  </span>
                  <span className="font-medium">{Math.round(progressToday)}%</span>
                </div>
                <Progress value={progressToday} className="h-3" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{completedToday}/{totalToday}</p>
                <p className="text-xs text-muted-foreground">tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
