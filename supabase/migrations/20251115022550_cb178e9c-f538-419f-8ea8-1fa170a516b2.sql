-- Créer la table webinars
CREATE TABLE public.webinars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'planifie',
  viewer_link TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
  commercial_title TEXT,
  commercial_description TEXT,
  commercial_cta_text TEXT DEFAULT 'Acheter maintenant',
  commercial_cta_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour webinars
CREATE POLICY "Users can create own webinars"
  ON public.webinars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own webinars"
  ON public.webinars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own webinars"
  ON public.webinars FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own webinars"
  ON public.webinars FOR DELETE
  USING (auth.uid() = user_id);

-- Créer la table webinar_invitations
CREATE TABLE public.webinar_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES webinars(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'envoye',
  opened_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(webinar_id, prospect_id)
);

-- Activer RLS
ALTER TABLE public.webinar_invitations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour webinar_invitations
CREATE POLICY "Users can create own webinar invitations"
  ON public.webinar_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM webinars 
      WHERE webinars.id = webinar_invitations.webinar_id 
      AND webinars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own webinar invitations"
  ON public.webinar_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM webinars 
      WHERE webinars.id = webinar_invitations.webinar_id 
      AND webinars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own webinar invitations"
  ON public.webinar_invitations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM webinars 
      WHERE webinars.id = webinar_invitations.webinar_id 
      AND webinars.user_id = auth.uid()
    )
  );

-- Créer la table webinar_messages
CREATE TABLE public.webinar_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES webinars(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_host BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.webinar_messages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour webinar_messages (tous peuvent lire dans un webinar actif)
CREATE POLICY "Anyone can view webinar messages"
  ON public.webinar_messages FOR SELECT
  USING (TRUE);

CREATE POLICY "Anyone can create webinar messages"
  ON public.webinar_messages FOR INSERT
  WITH CHECK (TRUE);

-- Activer realtime pour les messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.webinar_messages;

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_webinars_updated_at
  BEFORE UPDATE ON public.webinars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();