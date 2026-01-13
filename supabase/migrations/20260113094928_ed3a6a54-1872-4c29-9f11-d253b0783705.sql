-- Extend courses table for external courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate TEXT DEFAULT 'No';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'EN';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS recommended_for TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_type TEXT DEFAULT 'internal';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS requires_pro BOOLEAN DEFAULT false;

-- Create learning_paths table
CREATE TABLE public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT DEFAULT 'book',
  color TEXT DEFAULT 'blue',
  position INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

-- Anyone can view published learning paths
CREATE POLICY "Anyone can view published learning paths"
ON public.learning_paths FOR SELECT
USING (is_published = true);

-- Create learning_path_courses junction table
CREATE TABLE public.learning_path_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(path_id, course_id)
);

-- Enable RLS
ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;

-- Anyone can view learning path courses
CREATE POLICY "Anyone can view learning path courses"
ON public.learning_path_courses FOR SELECT
USING (true);

-- Insert the 20 external courses from CSV
INSERT INTO public.courses (title, description, provider, external_url, level, duration_minutes, certificate, language, tags, recommended_for, prerequisites, course_type, requires_pro, is_published, price) VALUES
('Fundamentals of Digital Marketing', 'Curs complet de marketing digital: SEO, SEM, analytics, social media. Include examen final și certificat gratuit.', 'Google', 'https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing', 'beginner', 2400, 'Yes', 'EN', '["marketing", "digital", "seo", "ads"]', 'business', NULL, 'external', true, true, 0),
('Google Analytics Academy', 'Cursuri Google Analytics (Google Analytics for Beginners, Advanced Analytics) cu laboratoare și examene practice.', 'Google', 'https://analytics.google.com/analytics/academy/', 'beginner', 900, 'Yes', 'EN', '["analytics", "data", "marketing"]', 'business', NULL, 'external', true, true, 0),
('Machine Learning Crash Course', 'Tutorial practic Google cu notebook-uri TensorFlow, exerciții și concepte fundamentale ML.', 'Google', 'https://developers.google.com/machine-learning/crash-course', 'intermediate', 900, 'No', 'EN', '["ml", "python", "tensorflow"]', 'computing', 'Python basics', 'external', true, true, 0),
('Cloud Skills Boost (Qwiklabs)', 'Laburi practice pentru Google Cloud: compute, storage, networking, ML; gamified quests.', 'Google', 'https://www.cloudskillsboost.google/', 'beginner', 600, 'Badges', 'EN', '["cloud", "google-cloud", "ml"]', 'computing', NULL, 'external', true, true, 0),
('OpenAI API Quickstart', 'Ghiduri oficiale și tutoriale pentru folosirea API-ului OpenAI: chat complet, embeddings, fine-tuning.', 'OpenAI', 'https://platform.openai.com/docs/quickstart', 'beginner', 240, 'No', 'EN', '["ai", "openai", "api"]', 'computing', NULL, 'external', true, true, 0),
('AI Fundamentals (AI-900)', 'Module gratuite Microsoft Learn pentru conceptele de bază AI și scenarii de business; potrivit pentru începători.', 'Microsoft', 'https://learn.microsoft.com/en-us/training/paths/azure-ai-fundamentals/', 'beginner', 600, 'Yes', 'EN', '["ai", "azure", "cloud"]', 'computing', NULL, 'external', true, true, 0),
('AWS Free Digital Training', 'Catalog AWS cu cursuri gratuite: cloud fundamentals, security, architecture and ML.', 'AWS', 'https://aws.training/', 'beginner', 600, 'No', 'EN', '["cloud", "aws", "devops"]', 'computing', NULL, 'external', true, true, 0),
('Machine Learning (Andrew Ng)', 'Cursul clasic ML; audit gratuit pentru conținut, există opțiune certificat plătit.', 'Coursera', 'https://www.coursera.org/learn/machine-learning', 'intermediate', 3000, 'Optional', 'EN', '["ml", "ml-theory", "python"]', 'computing', 'Math basics', 'external', true, true, 0),
('AI For Everyone', 'Introducere non-tehnică în AI: concepte, impact, construire strategie AI.', 'DeepLearning.AI', 'https://www.deeplearning.ai/courses/ai-for-everyone/', 'beginner', 360, 'Optional', 'EN', '["ai", "strategy"]', 'business', NULL, 'external', true, true, 0),
('Practical Deep Learning for Coders', 'Curs practic intensiv pentru deep learning, orientat pe proiecte reale.', 'fast.ai', 'https://www.fast.ai/', 'advanced', 4800, 'No', 'EN', '["deeplearning", "python", "pytorch"]', 'computing', 'Python basics', 'external', true, true, 0),
('CS50: Introduction to Computer Science', 'Curs intro HPC/CS cu proiecte practice în C, Python, web; audit gratuit pe edX/CS50 site.', 'Harvard', 'https://cs50.harvard.edu/', 'beginner', 6000, 'Optional', 'EN', '["cs", "programming", "algorithms"]', 'computing', NULL, 'external', true, true, 0),
('freeCodeCamp Curriculum', 'Curriculum gratuit pentru web development: HTML/CSS, JavaScript, APIs, projects.', 'freeCodeCamp', 'https://www.freecodecamp.org/', 'beginner', 12000, 'Yes', 'EN', '["webdev", "javascript", "html", "css"]', 'computing', NULL, 'external', true, true, 0),
('GitHub Learning Lab', 'Module practice Git & GitHub: workflows, actions, repos — hands-on.', 'GitHub', 'https://lab.github.com/', 'beginner', 600, 'No', 'EN', '["git", "github", "devops"]', 'computing', NULL, 'external', true, true, 0),
('Complete Beginner Path', 'Path introductiv pentru cybersecurity cu laboratoare practice (CTF style).', 'TryHackMe', 'https://tryhackme.com/path/complete-beginner', 'beginner', 1800, 'No', 'EN', '["cybersecurity", "ctf", "linux"]', 'cybersecurity', NULL, 'external', true, true, 0),
('Free Labs & Starting Points', 'Platformă hands-on pentru pentesting și SOC; are nivel free-to-try.', 'Hack The Box', 'https://www.hackthebox.com/', 'beginner', 600, 'No', 'EN', '["pentesting", "cybersecurity"]', 'cybersecurity', NULL, 'external', true, true, 0),
('HubSpot Academy - Inbound Marketing', 'Cursuri practice de inbound marketing, content, email, CRM; certificate gratuite.', 'HubSpot', 'https://academy.hubspot.com/', 'beginner', 720, 'Yes', 'EN', '["marketing", "crm", "content"]', 'business', NULL, 'external', true, true, 0),
('Skillshop (Google Ads & Tools)', 'Cursuri Google Skillshop: Google Ads, Analytics, Shopping, YouTube; certificate gratuite.', 'Google', 'https://skillshop.withgoogle.com/', 'beginner', 600, 'Yes', 'EN', '["ads", "google", "marketing"]', 'business', NULL, 'external', true, true, 0),
('TensorFlow Tutorials', 'Tutoriale practice pentru dezvoltarea de modele ML cu TensorFlow (hands-on).', 'TensorFlow', 'https://www.tensorflow.org/tutorials', 'intermediate', 600, 'No', 'EN', '["tensorflow", "ml", "python"]', 'computing', 'Python basics', 'external', true, true, 0),
('Codecademy Free Courses', 'Cursuri gratuite (paths limitate) pentru Python, JS, web dev — hands-on.', 'Codecademy', 'https://www.codecademy.com/learn', 'beginner', 2400, 'Optional', 'EN', '["python", "javascript", "webdev"]', 'computing', NULL, 'external', true, true, 0),
('MDN Web Docs - Learning Area', 'Resurse și tutoriale gratuite pentru web development (reference & guides).', 'MDN', 'https://developer.mozilla.org/', 'beginner', 600, 'No', 'EN', '["webdev", "html", "css", "javascript"]', 'computing', NULL, 'external', true, true, 0);

-- Insert Learning Paths
INSERT INTO public.learning_paths (title, description, category, icon, color, position) VALUES
('Cybersecurity Starter', 'Începe cariera în securitate cibernetică cu laboratoare practice și CTF-uri.', 'cybersecurity', 'shield', 'red', 1),
('Computing & AI Path', 'Fundamentele programării și inteligenței artificiale de la universitățile de top.', 'computing', 'cpu', 'blue', 2),
('Marketing & Business', 'Stăpânește marketing-ul digital și instrumentele de business de la Google și HubSpot.', 'business', 'trending-up', 'green', 3),
('Web Development', 'Învață dezvoltare web full-stack de la zero la hero.', 'computing', 'code', 'purple', 4);

-- Link courses to learning paths
-- Cybersecurity Path
INSERT INTO public.learning_path_courses (path_id, course_id, position)
SELECT lp.id, c.id, 1
FROM public.learning_paths lp, public.courses c
WHERE lp.category = 'cybersecurity' AND c.provider = 'TryHackMe';

INSERT INTO public.learning_path_courses (path_id, course_id, position)
SELECT lp.id, c.id, 2
FROM public.learning_paths lp, public.courses c
WHERE lp.category = 'cybersecurity' AND c.provider = 'Hack The Box';

-- Computing & AI Path
INSERT INTO public.learning_path_courses (path_id, course_id, position)
SELECT lp.id, c.id, 1
FROM public.learning_paths lp, public.courses c
WHERE lp.title = 'Computing & AI Path' AND c.provider = 'Harvard';

INSERT INTO public.learning_path_courses (path_id, course_id, position)
SELECT lp.id, c.id, 2
FROM public.learning_paths lp, public.courses c
WHERE lp.title = 'Computing & AI Path' AND c.title LIKE '%Machine Learning Crash%';

INSERT INTO public.learning_path_courses (path_id, course_id, position)
SELECT lp.id, c.id, 3
FROM public.learning_paths lp, public.courses c
WHERE lp.title = 'Computing & AI Path' AND c.provider = 'Microsoft';

-- Marketing Path
INSERT INTO public.learning_path_courses (path_id, course_id, position)
SELECT lp.id, c.id, 1
FROM public.learning_paths lp, public.courses c
WHERE lp.title = 'Marketing & Business' AND c.title LIKE '%Digital Marketing%';

INSERT INTO public.learning_path_courses (path_id, course_id, position)
SELECT lp.id, c.id, 2
FROM public.learning_paths lp, public.courses c
WHERE lp.title = 'Marketing & Business' AND c.provider = 'HubSpot';

INSERT INTO public.learning_path_courses (path_id, course_id, position)
SELECT lp.id, c.id, 3
FROM public.learning_paths lp, public.courses c
WHERE lp.title = 'Marketing & Business' AND c.title LIKE '%Analytics Academy%';

-- Web Development Path
INSERT INTO public.learning_path_courses (path_id, course_id, position)
SELECT lp.id, c.id, 1
FROM public.learning_paths lp, public.courses c
WHERE lp.title = 'Web Development' AND c.provider = 'freeCodeCamp';

INSERT INTO public.learning_path_courses (path_id, course_id, position)
SELECT lp.id, c.id, 2
FROM public.learning_paths lp, public.courses c
WHERE lp.title = 'Web Development' AND c.provider = 'MDN';

INSERT INTO public.learning_path_courses (path_id, course_id, position)
SELECT lp.id, c.id, 3
FROM public.learning_paths lp, public.courses c
WHERE lp.title = 'Web Development' AND c.provider = 'GitHub';