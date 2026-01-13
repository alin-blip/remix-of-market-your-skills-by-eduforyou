import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  courses_completed: number;
  quizzes_passed: number;
  perfect_quizzes: number;
  lessons_completed: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export function useGamification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user points
  const { data: userPoints, isLoading: pointsLoading } = useQuery({
    queryKey: ['user-points', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no record exists, create one
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('user_points')
          .insert({ user_id: user.id })
          .select()
          .single();
        if (insertError) throw insertError;
        return newData as UserPoints;
      }
      
      return data as UserPoints;
    },
    enabled: !!user?.id,
  });

  // Fetch all badge definitions
  const { data: allBadges = [] } = useQuery({
    queryKey: ['badge-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badge_definitions')
        .select('*')
        .order('requirement_value', { ascending: true });
      if (error) throw error;
      return data as Badge[];
    },
  });

  // Fetch user earned badges
  const { data: earnedBadges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badge:badge_definitions(*)')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!user?.id,
  });

  // Award points mutation
  const awardPointsMutation = useMutation({
    mutationFn: async ({ 
      points, 
      type 
    }: { 
      points: number; 
      type: 'lesson' | 'course' | 'quiz' | 'perfect_quiz' 
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];
      
      // Get current points record
      const { data: currentPoints, error: fetchError } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      let updates: any = {
        total_points: (currentPoints?.total_points || 0) + points,
        updated_at: new Date().toISOString(),
      };

      // Update specific counter
      if (type === 'lesson') {
        updates.lessons_completed = (currentPoints?.lessons_completed || 0) + 1;
      } else if (type === 'course') {
        updates.courses_completed = (currentPoints?.courses_completed || 0) + 1;
      } else if (type === 'quiz') {
        updates.quizzes_passed = (currentPoints?.quizzes_passed || 0) + 1;
      } else if (type === 'perfect_quiz') {
        updates.perfect_quizzes = (currentPoints?.perfect_quizzes || 0) + 1;
        updates.quizzes_passed = (currentPoints?.quizzes_passed || 0) + 1;
      }

      // Update streak
      const lastActivity = currentPoints?.last_activity_date;
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Consecutive day
          updates.current_streak = (currentPoints?.current_streak || 0) + 1;
          if (updates.current_streak > (currentPoints?.longest_streak || 0)) {
            updates.longest_streak = updates.current_streak;
          }
        } else if (diffDays > 1) {
          // Streak broken
          updates.current_streak = 1;
        }
        // Same day - no streak change
      } else {
        updates.current_streak = 1;
        updates.longest_streak = 1;
      }
      
      updates.last_activity_date = today;

      if (currentPoints) {
        const { error } = await supabase
          .from('user_points')
          .update(updates)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_points')
          .insert({ user_id: user.id, ...updates });
        if (error) throw error;
      }

      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-points'] });
    },
  });

  // Check and award badges
  const checkBadgesMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !userPoints) return [];

      const earnedBadgeIds = earnedBadges.map(eb => eb.badge_id);
      const newBadges: Badge[] = [];

      for (const badge of allBadges) {
        if (earnedBadgeIds.includes(badge.id)) continue;

        let earned = false;
        const currentValue = userPoints[badge.requirement_type as keyof UserPoints] as number;
        
        if (currentValue >= badge.requirement_value) {
          earned = true;
        }

        if (earned) {
          const { error } = await supabase
            .from('user_badges')
            .insert({
              user_id: user.id,
              badge_id: badge.id,
            });

          if (!error) {
            newBadges.push(badge);
            // Award bonus points for badge
            await supabase
              .from('user_points')
              .update({ 
                total_points: (userPoints.total_points || 0) + badge.points_reward 
              })
              .eq('user_id', user.id);
          }
        }
      }

      return newBadges;
    },
    onSuccess: (newBadges) => {
      if (newBadges && newBadges.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['user-badges'] });
        queryClient.invalidateQueries({ queryKey: ['user-points'] });
        
        newBadges.forEach(badge => {
          toast.success(`🏆 Badge nou: ${badge.name}!`, {
            description: `${badge.description} (+${badge.points_reward} puncte)`,
            duration: 5000,
          });
        });
      }
    },
  });

  // Helper to award points and check badges
  const awardActivity = async (
    points: number, 
    type: 'lesson' | 'course' | 'quiz' | 'perfect_quiz'
  ) => {
    await awardPointsMutation.mutateAsync({ points, type });
    // Wait a bit for the points to update, then check badges
    setTimeout(() => {
      checkBadgesMutation.mutate();
    }, 500);
  };

  return {
    userPoints,
    earnedBadges,
    allBadges,
    isLoading: pointsLoading || badgesLoading,
    awardActivity,
    checkBadges: checkBadgesMutation.mutate,
  };
}
