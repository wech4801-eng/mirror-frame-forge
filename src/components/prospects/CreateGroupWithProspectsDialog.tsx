import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationHelpers } from "@/lib/notificationsUtils";

interface Prospect {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
}

interface CreateGroupWithProspectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: () => void;
}

const CreateGroupWithProspectsDialog = ({
  open,
  onOpenChange,
  onGroupCreated,
}: CreateGroupWithProspectsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedProspects, setSelectedProspects] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#6366f1",
  });

  const colors = [
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#ef4444", // red
    "#3b82f6", // blue
  ];

  useEffect(() => {
    if (open) {
      fetchProspects();
    }
  }, [open]);

  const fetchProspects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("prospects")
      .select("id, full_name, email, company")
      .eq("user_id", user.id)
      .order("full_name");

    if (!error && data) {
      setProspects(data);
    }
  };

  const handleToggleProspect = (prospectId: string) => {
    setSelectedProspects((prev) => {
      const next = new Set(prev);
      if (next.has(prospectId)) {
        next.delete(prospectId);
      } else {
        next.add(prospectId);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Créer le groupe
      const { data: newGroup, error: groupError } = await supabase
        .from("groups")
        .insert({
          user_id: user.id,
          ...formData,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Ajouter les prospects sélectionnés au groupe
      if (selectedProspects.size > 0 && newGroup) {
        const prospectGroupsData = Array.from(selectedProspects).map(
          (prospectId) => ({
            group_id: newGroup.id,
            prospect_id: prospectId,
          })
        );

        const { error: prospectGroupsError } = await supabase
          .from("prospect_groups")
          .insert(prospectGroupsData);

        if (prospectGroupsError) throw prospectGroupsError;
      }
      
      // Créer une notification
      await notificationHelpers.groupCreated(newGroup.name, selectedProspects.size);

      toast({
        title: "Succès",
        description: `Groupe créé avec ${selectedProspects.size} prospect(s)`,
      });

      setFormData({ name: "", description: "", color: "#6366f1" });
      setSelectedProspects(new Set());
      onOpenChange(false);
      onGroupCreated?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer le groupe",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Créer un Groupe avec Prospects</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group_name">Nom du groupe *</Label>
              <Input
                id="group_name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color
                        ? "border-foreground"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="group_description">Description</Label>
            <Textarea
              id="group_description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>
              Sélectionner les prospects ({selectedProspects.size}{" "}
              sélectionné{selectedProspects.size > 1 ? "s" : ""})
            </Label>
            <ScrollArea className="h-64 border rounded-md">
              <div className="p-4 space-y-3">
                {prospects.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Aucun prospect disponible
                  </p>
                ) : (
                  prospects.map((prospect) => (
                    <div
                      key={prospect.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Checkbox
                        id={prospect.id}
                        checked={selectedProspects.has(prospect.id)}
                        onCheckedChange={() => handleToggleProspect(prospect.id)}
                      />
                      <Label
                        htmlFor={prospect.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{prospect.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {prospect.email}
                          {prospect.company && ` • ${prospect.company}`}
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer le groupe"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupWithProspectsDialog;
