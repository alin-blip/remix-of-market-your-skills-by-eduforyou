import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

// Stripe Price IDs
export const STRIPE_PRICES = {
  pro: 'price_1TE3i0BCjwwzvAviQhho4o3E',
} as const;

export const STRIPE_PRODUCTS = {
  pro: 'prod_UCSdvbrfCzXZOI',
} as const;

export function useStripeCheckout() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const checkoutPro = async (withTrial = false) => {
    if (!user) {
      toast.error('Trebuie să fii autentificat pentru a face upgrade');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId: STRIPE_PRICES.pro,
          mode: 'subscription',
          successUrl: `${window.location.origin}/payment-success?plan=pro`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
          userId: user.id,
          ...(withTrial ? { trialPeriodDays: 7 } : {}),
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
          successUrl: `${window.location.origin}/payment-success?type=course&course_id=${courseId}`,
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

  const checkoutBundle = async (bundleId: string, priceId: string) => {
    if (!user) {
      toast.error('Trebuie să fii autentificat pentru a cumpăra pachetul');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId,
          mode: 'payment',
          successUrl: `${window.location.origin}/payment-success?type=bundle&bundle_id=${bundleId}`,
          cancelUrl: `${window.location.origin}/learning-hub?canceled=true`,
          userId: user.id,
          bundleId,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Bundle checkout error:', error);
      toast.error('Eroare la cumpărarea pachetului');
    } finally {
      setIsLoading(false);
    }
  };

  return { checkoutPro, checkoutCourse, checkoutBundle, isLoading };
}
