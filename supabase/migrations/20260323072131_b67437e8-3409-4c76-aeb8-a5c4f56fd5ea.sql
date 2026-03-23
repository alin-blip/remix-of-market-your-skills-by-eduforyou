
-- 1. course_purchases: Remove permissive INSERT, only service_role can insert
DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.course_purchases;
CREATE POLICY "Only service role can insert purchases" ON public.course_purchases
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 2. bundle_purchases: Remove permissive INSERT, only service_role can insert
DROP POLICY IF EXISTS "Users can insert their own bundle purchases" ON public.bundle_purchases;
CREATE POLICY "Only service role can insert bundle purchases" ON public.bundle_purchases
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 3. subscriptions: Remove permissive INSERT, only service_role can insert
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
CREATE POLICY "Only service role can insert subscriptions" ON public.subscriptions
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 4. quiz_questions: Replace public SELECT with authenticated-only SELECT
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.quiz_questions;
CREATE POLICY "Authenticated users can view quiz questions" ON public.quiz_questions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lesson_quizzes lq
    JOIN course_lessons cl ON cl.id = lq.lesson_id
    JOIN courses c ON c.id = cl.course_id
    WHERE lq.id = quiz_questions.quiz_id AND c.is_published = true
  ));

-- 5. course_lessons: Replace public SELECT with authenticated-only SELECT
DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON public.course_lessons;
CREATE POLICY "Authenticated users can view lessons" ON public.course_lessons
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_lessons.course_id AND courses.is_published = true
  ));

-- 6. outreach_templates: Add WITH CHECK to ALL policy
DROP POLICY IF EXISTS "Users can manage their own outreach templates" ON public.outreach_templates;
CREATE POLICY "Users can manage their own outreach templates" ON public.outreach_templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Fix DB functions: Add SET search_path = public
CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
AS $$ SELECT pgmq.delete(queue_name, message_id); $$;

CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
  RETURNS bigint
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
AS $$ SELECT pgmq.send(queue_name, payload); $$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
  RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
AS $$ SELECT msg_id, read_ct, message FROM pgmq.read(queue_name, vt, batch_size); $$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
  RETURNS bigint
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
END;
$$;
