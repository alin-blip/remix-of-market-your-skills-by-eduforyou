-- Create trigger on auth.users to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for any existing auth users that don't have one
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email)
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Backfill execution_dna from latest dna_quiz_results for users who took the quiz
UPDATE public.profiles p
SET execution_dna = q.result_type
FROM (
  SELECT DISTINCT ON (user_id) user_id, result_type
  FROM public.dna_quiz_results
  WHERE user_id IS NOT NULL
  ORDER BY user_id, created_at DESC
) q
WHERE p.id = q.user_id
  AND (p.execution_dna IS NULL OR p.execution_dna = '');