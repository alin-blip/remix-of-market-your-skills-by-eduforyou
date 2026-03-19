import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'founder' | 'eduforyou';

interface SubscriptionState {
  plan: SubscriptionPlan;
  subscribed: boolean;
  subscriptionEnd: string | null;
  isLoading: boolean;
  isEduforyouMember: boolean;
}

// Feature limits by plan
export const PLAN_LIMITS = {
  free: {
    platforms: 1,
    gigs: 3,
    aiGenerations: 5,
    outreachTemplates: 0,
    hasProfileBuilder: false,
    hasIncomeTracker: false,
    hasExport: false,
    hasPrioritySupport: false,
    hasAllCourses: false,
    hasExternalCourses: false,
  },
  starter: {
    platforms: 3,
    gigs: 15,
    aiGenerations: 50,
    outreachTemplates: 5,
    hasProfileBuilder: true,
    hasIncomeTracker: true,
    hasExport: true,
    hasPrioritySupport: false,
    hasAllCourses: false,
    hasExternalCourses: false,
  },
  pro: {
    platforms: Infinity,
    gigs: Infinity,
    aiGenerations: Infinity,
    outreachTemplates: Infinity,
    hasProfileBuilder: true,
    hasIncomeTracker: true,
    hasExport: true,
    hasPrioritySupport: true,
    hasAllCourses: false,
    hasExternalCourses: true,
  },
  founder: {
    platforms: Infinity,
    gigs: Infinity,
    aiGenerations: Infinity,
    outreachTemplates: Infinity,
    hasProfileBuilder: true,
    hasIncomeTracker: true,
    hasExport: true,
    hasPrioritySupport: true,
    hasAllCourses: true,
    hasExternalCourses: true,
  },
  // EduForYou members: full platform access EXCEPT Learning Hub
  eduforyou: {
    platforms: Infinity,
    gigs: Infinity,
    aiGenerations: Infinity,
    outreachTemplates: Infinity,
    hasProfileBuilder: true,
    hasIncomeTracker: true,
    hasExport: true,
    hasPrioritySupport: false,
    hasAllCourses: false,
    hasExternalCourses: false,
  },
} as const;

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    plan: 'free',
    subscribed: false,
    subscriptionEnd: null,
    isLoading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({
        plan: 'free',
        subscribed: false,
        subscriptionEnd: null,
        isLoading: false,
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        // Fallback to local database
        const { data: localSub } = await supabase
          .from('subscriptions')
          .select('plan, status, current_period_end')
          .eq('user_id', user.id)
          .single();
        
        if (localSub) {
          setState({
            plan: localSub.plan as SubscriptionPlan,
            subscribed: localSub.status === 'active',
            subscriptionEnd: localSub.current_period_end,
            isLoading: false,
          });
          return;
        }
      }
      
      if (data) {
        setState({
          plan: data.plan as SubscriptionPlan,
          subscribed: data.subscribed,
          subscriptionEnd: data.subscription_end,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Subscription check failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    
    // Refresh subscription status periodically (every 60 seconds)
    const interval = setInterval(checkSubscription, 60000);
    
    return () => clearInterval(interval);
  }, [checkSubscription]);

  // Helper functions for feature gating
  const canUseFeature = useCallback((feature: keyof typeof PLAN_LIMITS.free) => {
    const limits = PLAN_LIMITS[state.plan];
    const value = limits[feature];
    return typeof value === 'boolean' ? value : value > 0;
  }, [state.plan]);

  const getLimit = useCallback((feature: keyof typeof PLAN_LIMITS.free) => {
    return PLAN_LIMITS[state.plan][feature];
  }, [state.plan]);

  const requiresUpgrade = useCallback((requiredPlan: SubscriptionPlan) => {
    const planOrder: SubscriptionPlan[] = ['free', 'starter', 'pro', 'founder'];
    const currentIndex = planOrder.indexOf(state.plan);
    const requiredIndex = planOrder.indexOf(requiredPlan);
    return currentIndex < requiredIndex;
  }, [state.plan]);

  const openCustomerPortal = useCallback(async () => {
    if (!user) {
      toast.error('Trebuie să fii autentificat');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Customer portal error:', error);
      toast.error('Nu ai o subscripție activă pentru a gestiona');
    }
  }, [user]);

  return {
    ...state,
    limits: PLAN_LIMITS[state.plan],
    checkSubscription,
    canUseFeature,
    getLimit,
    requiresUpgrade,
    openCustomerPortal,
  };
}
