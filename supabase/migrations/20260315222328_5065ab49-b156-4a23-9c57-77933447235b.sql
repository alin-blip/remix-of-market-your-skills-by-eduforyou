-- Dream 100 Targets table
CREATE TABLE public.dream100_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  linkedin_url text,
  website_url text,
  industry text,
  decision_maker_role text,
  path_type text NOT NULL DEFAULT 'freelancer',
  kanban_stage text NOT NULL DEFAULT 'identified',
  ai_analysis jsonb,
  reminder_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.dream100_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own dream100 targets"
  ON public.dream100_targets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Dream 100 Tasks table
CREATE TABLE public.dream100_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id uuid NOT NULL REFERENCES public.dream100_targets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.dream100_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own dream100 tasks"
  ON public.dream100_tasks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Outreach Sequences table
CREATE TABLE public.outreach_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id uuid REFERENCES public.dream100_targets(id) ON DELETE SET NULL,
  path_type text NOT NULL DEFAULT 'freelancer',
  platform text NOT NULL DEFAULT 'linkedin',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.outreach_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own outreach sequences"
  ON public.outreach_sequences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CV Documents table
CREATE TABLE public.cv_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id uuid REFERENCES public.dream100_targets(id) ON DELETE SET NULL,
  document_type text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.cv_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cv documents"
  ON public.cv_documents FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Updated_at triggers
CREATE TRIGGER update_dream100_targets_updated_at
  BEFORE UPDATE ON public.dream100_targets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_outreach_sequences_updated_at
  BEFORE UPDATE ON public.outreach_sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cv_documents_updated_at
  BEFORE UPDATE ON public.cv_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();