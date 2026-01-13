-- Create lesson notes table for personal notes per lesson
CREATE TABLE public.lesson_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for lesson notes
CREATE POLICY "Users can view their own notes" 
ON public.lesson_notes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
ON public.lesson_notes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
ON public.lesson_notes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
ON public.lesson_notes FOR DELETE 
USING (auth.uid() = user_id);

-- Create lesson quizzes table
CREATE TABLE public.lesson_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_quizzes ENABLE ROW LEVEL SECURITY;

-- Anyone can view quizzes of published courses
CREATE POLICY "Anyone can view quizzes of published courses" 
ON public.lesson_quizzes FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM course_lessons cl
  JOIN courses c ON c.id = cl.course_id
  WHERE cl.id = lesson_quizzes.lesson_id AND c.is_published = true
));

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.lesson_quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_option INTEGER NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can view questions of published courses
CREATE POLICY "Anyone can view quiz questions" 
ON public.quiz_questions FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM lesson_quizzes lq
  JOIN course_lessons cl ON cl.id = lq.lesson_id
  JOIN courses c ON c.id = cl.course_id
  WHERE lq.id = quiz_questions.quiz_id AND c.is_published = true
));

-- Create quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.lesson_quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  passed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view their own attempts
CREATE POLICY "Users can view their own quiz attempts" 
ON public.quiz_attempts FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own attempts
CREATE POLICY "Users can create their own quiz attempts" 
ON public.quiz_attempts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at on lesson_notes
CREATE TRIGGER update_lesson_notes_updated_at
BEFORE UPDATE ON public.lesson_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on lesson_quizzes
CREATE TRIGGER update_lesson_quizzes_updated_at
BEFORE UPDATE ON public.lesson_quizzes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();