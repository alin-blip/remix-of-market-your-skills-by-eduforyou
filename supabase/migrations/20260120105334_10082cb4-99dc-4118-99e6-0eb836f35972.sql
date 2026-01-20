-- Create funnels table to manage complete sales funnels
CREATE TABLE public.funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  free_product_id UUID,
  basic_product_id UUID,
  premium_product_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on funnels
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;

-- Anyone can view active funnels
CREATE POLICY "Anyone can view active funnels" ON public.funnels
  FOR SELECT USING (is_active = true);

-- Admins can manage funnels
CREATE POLICY "Admins can manage funnels" ON public.funnels
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create leads table for email capture from squeeze pages
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  funnel_id UUID REFERENCES public.funnels(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  source TEXT,
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert leads (for squeeze page capture)
CREATE POLICY "Anyone can submit leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Admins can view all leads
CREATE POLICY "Admins can view leads" ON public.leads
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage leads
CREATE POLICY "Admins can manage leads" ON public.leads
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Extend courses table with product_type and funnel support
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'course';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS download_url TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS funnel_id UUID REFERENCES public.funnels(id) ON DELETE SET NULL;

-- Add foreign key constraints to funnels after courses is updated
ALTER TABLE public.funnels 
  ADD CONSTRAINT funnels_free_product_fkey FOREIGN KEY (free_product_id) REFERENCES public.courses(id) ON DELETE SET NULL,
  ADD CONSTRAINT funnels_basic_product_fkey FOREIGN KEY (basic_product_id) REFERENCES public.courses(id) ON DELETE SET NULL,
  ADD CONSTRAINT funnels_premium_product_fkey FOREIGN KEY (premium_product_id) REFERENCES public.courses(id) ON DELETE SET NULL;

-- Create trigger for funnels updated_at
CREATE TRIGGER update_funnels_updated_at
  BEFORE UPDATE ON public.funnels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();