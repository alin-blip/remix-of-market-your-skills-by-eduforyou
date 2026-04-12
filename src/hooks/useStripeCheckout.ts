import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

// Stripe Price IDs (full price — coupon applied at checkout)
export const STRIPE_PRICES = {
  starter: 'price_1TE465BCjwwzvAviTuGii6Ga', // £98/mo
  pro: 'price_1TE46XBCjwwzvAviEZ3x6wGV',     // £194/mo
} as const;

export const STRIPE_PRODUCTS = {
  starter: 'prod_UCT2NKMTyuKrxZ',
  pro: 'prod_UCT2oCPIjHXLof',
} as const;

// Beta Early Bird coupon — 50% forever
export const STRIPE_COUPON = 'EARLYBIRD50';

export function useStripeCheckout() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const checkoutStarter = async () => {
    if (!user) {
      toast.error('Trebuie să fii autentificat pentru a continua');
      return;
    }

    setIsLoading(true);
    try {
      window.fbq?.('track', 'InitiateCheckout', { value: 49, currency: 'GBP', content_name: 'Starter subscription' });
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId: STRIPE_PRICES.starter,
          mode: 'subscription',
          successUrl: `${window.location.origin}/payment-success?plan=starter`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
          userId: user.id,
          trialPeriodDays: 7,
          couponId: STRIPE_COUPON,
        },
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Eroare la procesarea plății');
    } finally {
      setIsLoading(false);
    }
  };

  const checkoutPro = async () => {
    if (!user) {
      toast.error('Trebuie să fii autentificat pentru a face upgrade');
      return;
    }

    setIsLoading(true);
    try {
      window.fbq?.('track', 'InitiateCheckout', { value: 97, currency: 'GBP', content_name: 'Pro subscription' });
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId: STRIPE_PRICES.pro,
          mode: 'subscription',
          successUrl: `${window.location.origin}/payment-success?plan=pro`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
          userId: user.id,
          couponId: STRIPE_COUPON,
        },
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
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
      if (data?.url) window.location.href = data.url;
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
      if (data?.url) window.location.href = data.url;
    } catch (error) {
      console.error('Bundle checkout error:', error);
      toast.error('Eroare la cumpărarea pachetului');
    } finally {
      setIsLoading(false);
    }
  };

  return { checkoutStarter, checkoutPro, checkoutCourse, checkoutBundle, isLoading };
}
