-- Add swipehire_user_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS swipehire_user_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_swipehire_user_id 
ON public.profiles(swipehire_user_id) 
WHERE swipehire_user_id IS NOT NULL;