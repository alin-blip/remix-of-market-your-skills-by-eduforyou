
CREATE TABLE public.waitlist_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  domain text,
  freelance_experience text,
  objective text,
  country text,
  how_heard text,
  is_eduforyou_member boolean DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a waitlist application
CREATE POLICY "Anyone can submit waitlist application"
  ON public.waitlist_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can view all waitlist applications
CREATE POLICY "Admins can view waitlist applications"
  ON public.waitlist_applications
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update waitlist applications
CREATE POLICY "Admins can update waitlist applications"
  ON public.waitlist_applications
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow public to check if their email is approved (for registration check)
CREATE POLICY "Anyone can check own email status"
  ON public.waitlist_applications
  FOR SELECT
  TO public
  USING (true);
