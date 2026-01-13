-- Add category column to courses table
ALTER TABLE public.courses 
ADD COLUMN category TEXT DEFAULT 'general';

-- Update existing courses based on their characteristics
-- External courses with certificates -> certification
UPDATE public.courses 
SET category = 'certification' 
WHERE course_type = 'external' AND certificate IN ('Yes', 'Badges');

-- External courses without certificates -> partner
UPDATE public.courses 
SET category = 'partner' 
WHERE course_type = 'external' AND (certificate IS NULL OR certificate = 'No');

-- Internal courses -> skills (default, can be changed in admin)
UPDATE public.courses 
SET category = 'skills' 
WHERE course_type = 'internal' OR course_type IS NULL;