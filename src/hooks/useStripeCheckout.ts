import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

// Stripe Price IDs
export const STRIPE_PRICES = {
  starter: 'price_1Sp36WBCjwwzvAviNnAplktI',
  pro: 'price_1Sp36YBCjwwzvAviPTWnJCju',
  founder: 'price_1Sp36ZBCjwwzvAviBChikarB',
} as const;

type PlanType = keyof typeof STRIPE_PRICES;

export function useStripeCheckout() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const checkout = async (plan: PlanType) => {
    if (!user) {
      toast.error('Trebuie să fii autentificat pentru a face upgrade');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId: STRIPE_PRICES[plan],
          mode: plan === 'founder' ? 'payment' : 'subscription',
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
          userId: user.id,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Eroare la procesarea plății');
    } finally {
      setIsLoading(false);
    }
  };

  const checkoutCourse = async (courseId: string, priceId: string) => {
    if (!user) {
      toast.error('Trebuie să fii autentificat pentru a cumpăra cursul');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId,
          mode: 'payment',
          successUrl: `${window.location.origin}/learning-hub?success=true`,
          cancelUrl: `${window.location.origin}/learning-hub?canceled=true`,
          userId: user.id,
          courseId,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Course checkout error:', error);
      toast.error('Eroare la cumpărarea cursului');
    } finally {
      setIsLoading(false);
    }
  };

  return { checkout, checkoutCourse, isLoading };
}
