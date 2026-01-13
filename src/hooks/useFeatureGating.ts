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
    requiredPlan: 'starter',
    featureName: '',
    featureDescription: undefined
  });

  const checkFeatureAccess = useCallback((
    feature: keyof typeof PLAN_LIMITS.free,
    featureName: string,
    featureDescription?: string
  ): boolean => {
    if (canUseFeature(feature)) {
      return true;
    }

    // Determine which plan is required based on where the feature becomes available
    let requiredPlan: SubscriptionPlan = 'starter';
    
    const starterLimit = PLAN_LIMITS.starter[feature];
    const proLimit = PLAN_LIMITS.pro[feature];
    
    // Check if starter plan doesn't have this feature
    if (starterLimit === false) {
      requiredPlan = 'pro';
    }
    // Check if pro plan doesn't have this feature
    if (proLimit === false) {
      requiredPlan = 'founder';
    }

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
