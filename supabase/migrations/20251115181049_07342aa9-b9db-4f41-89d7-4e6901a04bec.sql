-- Create workflow_templates table for ready-to-use workflow library
CREATE TABLE IF NOT EXISTS public.workflow_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- onboarding, nurturing, reengagement, qualification, customer_success, compliance
  icon TEXT, -- lucide icon name
  trigger_config JSONB NOT NULL, -- { type, event, conditions }
  actions_config JSONB NOT NULL, -- array of actions
  variables JSONB, -- available variables for this workflow
  safeguards JSONB, -- { frequency_cap, quiet_hours, stop_on_reply }
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view workflow templates (they are public templates)
CREATE POLICY "Anyone can view workflow templates"
ON public.workflow_templates
FOR SELECT
USING (true);

-- Only system can insert/update/delete templates (admin only)
-- Users will clone them into their own workflows table

-- Add trigger for updated_at
CREATE TRIGGER update_workflow_templates_updated_at
BEFORE UPDATE ON public.workflow_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_workflow_templates_category ON public.workflow_templates(category);
CREATE INDEX idx_workflow_templates_active ON public.workflow_templates(is_active);