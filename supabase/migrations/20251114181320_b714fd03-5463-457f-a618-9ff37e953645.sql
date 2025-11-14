-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create prospects table
CREATE TABLE public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'contacte', 'qualifie', 'converti', 'perdu')),
  source TEXT,
  notes TEXT,
  click_count INTEGER DEFAULT 0,
  last_click_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prospects"
  ON public.prospects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own prospects"
  ON public.prospects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prospects"
  ON public.prospects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prospects"
  ON public.prospects FOR DELETE
  USING (auth.uid() = user_id);

-- Create groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own groups"
  ON public.groups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own groups"
  ON public.groups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own groups"
  ON public.groups FOR DELETE
  USING (auth.uid() = user_id);

-- Create prospect_groups junction table
CREATE TABLE public.prospect_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(prospect_id, group_id)
);

ALTER TABLE public.prospect_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prospect groups"
  ON public.prospect_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prospects
      WHERE prospects.id = prospect_groups.prospect_id
      AND prospects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own prospect groups"
  ON public.prospect_groups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prospects
      WHERE prospects.id = prospect_groups.prospect_id
      AND prospects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own prospect groups"
  ON public.prospect_groups FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.prospects
      WHERE prospects.id = prospect_groups.prospect_id
      AND prospects.user_id = auth.uid()
    )
  );

-- Create email campaigns table
CREATE TABLE public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'envoye', 'programme')),
  sent_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaigns"
  ON public.email_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns"
  ON public.email_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON public.email_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON public.email_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Create email campaign recipients table
CREATE TABLE public.email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'envoye', 'ouvert', 'clique', 'erreur')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, prospect_id)
);

ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaign recipients"
  ON public.email_campaign_recipients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.email_campaigns
      WHERE email_campaigns.id = email_campaign_recipients.campaign_id
      AND email_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own campaign recipients"
  ON public.email_campaign_recipients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.email_campaigns
      WHERE email_campaigns.id = email_campaign_recipients.campaign_id
      AND email_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own campaign recipients"
  ON public.email_campaign_recipients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.email_campaigns
      WHERE email_campaigns.id = email_campaign_recipients.campaign_id
      AND email_campaigns.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prospects_updated_at
  BEFORE UPDATE ON public.prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();