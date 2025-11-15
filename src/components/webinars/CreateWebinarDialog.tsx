import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateWebinarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateWebinarDialog = ({ open, onOpenChange, onSuccess }: CreateWebinarDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [commercialTitle, setCommercialTitle] = useState("");
  const [commercialDescription, setCommercialDescription] = useState("");
  const [commercialCtaText, setCommercialCtaText] = useState("Acheter maintenant");
  const [commercialCtaLink, setCommercialCtaLink] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from("webinars").insert({
        user_id: user.id,
        title,
        description,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        commercial_title: commercialTitle,
        commercial_description: commercialDescription,
        commercial_cta_text: commercialCtaText,
        commercial_cta_link: commercialCtaLink,
        status: "planifie",
      });

      if (error) throw error;

      toast({
        title: "Webinaire créé",
        description: "Le webinaire a été créé avec succès",
      });

      onOpenChange(false);
      onSuccess();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setScheduledAt("");
    setDurationMinutes(60);
    setCommercialTitle("");
    setCommercialDescription("");
    setCommercialCtaText("Acheter maintenant");
    setCommercialCtaLink("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un webinaire</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Informations du webinaire</h3>
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Comment tripler vos ventes en 90 jours"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez le contenu de votre webinaire"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Date et heure</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                  min={15}
                  max={240}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm">Bannière commerciale</h3>
            <div className="space-y-2">
              <Label htmlFor="commercialTitle">Titre de l&apos;offre</Label>
              <Input
                id="commercialTitle"
                value={commercialTitle}
                onChange={(e) => setCommercialTitle(e.target.value)}
                placeholder="Ex: Formation Complète à -50%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commercialDescription">Description de l&apos;offre</Label>
              <Textarea
                id="commercialDescription"
                value={commercialDescription}
                onChange={(e) => setCommercialDescription(e.target.value)}
                placeholder="Offre exclusive réservée aux participants du webinaire"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaText">Texte du bouton</Label>
                <Input
                  id="ctaText"
                  value={commercialCtaText}
                  onChange={(e) => setCommercialCtaText(e.target.value)}
                  placeholder="Acheter maintenant"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaLink">Lien du bouton</Label>
                <Input
                  id="ctaLink"
                  type="url"
                  value={commercialCtaLink}
                  onChange={(e) => setCommercialCtaLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer le webinaire"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWebinarDialog;
