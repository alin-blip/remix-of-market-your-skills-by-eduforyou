-- Create badge definitions table
CREATE TABLE public.badge_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  color TEXT NOT NULL DEFAULT 'gold',
  category TEXT NOT NULL DEFAULT 'achievement',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  points_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;

-- Anyone can view badge definitions
CREATE POLICY "Anyone can view badge definitions" 
ON public.badge_definitions FOR SELECT 
USING (true);

-- Create user badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Users can view their own badges
CREATE POLICY "Users can view their own badges" 
ON public.user_badges FOR SELECT 
USING (auth.uid() = user_id);

-- Users can earn badges (insert only)
CREATE POLICY "Users can earn badges" 
ON public.user_badges FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create user points table
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  courses_completed INTEGER NOT NULL DEFAULT 0,
  quizzes_passed INTEGER NOT NULL DEFAULT 0,
  perfect_quizzes INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- Users can view their own points
CREATE POLICY "Users can view their own points" 
ON public.user_points FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own points
CREATE POLICY "Users can update their own points" 
ON public.user_points FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can insert their own points record
CREATE POLICY "Users can insert their own points" 
ON public.user_points FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Insert default badge definitions
INSERT INTO public.badge_definitions (name, description, icon, color, category, requirement_type, requirement_value, points_reward) VALUES
('Prima Lecție', 'Ai completat prima ta lecție', 'book-open', 'blue', 'learning', 'lessons_completed', 1, 10),
('Student Dedicat', 'Ai completat 10 lecții', 'graduation-cap', 'purple', 'learning', 'lessons_completed', 10, 50),
('Maestru Lecțiilor', 'Ai completat 50 de lecții', 'crown', 'gold', 'learning', 'lessons_completed', 50, 200),
('Primul Curs', 'Ai finalizat primul tău curs', 'trophy', 'bronze', 'courses', 'courses_completed', 1, 100),
('Colecționar de Cursuri', 'Ai finalizat 5 cursuri', 'medal', 'silver', 'courses', 'courses_completed', 5, 300),
('Expert Certificat', 'Ai finalizat 10 cursuri', 'award', 'gold', 'courses', 'courses_completed', 10, 500),
('Primul Quiz', 'Ai trecut primul quiz', 'check-circle', 'green', 'quizzes', 'quizzes_passed', 1, 25),
('Quiz Master', 'Ai trecut 10 quiz-uri', 'zap', 'yellow', 'quizzes', 'quizzes_passed', 10, 150),
('Perfecționist', 'Ai obținut scor perfect la un quiz', 'star', 'gold', 'quizzes', 'perfect_quizzes', 1, 50),
('Serie de 7 Zile', 'Ai fost activ 7 zile la rând', 'flame', 'orange', 'streaks', 'current_streak', 7, 100),
('Serie de 30 Zile', 'Ai fost activ 30 de zile la rând', 'rocket', 'red', 'streaks', 'current_streak', 30, 500);

-- Add admin policies for quiz management
CREATE POLICY "Admins can manage quizzes" 
ON public.lesson_quizzes FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage quiz questions" 
ON public.quiz_questions FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));