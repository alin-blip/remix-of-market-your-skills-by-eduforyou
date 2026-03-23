import { useState, useCallback } from 'react';
import { useSubscription, SubscriptionPlan, PLAN_LIMITS } from './useSubscription';

interface FeatureGatingState {
  showUpgradeModal: boolean;
  requiredPlan: SubscriptionPlan;
  featureName: string;
  featureDescription?: string;
}

export function useFeatureGating() {
  const { plan, requiresUpgrade, canUseFeature, getLimit } = useSubscription();
  
  const [gatingState, setGatingState] = useState<FeatureGatingState>({
    showUpgradeModal: false,
    requiredPlan: 'pro',
    featureName: '',
    featureDescription: undefined
  });

  const checkFeatureAccess = useCallback((
    feature: keyof typeof PLAN_LIMITS.starter,
    featureName: string,
    featureDescription?: string
  ): boolean => {
    if (canUseFeature(feature)) {
      return true;
    }

    // Features not in starter require pro
    const requiredPlan: SubscriptionPlan = 'pro';

    setGatingState({
      showUpgradeModal: true,
      requiredPlan,
      featureName,
      featureDescription
    });

    return false;
  }, [canUseFeature]);

  const checkPlanAccess = useCallback((
    requiredPlan: SubscriptionPlan,
    featureName: string,
    featureDescription?: string
  ): boolean => {
    if (!requiresUpgrade(requiredPlan)) {
      return true;
    }

    setGatingState({
      showUpgradeModal: true,
      requiredPlan,
      featureName,
      featureDescription
    });

    return false;
  }, [requiresUpgrade]);

  const closeUpgradeModal = useCallback(() => {
    setGatingState(prev => ({ ...prev, showUpgradeModal: false }));
  }, []);

  return {
    plan,
    gatingState,
    checkFeatureAccess,
    checkPlanAccess,
    closeUpgradeModal,
    canUseFeature,
    getLimit,
    requiresUpgrade
  };
}
