
-- Create dna_quiz_results table
CREATE TABLE public.dna_quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  lang text NOT NULL DEFAULT 'ro',
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add execution_dna column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS execution_dna text;

-- Enable RLS
ALTER TABLE public.dna_quiz_results ENABLE ROW LEVEL SECURITY;

-- Public can insert (for lead magnet - unauthenticated users)
CREATE POLICY "Anyone can insert quiz results"
  ON public.dna_quiz_results FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated users can view their own results
CREATE POLICY "Users can view their own quiz results"
  ON public.dna_quiz_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all results
CREATE POLICY "Admins can view all quiz results"
  ON public.dna_quiz_results FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
