-- 1. Drop the permissive SELECT policy that exposes all data
DROP POLICY IF EXISTS "Anyone can check own email status" ON public.waitlist_applications;

-- 2. Create a security definer RPC to check waitlist status by email
CREATE OR REPLACE FUNCTION public.check_waitlist_status(check_email text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status FROM public.waitlist_applications
  WHERE LOWER(email) = LOWER(check_email)
  LIMIT 1;
$$;