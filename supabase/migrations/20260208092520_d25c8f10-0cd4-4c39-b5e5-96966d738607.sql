
-- =============================================
-- E.D.U Method Platform - Phase 1 Database Setup
-- =============================================

-- 1. Student Applications - Main application tracking
CREATE TABLE public.student_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_phase TEXT NOT NULL DEFAULT 'evaluate' CHECK (current_phase IN ('evaluate', 'deliver', 'unlock')),
  current_step TEXT NOT NULL DEFAULT 'eligibility_check',
  assigned_consultant UUID REFERENCES public.profiles(id),
  university_choice TEXT,
  course_choice TEXT,
  application_status TEXT NOT NULL DEFAULT 'new_lead',
  documents_status TEXT DEFAULT 'not_started',
  finance_status TEXT DEFAULT 'not_started',
  eligibility_status TEXT DEFAULT 'not_started',
  course_match_status TEXT DEFAULT 'not_started',
  test_prep_status TEXT DEFAULT 'not_started',
  cv_status TEXT DEFAULT 'not_started',
  university_response TEXT,
  offer_status TEXT,
  enrollment_confirmed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Application Steps - Granular step tracking with timestamps
CREATE TABLE public.application_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.student_applications(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  step_label TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('evaluate', 'deliver', 'unlock')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Application Documents - Document management
CREATE TABLE public.application_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.student_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT,
  storage_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'reviewed', 'approved', 'rejected')),
  reviewer_notes TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Application Notes - Consultant notes per student
CREATE TABLE public.application_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.student_applications(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for student_applications
-- =============================================

-- Students can view their own application
CREATE POLICY "Students can view their own application"
  ON public.student_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Students can create their own application
CREATE POLICY "Students can create their own application"
  ON public.student_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Students can update their own application
CREATE POLICY "Students can update their own application"
  ON public.student_applications FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON public.student_applications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all applications
CREATE POLICY "Admins can update all applications"
  ON public.student_applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS Policies for application_steps
-- =============================================

-- Students can view their own steps
CREATE POLICY "Students can view their own steps"
  ON public.application_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.student_applications sa
    WHERE sa.id = application_steps.application_id AND sa.user_id = auth.uid()
  ));

-- Students can insert steps for their own application
CREATE POLICY "Students can insert their own steps"
  ON public.application_steps FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.student_applications sa
    WHERE sa.id = application_steps.application_id AND sa.user_id = auth.uid()
  ));

-- Students can update their own steps
CREATE POLICY "Students can update their own steps"
  ON public.application_steps FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.student_applications sa
    WHERE sa.id = application_steps.application_id AND sa.user_id = auth.uid()
  ));

-- Admins can manage all steps
CREATE POLICY "Admins can manage all steps"
  ON public.application_steps FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS Policies for application_documents
-- =============================================

-- Students can view their own documents
CREATE POLICY "Students can view their own documents"
  ON public.application_documents FOR SELECT
  USING (auth.uid() = user_id);

-- Students can upload their own documents
CREATE POLICY "Students can upload their own documents"
  ON public.application_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Students can update their own documents
CREATE POLICY "Students can update their own documents"
  ON public.application_documents FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can manage all documents
CREATE POLICY "Admins can manage all documents"
  ON public.application_documents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS Policies for application_notes
-- =============================================

-- Students can view non-internal notes on their application
CREATE POLICY "Students can view their application notes"
  ON public.application_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_applications sa
      WHERE sa.id = application_notes.application_id AND sa.user_id = auth.uid()
    ) AND is_internal = false
  );

-- Admins can manage all notes
CREATE POLICY "Admins can manage all notes"
  ON public.application_notes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Triggers for updated_at
-- =============================================

CREATE TRIGGER update_student_applications_updated_at
  BEFORE UPDATE ON public.student_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_application_steps_updated_at
  BEFORE UPDATE ON public.application_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Storage bucket for application documents
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('application-documents', 'application-documents', false);

-- Storage policies for application documents
CREATE POLICY "Students can upload their application documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'application-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can view their application documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'application-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all application documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'application-documents' AND public.has_role(auth.uid(), 'admin'));

-- Enable realtime for student_applications for status tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_applications;
