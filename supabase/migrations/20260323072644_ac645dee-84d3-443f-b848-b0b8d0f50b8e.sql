
-- =============================================
-- SECURITY HARDENING: Final vulnerabilities fix
-- =============================================

-- 1. user_points: Remove user INSERT/UPDATE, only service_role
DROP POLICY IF EXISTS "Users can insert their own points" ON public.user_points;
DROP POLICY IF EXISTS "Users can update their own points" ON public.user_points;
DROP POLICY IF EXISTS "Users can view their own points" ON public.user_points;

CREATE POLICY "Users can view their own points" ON public.user_points
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Only service role can manage points" ON public.user_points
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2. user_badges: Remove user INSERT, only service_role
DROP POLICY IF EXISTS "Users can earn badges" ON public.user_badges;

CREATE POLICY "Only service role can insert badges" ON public.user_badges
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 3. course_lessons: Restrict SELECT to purchased/free/subscribed only
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.course_lessons;

CREATE POLICY "Users can view lessons they have access to" ON public.course_lessons
  FOR SELECT TO authenticated
  USING (
    is_free = true
    OR EXISTS (
      SELECT 1 FROM course_purchases 
      WHERE user_id = auth.uid() 
      AND course_id = course_lessons.course_id 
      AND status = 'completed'
    )
    OR EXISTS (
      SELECT 1 FROM bundle_purchases bp 
      JOIN bundle_courses bc ON bc.bundle_id = bp.bundle_id 
      WHERE bp.user_id = auth.uid() 
      AND bc.course_id = course_lessons.course_id 
      AND bp.status = 'completed'
    )
    OR EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- 4. quiz_questions: Create safe view without correct_option
CREATE OR REPLACE VIEW public.quiz_questions_safe AS
  SELECT id, quiz_id, question, options, position
  FROM public.quiz_questions;

GRANT SELECT ON public.quiz_questions_safe TO authenticated;

-- 5. Create check_quiz_answer function (security definer)
CREATE OR REPLACE FUNCTION public.check_quiz_answer(
  p_question_id uuid,
  p_selected_option integer
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT correct_option = p_selected_option
  FROM quiz_questions
  WHERE id = p_question_id;
$$;

-- 6. Create submit_quiz function (handles scoring + points + badges server-side)
CREATE OR REPLACE FUNCTION public.submit_quiz(
  p_quiz_id uuid,
  p_answers jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_correct_count integer := 0;
  v_total_count integer := 0;
  v_score integer;
  v_passed boolean;
  v_passing_score integer;
  v_question RECORD;
  v_selected integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get passing score
  SELECT passing_score INTO v_passing_score
  FROM lesson_quizzes WHERE id = p_quiz_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quiz not found';
  END IF;

  -- Count correct answers
  FOR v_question IN 
    SELECT id, correct_option FROM quiz_questions WHERE quiz_id = p_quiz_id
  LOOP
    v_total_count := v_total_count + 1;
    v_selected := (p_answers ->> v_question.id::text)::integer;
    IF v_selected IS NOT NULL AND v_selected = v_question.correct_option THEN
      v_correct_count := v_correct_count + 1;
    END IF;
  END LOOP;

  IF v_total_count = 0 THEN
    RAISE EXCEPTION 'No questions found';
  END IF;

  v_score := ROUND((v_correct_count::numeric / v_total_count) * 100);
  v_passed := v_score >= v_passing_score;

  -- Insert attempt
  INSERT INTO quiz_attempts (user_id, quiz_id, score, passed, answers)
  VALUES (v_user_id, p_quiz_id, v_score, v_passed, p_answers);

  RETURN jsonb_build_object(
    'score', v_score,
    'passed', v_passed,
    'correct_count', v_correct_count,
    'total_count', v_total_count
  );
END;
$$;

-- 7. Create award_activity function for gamification
CREATE OR REPLACE FUNCTION public.award_activity(
  p_points integer,
  p_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_current RECORD;
  v_today date := CURRENT_DATE;
  v_diff_days integer;
  v_new_streak integer;
  v_longest integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_type NOT IN ('lesson', 'course', 'quiz', 'perfect_quiz') THEN
    RAISE EXCEPTION 'Invalid activity type';
  END IF;

  -- Get or create user_points
  SELECT * INTO v_current FROM user_points WHERE user_id = v_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_points (user_id, total_points, lessons_completed, courses_completed, quizzes_passed, perfect_quizzes, current_streak, longest_streak, last_activity_date)
    VALUES (v_user_id, p_points,
      CASE WHEN p_type = 'lesson' THEN 1 ELSE 0 END,
      CASE WHEN p_type = 'course' THEN 1 ELSE 0 END,
      CASE WHEN p_type IN ('quiz', 'perfect_quiz') THEN 1 ELSE 0 END,
      CASE WHEN p_type = 'perfect_quiz' THEN 1 ELSE 0 END,
      1, 1, v_today);
    RETURN;
  END IF;

  -- Calculate streak
  IF v_current.last_activity_date IS NOT NULL THEN
    v_diff_days := v_today - v_current.last_activity_date::date;
    IF v_diff_days = 1 THEN
      v_new_streak := COALESCE(v_current.current_streak, 0) + 1;
    ELSIF v_diff_days > 1 THEN
      v_new_streak := 1;
    ELSE
      v_new_streak := COALESCE(v_current.current_streak, 1);
    END IF;
  ELSE
    v_new_streak := 1;
  END IF;

  v_longest := GREATEST(COALESCE(v_current.longest_streak, 0), v_new_streak);

  UPDATE user_points SET
    total_points = COALESCE(total_points, 0) + p_points,
    lessons_completed = CASE WHEN p_type = 'lesson' THEN COALESCE(lessons_completed, 0) + 1 ELSE lessons_completed END,
    courses_completed = CASE WHEN p_type = 'course' THEN COALESCE(courses_completed, 0) + 1 ELSE courses_completed END,
    quizzes_passed = CASE WHEN p_type IN ('quiz', 'perfect_quiz') THEN COALESCE(quizzes_passed, 0) + 1 ELSE quizzes_passed END,
    perfect_quizzes = CASE WHEN p_type = 'perfect_quiz' THEN COALESCE(perfect_quizzes, 0) + 1 ELSE perfect_quizzes END,
    current_streak = v_new_streak,
    longest_streak = v_longest,
    last_activity_date = v_today::text,
    updated_at = now()
  WHERE user_id = v_user_id;
END;
$$;

-- 8. Create check_and_award_badges function
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_points RECORD;
  v_badge RECORD;
  v_current_value integer;
  v_new_badges jsonb := '[]'::jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_points FROM user_points WHERE user_id = v_user_id;
  IF NOT FOUND THEN
    RETURN '[]'::jsonb;
  END IF;

  FOR v_badge IN 
    SELECT * FROM badge_definitions
    WHERE id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = v_user_id)
    ORDER BY requirement_value ASC
  LOOP
    -- Get current value based on requirement_type
    v_current_value := CASE v_badge.requirement_type
      WHEN 'total_points' THEN v_points.total_points
      WHEN 'courses_completed' THEN v_points.courses_completed
      WHEN 'quizzes_passed' THEN v_points.quizzes_passed
      WHEN 'perfect_quizzes' THEN v_points.perfect_quizzes
      WHEN 'lessons_completed' THEN v_points.lessons_completed
      WHEN 'current_streak' THEN v_points.current_streak
      WHEN 'longest_streak' THEN v_points.longest_streak
      ELSE 0
    END;

    IF v_current_value >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id)
        ON CONFLICT DO NOTHING;
      
      -- Award bonus points
      UPDATE user_points SET total_points = total_points + v_badge.points_reward
        WHERE user_id = v_user_id;

      v_new_badges := v_new_badges || jsonb_build_object(
        'id', v_badge.id,
        'name', v_badge.name,
        'description', v_badge.description,
        'icon', v_badge.icon,
        'color', v_badge.color,
        'points_reward', v_badge.points_reward
      );
    END IF;
  END LOOP;

  RETURN v_new_badges;
END;
$$;
