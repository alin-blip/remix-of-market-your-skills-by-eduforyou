-- Add admin policies for courses table
CREATE POLICY "Admins can manage courses" ON public.courses
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for course_lessons table  
CREATE POLICY "Admins can manage lessons" ON public.course_lessons
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for learning_paths table
CREATE POLICY "Admins can manage learning paths" ON public.learning_paths
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for learning_path_courses table
CREATE POLICY "Admins can manage learning path courses" ON public.learning_path_courses
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));