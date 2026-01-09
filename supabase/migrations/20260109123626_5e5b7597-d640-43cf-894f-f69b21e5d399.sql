-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('student', 'admin', 'mentor');

-- Create enum for verification status
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  study_field TEXT,
  date_of_birth DATE,
  goals JSONB DEFAULT '[]'::jsonb,
  values JSONB DEFAULT '[]'::jsonb,
  interests JSONB DEFAULT '[]'::jsonb,
  projects_experience TEXT,
  freedom_score INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  locale TEXT DEFAULT 'ro',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create skill_entries table
CREATE TABLE public.skill_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hard', 'soft', 'natural')),
  description TEXT,
  confidence INTEGER DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  evidence_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ikigai_results table
CREATE TABLE public.ikigai_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  what_you_love JSONB DEFAULT '[]'::jsonb,
  what_youre_good_at JSONB DEFAULT '[]'::jsonb,
  what_world_needs JSONB DEFAULT '[]'::jsonb,
  what_you_can_be_paid_for JSONB DEFAULT '[]'::jsonb,
  ikigai_statements JSONB DEFAULT '[]'::jsonb,
  service_angles JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create offers table
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  smv TEXT,
  target_market TEXT,
  starter_package JSONB DEFAULT '{}'::jsonb,
  standard_package JSONB DEFAULT '{}'::jsonb,
  premium_package JSONB DEFAULT '{}'::jsonb,
  pricing_justification TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create outreach_templates table
CREATE TABLE public.outreach_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'email', 'instagram', 'twitter', 'other')),
  template_type TEXT NOT NULL CHECK (template_type IN ('cold', 'warm', 'follow_up')),
  subject TEXT,
  content TEXT NOT NULL,
  sequence_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create verifications table
CREATE TABLE public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_url TEXT,
  document_type TEXT,
  status verification_status DEFAULT 'pending',
  admin_id UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ai_outputs table (for logging AI generations)
CREATE TABLE public.ai_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tool TEXT NOT NULL,
  prompt_version TEXT DEFAULT 'v1',
  input_json JSONB,
  output_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ikigai_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_outputs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Skill entries policies
CREATE POLICY "Users can manage their own skill entries"
  ON public.skill_entries FOR ALL
  USING (auth.uid() = user_id);

-- Ikigai results policies
CREATE POLICY "Users can manage their own ikigai results"
  ON public.ikigai_results FOR ALL
  USING (auth.uid() = user_id);

-- Offers policies
CREATE POLICY "Users can manage their own offers"
  ON public.offers FOR ALL
  USING (auth.uid() = user_id);

-- Outreach templates policies
CREATE POLICY "Users can manage their own outreach templates"
  ON public.outreach_templates FOR ALL
  USING (auth.uid() = user_id);

-- Verifications policies
CREATE POLICY "Users can view their own verifications"
  ON public.verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verifications"
  ON public.verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications"
  ON public.verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all verifications"
  ON public.verifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- AI outputs policies (users can see their own, admins can see all)
CREATE POLICY "Users can view their own AI outputs"
  ON public.ai_outputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI outputs"
  ON public.ai_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ikigai_results_updated_at
  BEFORE UPDATE ON public.ikigai_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_skill_entries_user_id ON public.skill_entries(user_id);
CREATE INDEX idx_ikigai_results_user_id ON public.ikigai_results(user_id);
CREATE INDEX idx_offers_user_id ON public.offers(user_id);
CREATE INDEX idx_outreach_templates_user_id ON public.outreach_templates(user_id);
CREATE INDEX idx_verifications_user_id ON public.verifications(user_id);
CREATE INDEX idx_verifications_status ON public.verifications(status);
CREATE INDEX idx_ai_outputs_user_id ON public.ai_outputs(user_id);