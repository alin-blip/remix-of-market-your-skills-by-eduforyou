-- Create gigs_jobs table for storing user-created gigs and jobs
CREATE TABLE public.gigs_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gig', 'job')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  skills JSONB DEFAULT '[]',
  price_type TEXT CHECK (price_type IN ('fixed', 'hourly', 'monthly')),
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'EUR',
  location_type TEXT CHECK (location_type IN ('remote', 'onsite', 'hybrid')),
  location TEXT,
  source_package TEXT,
  is_published BOOLEAN DEFAULT false,
  swipehire_id TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gigs_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to manage their own gigs/jobs
CREATE POLICY "Users can manage their own gigs and jobs"
ON public.gigs_jobs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_gigs_jobs_updated_at
BEFORE UPDATE ON public.gigs_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();