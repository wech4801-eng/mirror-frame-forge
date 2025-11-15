import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass } from "@phosphor-icons/react";

interface SelectProspectsDialogProps {
  campaign: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const SelectProspectsDialog = ({ campaign, open, onOpenChange, onSuccess }: SelectProspectsDialogProps) => {
  const [selectedProspects, setSelectedProspects] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: prospects } = useQuery({
    queryKey: ["prospects"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("prospects")
        .select("*")
        .eq("user_id", user.id)
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });

  const { data: existingRecipients } = useQuery({
    queryKey: ["campaign-recipients", campaign.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_campaign_recipients")
        .select("prospect_id")
        .eq("campaign_id", campaign.id);

      if (error) throw error;
      return data.map(r => r.prospect_id);
    },
  });

  useEffect(() => {
    if (existingRecipients) {
      setSelectedProspects(new Set(existingRecipients));
    }
  }, [existingRecipients]);

  const filteredProspects = prospects?.filter(prospect =>
    prospect.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prospect.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prospect.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleProspect = (prospectId: string) => {
    const newSet = new Set(selectedProspects);
    if (newSet.has(prospectId)) {
      newSet.delete(prospectId);
    } else {
      newSet.add(prospectId);
    }
    setSelectedProspects(newSet);
  };

  const toggleAll = () => {
    if (selectedProspects.size === filteredProspects?.length) {
      setSelectedProspects(new Set());
    } else {
      setSelectedProspects(new Set(filteredProspects?.map(p => p.id)));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Delete existing recipients
      await supabase
        .from("email_campaign_recipients")
        .delete()
        .eq("campaign_id", campaign.id);

      // Add new recipients
      if (selectedProspects.size > 0) {
        const recipients = Array.from(selectedProspects).map(prospectId => ({
          campaign_id: campaign.id,
          prospect_id: prospectId,
          status: "en_attente",
        }));

        const { error } = await supabase
          .from("email_campaign_recipients")
          .insert(recipients);

        if (error) throw error;
      }

      toast({
        title: "Destinataires mis à jour",
        description: `${selectedProspects.size} destinataire(s) sélectionné(s)`,
      });

      onSuccess();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Sélectionner les destinataires</DialogTitle>
          <DialogDescription>
            Choisissez les prospects qui recevront cette campagne
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un prospect..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedProspects.size} / {filteredProspects?.length || 0} sélectionné(s)
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleAll}
            >
              {selectedProspects.size === filteredProspects?.length ? "Tout désélectionner" : "Tout sélectionner"}
            </Button>
          </div>

          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            {filteredProspects?.map((prospect) => (
              <div
                key={prospect.id}
                className="flex items-center space-x-3 p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                onClick={() => toggleProspect(prospect.id)}
              >
                <Checkbox
                  checked={selectedProspects.has(prospect.id)}
                  onCheckedChange={() => toggleProspect(prospect.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{prospect.full_name}</p>
                  <p className="text-sm text-muted-foreground truncate">{prospect.email}</p>
                  {prospect.company && (
                    <p className="text-xs text-muted-foreground truncate">{prospect.company}</p>
                  )}
                </div>
              </div>
            ))}

            {filteredProspects?.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Aucun prospect trouvé
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectProspectsDialog;
