import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, addDays, getISOWeek, getYear } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';
import { 
  Calendar, 
  Target, 
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  ChevronLeft,
  Save,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { 
  useLifeAreas,
  useWeeklySprint,
  useSaveWeeklySprint,
  useDailyTasks,
  useSaveDailyTasks,
  useDeleteDailyTask,
  useLifeGoals,
  getCurrentWeekKey,
} from '@/hooks/useLifeOS';
import { 
  DAYS_OF_WEEK, 
  DAY_LABELS, 
  DayOfWeek, 
  LifeAreaKey,
  DailyTask,
} from '@/types/lifeOS';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AreaIcon } from '@/components/life-os/AreaIcon';

export default function WeeklySprintPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dateLocale = locale === 'ro' ? ro : enUS;
  
  const weekKey = getCurrentWeekKey();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  
  const { data: areas } = useLifeAreas();
  const { data: sprint, isLoading: sprintLoading } = useWeeklySprint(weekKey);
  const { data: existingTasks } = useDailyTasks(sprint?.id);
  const { data: monthlyGoals } = useLifeGoals('monthly');
  
  const saveSprint = useSaveWeeklySprint();
  const saveTasks = useSaveDailyTasks();
  const deleteTask = useDeleteDailyTask();
  
  const [weekGoal, setWeekGoal] = useState('');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MON');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for tasks per day
  const [dayTasks, setDayTasks] = useState<Record<DayOfWeek, {
    bigTask: { title: string; area_key: LifeAreaKey | '' };
    smallTasks: Array<{ title: string; area_key: LifeAreaKey | '' }>;
  }>>(() => {
    const initial: any = {};
    DAYS_OF_WEEK.forEach(day => {
      initial[day] = {
        bigTask: { title: '', area_key: '' },
        smallTasks: [{ title: '', area_key: '' }],
      };
    });
    return initial;
  });
  
  // Load existing data
  useEffect(() => {
    if (sprint?.week_goal) {
      setWeekGoal(sprint.week_goal);
    }
    
    if (existingTasks?.length) {
      const tasksByDay: Record<string, DailyTask[]> = {};
      existingTasks.forEach(task => {
        if (!tasksByDay[task.day_of_week]) tasksByDay[task.day_of_week] = [];
        tasksByDay[task.day_of_week].push(task);
      });
      
      const newDayTasks: any = {};
      DAYS_OF_WEEK.forEach(day => {
        const tasks = tasksByDay[day] || [];
        const big = tasks.find(t => t.task_type === 'big');
        const smalls = tasks.filter(t => t.task_type === 'small');
        
        newDayTasks[day] = {
          bigTask: { 
            title: big?.title || '', 
            area_key: big?.area_key || '' 
          },
          smallTasks: smalls.length > 0 
            ? smalls.map(s => ({ title: s.title, area_key: s.area_key || '' }))
            : [{ title: '', area_key: '' }],
        };
      });
      setDayTasks(newDayTasks);
    }
  }, [sprint, existingTasks]);
  
  const generateWithAI = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('life-os-wizard', {
        body: {
          action: 'weekly_sprint',
          areas: areas?.map(a => a.area_key) || [],
          existingGoals: monthlyGoals,
          currentPeriod: weekKey,
        },
      });
      
      if (error) throw error;
      
      const result = data.data;
      if (result) {
        if (result.goal) setWeekGoal(result.goal);
        if (result.days) {
          const newDayTasks: any = {};
          DAYS_OF_WEEK.forEach(day => {
            const dayData = result.days[day];
            if (dayData) {
              newDayTasks[day] = {
                bigTask: dayData.big_task || { title: '', area_key: '' },
                smallTasks: dayData.small_tasks?.length 
                  ? dayData.small_tasks 
                  : [{ title: '', area_key: '' }],
              };
            } else {
              newDayTasks[day] = {
                bigTask: { title: '', area_key: '' },
                smallTasks: [{ title: '', area_key: '' }],
              };
            }
          });
          setDayTasks(newDayTasks);
        }
        toast.success('Sprint generated!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate sprint');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save sprint
      const sprintData = await saveSprint.mutateAsync({
        week_key: weekKey,
        week_goal: weekGoal,
        wins: sprint?.wins || [],
        lessons: sprint?.lessons || [],
        planned_at: new Date().toISOString(),
      });
      
      // Delete existing tasks for this sprint
      if (existingTasks?.length) {
        await Promise.all(existingTasks.map(t => deleteTask.mutateAsync(t.id)));
      }
      
      // Prepare new tasks
      const newTasks: Omit<DailyTask, 'id' | 'user_id' | 'created_at'>[] = [];
      
      DAYS_OF_WEEK.forEach((day, index) => {
        const date = addDays(weekStart, index);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayData = dayTasks[day];
        
        if (dayData.bigTask.title.trim()) {
          newTasks.push({
            sprint_id: sprintData.id,
            area_key: dayData.bigTask.area_key || undefined,
            day_date: dateStr,
            day_of_week: day,
            task_type: 'big',
            title: dayData.bigTask.title,
            is_completed: false,
            position: 0,
          });
        }
        
        dayData.smallTasks.forEach((task, i) => {
          if (task.title.trim()) {
            newTasks.push({
              sprint_id: sprintData.id,
              area_key: task.area_key || undefined,
              day_date: dateStr,
              day_of_week: day,
              task_type: 'small',
              title: task.title,
              is_completed: false,
              position: i + 1,
            });
          }
        });
      });
      
      if (newTasks.length > 0) {
        await saveTasks.mutateAsync(newTasks);
      }
      
      toast.success(t.common?.success || 'Saved!');
      navigate('/life-os');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t.common?.error || 'Error saving');
    } finally {
      setIsSaving(false);
    }
  };
  
  const updateBigTask = (day: DayOfWeek, field: 'title' | 'area_key', value: string) => {
    setDayTasks(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        bigTask: { ...prev[day].bigTask, [field]: value },
      },
    }));
  };
  
  const updateSmallTask = (day: DayOfWeek, index: number, field: 'title' | 'area_key', value: string) => {
    setDayTasks(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        smallTasks: prev[day].smallTasks.map((t, i) => 
          i === index ? { ...t, [field]: value } : t
        ),
      },
    }));
  };
  
  const addSmallTask = (day: DayOfWeek) => {
    setDayTasks(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        smallTasks: [...prev[day].smallTasks, { title: '', area_key: '' }],
      },
    }));
  };
  
  const removeSmallTask = (day: DayOfWeek, index: number) => {
    setDayTasks(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        smallTasks: prev[day].smallTasks.filter((_, i) => i !== index),
      },
    }));
  };
  
  if (sprintLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/life-os')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-display">
                {t.lifeOS?.sprint?.planning || 'Sprint Planning'}
              </h1>
              <p className="text-muted-foreground">
                {weekKey.replace('life-os-', '')} • {format(weekStart, 'd MMM', { locale: dateLocale })} - {format(addDays(weekStart, 6), 'd MMM', { locale: dateLocale })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={generateWithAI}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate with AI
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t.common?.save || 'Save'}
            </Button>
          </div>
        </div>
        
        {/* Week Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t.lifeOS?.sprint?.goal || 'Week Goal'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={weekGoal}
              onChange={(e) => setWeekGoal(e.target.value)}
              placeholder="What's your main objective for this week?"
              className="resize-none"
            />
          </CardContent>
        </Card>
        
        {/* Day Tabs */}
        <Tabs value={selectedDay} onValueChange={(v) => setSelectedDay(v as DayOfWeek)}>
          <TabsList className="grid grid-cols-7 w-full">
            {DAYS_OF_WEEK.map((day, index) => {
              const date = addDays(weekStart, index);
              return (
                <TabsTrigger key={day} value={day} className="flex-col py-2">
                  <span className="text-xs">{DAY_LABELS[day][locale].slice(0, 3)}</span>
                  <span className="text-lg font-semibold">{format(date, 'd')}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {DAYS_OF_WEEK.map((day) => (
            <TabsContent key={day} value={day} className="space-y-4 mt-4">
              {/* Big Task */}
              <Card className="border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {t.lifeOS?.tasks?.bigTask || 'Big Task'}
                  </CardTitle>
                  <CardDescription>Main focus for the day (~2-4 hours)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={dayTasks[day].bigTask.title}
                    onChange={(e) => updateBigTask(day, 'title', e.target.value)}
                    placeholder="What's your main task for today?"
                  />
                  <Select
                    value={dayTasks[day].bigTask.area_key || undefined}
                    onValueChange={(v) => updateBigTask(day, 'area_key', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas?.map((area) => (
                        <SelectItem key={area.area_key} value={area.area_key}>
                          <div className="flex items-center gap-2">
                            <AreaIcon areaKey={area.area_key} className="h-4 w-4" />
                            <span className="capitalize">
                              {t.lifeOS?.areas?.[area.area_key] || area.area_key}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              {/* Small Tasks */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {t.lifeOS?.tasks?.smallTasks || 'Small Tasks'}
                      </CardTitle>
                      <CardDescription>Quick wins (15-60 min each)</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addSmallTask(day)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dayTasks[day].smallTasks.map((task, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={task.title}
                        onChange={(e) => updateSmallTask(day, index, 'title', e.target.value)}
                        placeholder={`Task ${index + 1}`}
                        className="flex-1"
                      />
                      <Select
                        value={task.area_key || undefined}
                        onValueChange={(v) => updateSmallTask(day, index, 'area_key', v)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Area" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas?.map((area) => (
                            <SelectItem key={area.area_key} value={area.area_key}>
                              <div className="flex items-center gap-2">
                                <AreaIcon areaKey={area.area_key} className="h-4 w-4" />
                                <span className="capitalize">
                                  {t.lifeOS?.areas?.[area.area_key] || area.area_key}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {dayTasks[day].smallTasks.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeSmallTask(day, index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
