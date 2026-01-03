-- Add auto_enroll_new_prospects column to email_campaigns table
ALTER TABLE public.email_campaigns 
ADD COLUMN auto_enroll_new_prospects boolean DEFAULT false;

-- Add target_groups column to store the groups used for auto-enrollment
ALTER TABLE public.email_campaigns 
ADD COLUMN target_groups uuid[] DEFAULT '{}';