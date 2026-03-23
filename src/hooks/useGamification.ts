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
      return data as UserPoints | null;
    },
    enabled: !!user?.id,
  });

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

  // Award points via secure DB function
  const awardPointsMutation = useMutation({
    mutationFn: async ({ points, type }: { points: number; type: 'lesson' | 'course' | 'quiz' | 'perfect_quiz' }) => {
      const { error } = await supabase.rpc('award_activity', {
        p_points: points,
        p_type: type,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-points'] });
    },
  });

  // Check and award badges via secure DB function
  const checkBadgesMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('check_and_award_badges');
      if (error) throw error;
      return data as Array<{ id: string; name: string; description: string; icon: string; color: string; points_reward: number }> | null;
    },
    onSuccess: (newBadges) => {
      if (newBadges && Array.isArray(newBadges) && newBadges.length > 0) {
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

  const awardActivity = async (
    points: number,
    type: 'lesson' | 'course' | 'quiz' | 'perfect_quiz'
  ) => {
    await awardPointsMutation.mutateAsync({ points, type });
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
