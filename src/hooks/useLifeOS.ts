import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { 
  LifeArea, 
  LifeGoal, 
  WeeklySprint, 
  DailyTask, 
  LifeAreaKey, 
  GoalType,
  DayOfWeek,
  TaskType 
} from '@/types/lifeOS';
import { format, startOfWeek, getISOWeek, getYear } from 'date-fns';

// Helper to get current week key
export function getCurrentWeekKey(): string {
  const now = new Date();
  const week = getISOWeek(now);
  const year = getYear(now);
  return `life-os-${year}-W${week.toString().padStart(2, '0')}`;
}

export function useLifeAreas() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['life-areas', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('life_areas')
        .select('*')
        .eq('user_id', user.id)
        .order('position');
      
      if (error) throw error;
      return data as LifeArea[];
    },
    enabled: !!user?.id,
  });
}

export function useSaveLifeAreas() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (areas: LifeAreaKey[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Delete existing areas
      await supabase.from('life_areas').delete().eq('user_id', user.id);
      
      // Insert new areas
      const inserts = areas.map((area_key, index) => ({
        user_id: user.id,
        area_key,
        is_active: true,
        position: index,
      }));
      
      const { error } = await supabase.from('life_areas').insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-areas'] });
    },
  });
}

export function useLifeGoals(goalType?: GoalType, period?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['life-goals', user?.id, goalType, period],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('life_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('position');
      
      if (goalType) query = query.eq('goal_type', goalType);
      if (period) query = query.eq('period', period);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as LifeGoal[];
    },
    enabled: !!user?.id,
  });
}

export function useSaveLifeGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (goals: Omit<LifeGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const inserts = goals.map((goal) => ({
        ...goal,
        user_id: user.id,
      }));
      
      const { data, error } = await supabase.from('life_goals').insert(inserts).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-goals'] });
    },
  });
}

export function useUpdateLifeGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LifeGoal> }) => {
      const { error } = await supabase
        .from('life_goals')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-goals'] });
    },
  });
}

export function useWeeklySprint(weekKey?: string) {
  const { user } = useAuth();
  const key = weekKey || getCurrentWeekKey();
  
  return useQuery({
    queryKey: ['weekly-sprint', user?.id, key],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('weekly_sprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_key', key)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        wins: Array.isArray(data.wins) ? data.wins : [],
        lessons: Array.isArray(data.lessons) ? data.lessons : [],
      } as WeeklySprint;
    },
    enabled: !!user?.id,
  });
}

export function useSaveWeeklySprint() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sprint: Omit<WeeklySprint, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('weekly_sprints')
        .upsert({
          ...sprint,
          user_id: user.id,
        }, { onConflict: 'user_id,week_key' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-sprint'] });
    },
  });
}

export function useDailyTasks(sprintId?: string, date?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['daily-tasks', user?.id, sprintId, date],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('position');
      
      if (sprintId) query = query.eq('sprint_id', sprintId);
      if (date) query = query.eq('day_date', date);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as DailyTask[];
    },
    enabled: !!user?.id,
  });
}

export function useSaveDailyTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tasks: Omit<DailyTask, 'id' | 'user_id' | 'created_at'>[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const inserts = tasks.map((task) => ({
        ...task,
        user_id: user.id,
      }));
      
      const { data, error } = await supabase.from('daily_tasks').insert(inserts).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-tasks'] });
    },
  });
}

export function useUpdateDailyTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DailyTask> }) => {
      const { error } = await supabase
        .from('daily_tasks')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-tasks'] });
    },
  });
}

export function useDeleteDailyTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('daily_tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-tasks'] });
    },
  });
}

export function useLifeOSSetupComplete() {
  const { data: areas } = useLifeAreas();
  const { data: goals } = useLifeGoals('annual');
  
  return {
    hasAreas: (areas?.length ?? 0) > 0,
    hasAnnualGoals: (goals?.length ?? 0) > 0,
    isSetupComplete: (areas?.length ?? 0) > 0 && (goals?.length ?? 0) > 0,
  };
}
