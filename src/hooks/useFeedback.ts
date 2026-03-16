import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export function useFeedback(stepKey: string) {
  const { user } = useAuth();
  const [showFeedback, setShowFeedback] = useState(false);

  const triggerFeedback = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('step_feedback' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('step_key', stepKey)
        .maybeSingle();

      if (!data) {
        setShowFeedback(true);
      }
    } catch (error) {
      // Silently fail — don't block the user flow
      console.error('Feedback check error:', error);
    }
  }, [user, stepKey]);

  return { showFeedback, setShowFeedback, triggerFeedback };
}
