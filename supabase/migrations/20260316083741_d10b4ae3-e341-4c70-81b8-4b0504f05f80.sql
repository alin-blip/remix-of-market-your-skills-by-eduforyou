
CREATE POLICY "Admins can view all feedback"
ON public.step_feedback FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all ai outputs"
ON public.ai_outputs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
