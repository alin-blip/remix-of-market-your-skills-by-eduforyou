-- Create courses table for Learning Hub
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL DEFAULT 'general',
  duration_minutes INTEGER DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'beginner',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  video_url TEXT,
  is_published BOOLEAN DEFAULT false,
  lessons_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course lessons table
CREATE TABLE public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user course progress table
CREATE TABLE public.user_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id, lesson_id)
);

-- Create course purchases table
CREATE TABLE public.course_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create clients table for CRM
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  status TEXT DEFAULT 'lead',
  source TEXT,
  last_contact_at TIMESTAMP WITH TIME ZONE,
  next_followup_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create client projects table
CREATE TABLE public.client_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  value DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create follow-up reminders table
CREATE TABLE public.followup_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_reminders ENABLE ROW LEVEL SECURITY;

-- Courses are public read
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true);

-- Course lessons public read for published courses
CREATE POLICY "Anyone can view lessons of published courses" ON public.course_lessons FOR SELECT
USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_lessons.course_id AND courses.is_published = true));

-- User progress - users can manage their own
CREATE POLICY "Users can view their own progress" ON public.user_course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_course_progress FOR UPDATE USING (auth.uid() = user_id);

-- Course purchases - users manage their own
CREATE POLICY "Users can view their own purchases" ON public.course_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own purchases" ON public.course_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Clients - users manage their own clients
CREATE POLICY "Users can view their own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- Client projects - users manage projects for their own clients
CREATE POLICY "Users can view their own client projects" ON public.client_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own client projects" ON public.client_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own client projects" ON public.client_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own client projects" ON public.client_projects FOR DELETE USING (auth.uid() = user_id);

-- Follow-up reminders - users manage their own
CREATE POLICY "Users can view their own reminders" ON public.followup_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reminders" ON public.followup_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reminders" ON public.followup_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reminders" ON public.followup_reminders FOR DELETE USING (auth.uid() = user_id);

-- Insert sample courses with prices
INSERT INTO public.courses (title, description, platform, duration_minutes, level, price, is_published, lessons_count) VALUES
('Cum să obții primul client pe Fiverr', 'Ghid complet pentru a-ți crea un profil care vinde și a obține primele recenzii. Include strategii testate, exemple reale și template-uri.', 'fiverr', 120, 'beginner', 49, true, 8),
('Upwork Proposal Masterclass', 'Învață să scrii propuneri care câștigă proiecte, chiar și fără experiență. Tehnici avansate de comunicare și negociere.', 'upwork', 180, 'beginner', 79, true, 12),
('Pricing Strategy for Freelancers', 'Cum să-ți stabilești prețurile și să negociezi cu clienții. Strategii de value-based pricing.', 'general', 150, 'intermediate', 129, true, 10),
('Building a Portfolio from Scratch', 'Creează un portofoliu impresionant chiar dacă nu ai încă clienți. Proiecte spec, case studies și prezentare.', 'general', 90, 'beginner', 69, true, 6),
('Client Communication Mastery', 'Templates și tehnici pentru comunicare profesională cu clienții. De la onboarding la feedback.', 'general', 200, 'intermediate', 149, true, 15),
('Advanced Fiverr SEO & Ranking', 'Optimizează-ți gig-urile pentru a apărea în topul căutărilor. Algoritm, keywords, analytics.', 'fiverr', 120, 'advanced', 199, true, 8),
('Freelance Business Automation', 'Automatizează-ți afacerea de freelancing. CRM, invoicing, contracts, project management.', 'general', 240, 'advanced', 299, true, 18),
('Complete Freelancing Bootcamp', 'Programul complet de 30 de zile pentru a deveni freelancer. De la 0 la primii 1000€.', 'general', 600, 'beginner', 499, true, 30);