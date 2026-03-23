import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export type SubscriptionPlan = 'starter' | 'pro' | 'eduforyou';

interface SubscriptionState {
  plan: SubscriptionPlan;
  subscribed: boolean;
  subscriptionEnd: string | null;
  isLoading: boolean;
  isEduforyouMember: boolean;
}

// Feature limits by plan
export const PLAN_LIMITS = {
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
    hasDream100: false,
    hasCVGenerator: false,
    hasCertifications: false,
    hasAdnTest: false,
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
    hasDream100: true,
    hasCVGenerator: true,
    hasCertifications: true,
    hasAdnTest: true,
  },
  eduforyou: {
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
    hasDream100: true,
    hasCVGenerator: true,
    hasCertifications: true,
    hasAdnTest: true,
  },
} as const;

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    plan: 'starter',
    subscribed: false,
    subscriptionEnd: null,
    isLoading: true,
    isEduforyouMember: false,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({
        plan: 'starter',
        subscribed: false,
        subscriptionEnd: null,
        isLoading: false,
        isEduforyouMember: false,
      });
      return;
    }

    try {
      // Check if user is EduForYou member
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_eduforyou_member')
        .eq('id', user.id)
        .single();

      const isEdu = profile?.is_eduforyou_member === true;

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        const { data: localSub } = await supabase
          .from('subscriptions')
          .select('plan, status, current_period_end')
          .eq('user_id', user.id)
          .single();
        
        if (localSub) {
          const paidPlan = localSub.plan as SubscriptionPlan;
          const effectivePlan = isEdu ? 'eduforyou' : (paidPlan === 'pro' ? 'pro' : 'starter');
          setState({
            plan: effectivePlan,
            subscribed: localSub.status === 'active' || isEdu,
            subscriptionEnd: localSub.current_period_end,
            isLoading: false,
            isEduforyouMember: isEdu,
          });
          return;
        }

        // No subscription at all
        setState({
          plan: isEdu ? 'eduforyou' : 'starter',
          subscribed: isEdu,
          subscriptionEnd: null,
          isLoading: false,
          isEduforyouMember: isEdu,
        });
        return;
      }
      
      if (data) {
        const paidPlan = data.plan as string;
        const isPro = paidPlan === 'pro';
        setState({
          plan: isEdu ? 'eduforyou' : (isPro ? 'pro' : 'starter'),
          subscribed: data.subscribed || isEdu,
          subscriptionEnd: data.subscription_end,
          isLoading: false,
          isEduforyouMember: isEdu,
        });
      } else if (isEdu) {
        setState({
          plan: 'eduforyou',
          subscribed: true,
          subscriptionEnd: null,
          isLoading: false,
          isEduforyouMember: true,
        });
      } else {
        setState({
          plan: 'starter',
          subscribed: false,
          subscriptionEnd: null,
          isLoading: false,
          isEduforyouMember: false,
        });
      }
    } catch (error) {
      console.error('Subscription check failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const canUseFeature = useCallback((feature: keyof typeof PLAN_LIMITS.starter) => {
    const limits = PLAN_LIMITS[state.plan];
    const value = limits[feature];
    return typeof value === 'boolean' ? value : value > 0;
  }, [state.plan]);

  const getLimit = useCallback((feature: keyof typeof PLAN_LIMITS.starter) => {
    return PLAN_LIMITS[state.plan][feature];
  }, [state.plan]);

  const requiresUpgrade = useCallback((requiredPlan: SubscriptionPlan) => {
    const planOrder: SubscriptionPlan[] = ['starter', 'pro'];
    const effectivePlan = state.plan === 'eduforyou' ? 'pro' : state.plan;
    const currentIndex = planOrder.indexOf(effectivePlan);
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
