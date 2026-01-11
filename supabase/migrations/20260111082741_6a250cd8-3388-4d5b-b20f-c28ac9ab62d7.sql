-- Add vision_image_url to life_goals table for storing AI-generated vision images
ALTER TABLE public.life_goals 
ADD COLUMN IF NOT EXISTS vision_image_url TEXT;