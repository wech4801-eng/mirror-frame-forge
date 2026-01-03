-- Table to track workflow executions for each prospect in a campaign
CREATE TABLE public.workflow_executions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  workflow_id uuid REFERENCES public.workflows(id) ON DELETE SET NULL,
  current_step integer NOT NULL DEFAULT 0,
  total_steps integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'paused', 'failed')),
  next_execution_at timestamp with time zone,
  last_executed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(campaign_id, prospect_id)
);

-- Enable RLS
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own workflow executions"
ON public.workflow_executions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM email_campaigns
    WHERE email_campaigns.id = workflow_executions.campaign_id
    AND email_campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own workflow executions"
ON public.workflow_executions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM email_campaigns
    WHERE email_campaigns.id = workflow_executions.campaign_id
    AND email_campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own workflow executions"
ON public.workflow_executions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM email_campaigns
    WHERE email_campaigns.id = workflow_executions.campaign_id
    AND email_campaigns.user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_workflow_executions_updated_at
BEFORE UPDATE ON public.workflow_executions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for efficient queries by the cron job
CREATE INDEX idx_workflow_executions_next_execution 
ON public.workflow_executions(next_execution_at) 
WHERE status = 'in_progress';

CREATE INDEX idx_workflow_executions_campaign 
ON public.workflow_executions(campaign_id);

-- Add workflow_steps column to store the actual steps to execute
ALTER TABLE public.email_campaigns 
ADD COLUMN workflow_steps jsonb DEFAULT '[]'::jsonb;