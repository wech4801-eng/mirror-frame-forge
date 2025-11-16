-- Activer le temps réel pour la table notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Ajouter la table à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;