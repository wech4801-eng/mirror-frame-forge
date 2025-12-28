-- Table pour stocker les configurations de domaine email
CREATE TABLE public.email_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  from_name VARCHAR(255) NOT NULL DEFAULT 'Mon Entreprise',
  from_email VARCHAR(255) NOT NULL,
  reply_to VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  dkim_status VARCHAR(50) DEFAULT 'pending',
  spf_status VARCHAR(50) DEFAULT 'pending',
  dmarc_status VARCHAR(50) DEFAULT 'pending',
  resend_domain_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain)
);

-- Enable RLS
ALTER TABLE public.email_domains ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own email domains"
  ON public.email_domains
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email domains"
  ON public.email_domains
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email domains"
  ON public.email_domains
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email domains"
  ON public.email_domains
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_email_domains_updated_at
  BEFORE UPDATE ON public.email_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();