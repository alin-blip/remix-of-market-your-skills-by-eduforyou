-- Drop existing constraint
ALTER TABLE public.outreach_templates DROP CONSTRAINT IF EXISTS outreach_templates_template_type_check;

-- Add new constraint with all possible template types
ALTER TABLE public.outreach_templates 
ADD CONSTRAINT outreach_templates_template_type_check 
CHECK (template_type = ANY (ARRAY['cold'::text, 'warm'::text, 'follow_up'::text, 'connection'::text, 'intro'::text, 'value_add'::text, 'other'::text]));