
-- Fix security definer view: make it INVOKER instead
DROP VIEW IF EXISTS public.quiz_questions_safe;
CREATE VIEW public.quiz_questions_safe WITH (security_invoker = true) AS
  SELECT id, quiz_id, question, options, position
  FROM public.quiz_questions;

GRANT SELECT ON public.quiz_questions_safe TO authenticated;
