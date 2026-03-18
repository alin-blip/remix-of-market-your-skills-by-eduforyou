-- Add fields to waitlist
ALTER TABLE waitlist_applications 
  ADD COLUMN study_field text,
  ADD COLUMN date_of_birth date,
  ADD COLUMN preferred_locale text DEFAULT 'ro';

-- RPC to auto-populate profile from waitlist data
CREATE OR REPLACE FUNCTION public.populate_profile_from_waitlist(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  w RECORD;
BEGIN
  SELECT full_name, study_field, date_of_birth, preferred_locale
  INTO w
  FROM waitlist_applications
  WHERE LOWER(email) = LOWER(user_email) AND status = 'approved'
  LIMIT 1;

  IF FOUND THEN
    UPDATE profiles
    SET full_name = w.full_name,
        study_field = w.study_field,
        date_of_birth = w.date_of_birth,
        locale = COALESCE(w.preferred_locale, 'ro'),
        onboarding_completed = true
    WHERE email = LOWER(user_email);
  END IF;
END;
$$;