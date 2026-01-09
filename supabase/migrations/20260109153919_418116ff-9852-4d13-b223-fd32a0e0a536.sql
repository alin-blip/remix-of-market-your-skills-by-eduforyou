-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a security definer function to check if user is admin
-- This avoids recursion because it bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
$$;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id OR public.is_admin());