-- Table pour les règles de routage automatique des prospects
CREATE TABLE IF NOT EXISTS public.routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  source_condition TEXT,
  status_condition TEXT,
  company_condition TEXT,
  target_group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  tags_to_add TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_routing_rules_user_id ON public.routing_rules(user_id);
CREATE INDEX idx_routing_rules_active ON public.routing_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_routing_rules_priority ON public.routing_rules(priority DESC);

-- RLS policies
ALTER TABLE public.routing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routing rules"
  ON public.routing_rules
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own routing rules"
  ON public.routing_rules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routing rules"
  ON public.routing_rules
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routing rules"
  ON public.routing_rules
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_routing_rules_updated_at
  BEFORE UPDATE ON public.routing_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour appliquer les règles de routage à un prospect
CREATE OR REPLACE FUNCTION public.apply_routing_rules(prospect_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rule_record RECORD;
  prospect_record RECORD;
  user_id_param UUID;
BEGIN
  -- Récupérer les infos du prospect
  SELECT * INTO prospect_record
  FROM prospects
  WHERE id = prospect_id_param;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  user_id_param := prospect_record.user_id;
  
  -- Parcourir les règles actives par priorité décroissante
  FOR rule_record IN
    SELECT *
    FROM routing_rules
    WHERE user_id = user_id_param
      AND is_active = true
    ORDER BY priority DESC
  LOOP
    -- Vérifier si le prospect correspond aux conditions
    IF (rule_record.source_condition IS NULL OR prospect_record.source = rule_record.source_condition)
       AND (rule_record.status_condition IS NULL OR prospect_record.status = rule_record.status_condition)
       AND (rule_record.company_condition IS NULL OR prospect_record.company ILIKE '%' || rule_record.company_condition || '%')
    THEN
      -- Ajouter le prospect au groupe cible
      IF rule_record.target_group_id IS NOT NULL THEN
        INSERT INTO prospect_groups (prospect_id, group_id)
        VALUES (prospect_id_param, rule_record.target_group_id)
        ON CONFLICT DO NOTHING;
      END IF;
      
      -- Sortir après la première règle correspondante (priorité)
      EXIT;
    END IF;
  END LOOP;
END;
$$;