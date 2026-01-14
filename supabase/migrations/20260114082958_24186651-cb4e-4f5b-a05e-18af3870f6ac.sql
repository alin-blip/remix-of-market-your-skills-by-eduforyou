-- Create storage bucket for course videos (private, only accessible via signed URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('course-videos', 'course-videos', false, 524288000)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for course-videos bucket
CREATE POLICY "Admins can upload course videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-videos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update course videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-videos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete course videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-videos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users with course access can view videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-videos'
  AND (
    -- Admins can view all
    has_role(auth.uid(), 'admin'::app_role)
    -- Or user purchased the course (video path contains course_id)
    OR EXISTS (
      SELECT 1 FROM course_purchases cp
      WHERE cp.user_id = auth.uid()
      AND cp.status = 'completed'
      AND storage.objects.name LIKE cp.course_id::text || '/%'
    )
    -- Or user has founder subscription
    OR EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid()
      AND s.plan = 'founder'
      AND s.status = 'active'
    )
  )
);

-- Extend courses table for PLR courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS sales_page_content JSONB DEFAULT '{}';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS bundle_id UUID;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index for course slugs
CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_unique ON courses(slug) WHERE slug IS NOT NULL;

-- Create course_bundles table
CREATE TABLE IF NOT EXISTS course_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  original_price NUMERIC NOT NULL,
  bundle_price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GBP',
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on course_bundles
ALTER TABLE course_bundles ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_bundles
CREATE POLICY "Anyone can view published bundles"
ON course_bundles FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage bundles"
ON course_bundles FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create bundle_courses junction table
CREATE TABLE IF NOT EXISTS bundle_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES course_bundles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bundle_id, course_id)
);

-- Enable RLS on bundle_courses
ALTER TABLE bundle_courses ENABLE ROW LEVEL SECURITY;

-- RLS policies for bundle_courses
CREATE POLICY "Anyone can view bundle courses"
ON bundle_courses FOR SELECT
USING (true);

CREATE POLICY "Admins can manage bundle courses"
ON bundle_courses FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Extend course_lessons for video storage
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS video_storage_path TEXT;
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]';

-- Create bundle_purchases table
CREATE TABLE IF NOT EXISTS bundle_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bundle_id UUID NOT NULL REFERENCES course_bundles(id),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GBP',
  status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on bundle_purchases
ALTER TABLE bundle_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for bundle_purchases
CREATE POLICY "Users can view their own bundle purchases"
ON bundle_purchases FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bundle purchases"
ON bundle_purchases FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at on course_bundles
CREATE TRIGGER update_course_bundles_updated_at
BEFORE UPDATE ON course_bundles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();