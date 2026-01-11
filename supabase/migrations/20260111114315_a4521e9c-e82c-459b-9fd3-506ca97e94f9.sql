-- Add platform support to gigs_jobs table
ALTER TABLE public.gigs_jobs 
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'swipehire',
ADD COLUMN IF NOT EXISTS platform_listing_url TEXT,
ADD COLUMN IF NOT EXISTS platform_specific_data JSONB DEFAULT '{}'::jsonb;

-- Create freelance_income table for income tracking
CREATE TABLE public.freelance_income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EUR',
  description TEXT,
  client_name TEXT,
  gig_id UUID REFERENCES public.gigs_jobs(id) ON DELETE SET NULL,
  payment_date DATE NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on freelance_income
ALTER TABLE public.freelance_income ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for freelance_income
CREATE POLICY "Users can manage their own income records"
ON public.freelance_income
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create subscriptions table for pricing plans
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  gigs_used INTEGER DEFAULT 0,
  ai_generations_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at on freelance_income
CREATE TRIGGER update_freelance_income_updated_at
BEFORE UPDATE ON public.freelance_income
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();