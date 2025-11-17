-- Create landing_pages table for client landing pages
CREATE TABLE public.landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  primary_color TEXT DEFAULT '#000000',
  logo_url TEXT,
  cta_text TEXT DEFAULT 'Get Started',
  form_fields JSONB DEFAULT '["email", "full_name", "phone"]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT landing_pages_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- Policies for landing_pages
CREATE POLICY "Users can view their own landing pages"
  ON public.landing_pages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own landing pages"
  ON public.landing_pages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own landing pages"
  ON public.landing_pages
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own landing pages"
  ON public.landing_pages
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy for public access to active landing pages
CREATE POLICY "Anyone can view active landing pages"
  ON public.landing_pages
  FOR SELECT
  USING (is_active = true);

-- Create landing_page_submissions table for prospect submissions
CREATE TABLE public.landing_page_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_page_id UUID NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT landing_page_submissions_landing_page_id_fkey FOREIGN KEY (landing_page_id) REFERENCES landing_pages(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.landing_page_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for landing_page_submissions
CREATE POLICY "Users can view submissions for their landing pages"
  ON public.landing_page_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM landing_pages
      WHERE landing_pages.id = landing_page_submissions.landing_page_id
      AND landing_pages.user_id = auth.uid()
    )
  );

-- Allow public insert for submissions
CREATE POLICY "Anyone can submit to landing pages"
  ON public.landing_page_submissions
  FOR INSERT
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for subdomain lookups
CREATE INDEX idx_landing_pages_subdomain ON public.landing_pages(subdomain);
CREATE INDEX idx_landing_page_submissions_landing_page_id ON public.landing_page_submissions(landing_page_id);