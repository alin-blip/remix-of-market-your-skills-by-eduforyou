
CREATE OR REPLACE FUNCTION public.auto_approve_waitlist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.status := 'approved';
  NEW.reviewed_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER waitlist_auto_approve
  BEFORE INSERT ON public.waitlist_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_waitlist();
