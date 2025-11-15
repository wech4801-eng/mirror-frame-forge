-- Add workflow_id column to email_campaigns table
ALTER TABLE email_campaigns 
ADD COLUMN workflow_id uuid REFERENCES workflows(id) ON DELETE SET NULL;

-- Update status column to support active/inactive states
-- Keep existing status values: brouillon, envoye, planifie
-- We'll handle active/inactive in a separate column
ALTER TABLE email_campaigns 
ADD COLUMN is_active boolean DEFAULT false;