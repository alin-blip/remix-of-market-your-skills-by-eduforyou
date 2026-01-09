-- Drop the existing constraint that only allows 'hard', 'soft', 'natural'
ALTER TABLE public.skill_entries DROP CONSTRAINT IF EXISTS skill_entries_category_check;

-- Backfill any existing rows with old category values
UPDATE public.skill_entries 
SET category = CASE
  WHEN category = 'hard' THEN 'technical'
  WHEN category = 'natural' THEN 'hidden'
  ELSE category
END
WHERE category IN ('hard', 'natural');

-- Add new constraint with the values used by the AI/UI
ALTER TABLE public.skill_entries 
ADD CONSTRAINT skill_entries_category_check 
CHECK (category IN ('technical', 'soft', 'hidden'));