import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { CircleNotch, UsersThree, Plus } from "@phosphor-icons/react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Group {
  id: string;
  name: string;
  color: string;
}

interface BulkAddToGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospectIds: string[];
  onComplete?: () => void;
}

const BulkAddToGroupDialog = ({
  open,
  onOpenChange,
  prospectIds,
  onComplete,
}: BulkAddToGroupDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#6366f1");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open]);

  const fetchGroups = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (data) {
      setGroups(data);
    }
  };

  const handleSubmit = async () => {
    if (prospectIds.length === 0) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let targetGroupId = selectedGroupId;

      // Créer un nouveau groupe si nécessaire
      if (mode === "new") {
        if (!newGroupName.trim()) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Veuillez entrer un nom de groupe",
          });
          setLoading(false);
          return;
        }

        const { data: newGroup, error: groupError } = await supabase
          .from("groups")
          .insert({
            user_id: user.id,
            name: newGroupName.trim(),
            color: newGroupColor,
          })
          .select()
          .single();

        if (groupError) throw groupError;
        targetGroupId = newGroup.id;
      }

      if (!targetGroupId) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Veuillez sélectionner ou créer un groupe",
        });
        setLoading(false);
        return;
      }

      // Récupérer les associations existantes pour éviter les doublons
      const { data: existingAssocs } = await supabase
        .from("prospect_groups")
        .select("prospect_id")
        .eq("group_id", targetGroupId)
        .in("prospect_id", prospectIds);

      const existingProspectIds = new Set(existingAssocs?.map((a) => a.prospect_id) || []);
      
      // Filtrer les prospects qui ne sont pas déjà dans le groupe
      const newProspectIds = prospectIds.filter((id) => !existingProspectIds.has(id));

      if (newProspectIds.length > 0) {
        const associations = newProspectIds.map((prospectId) => ({
          prospect_id: prospectId,
          group_id: targetGroupId,
        }));

        const { error } = await supabase.from("prospect_groups").insert(associations);
        if (error) throw error;
      }

      const alreadyInGroup = prospectIds.length - newProspectIds.length;
      let message = `${newProspectIds.length} prospect(s) ajouté(s) au groupe`;
      if (alreadyInGroup > 0) {
        message += ` (${alreadyInGroup} déjà présent(s))`;
      }

      toast({
        title: "Succès",
        description: message,
      });

      setSelectedGroupId("");
      setNewGroupName("");
      setMode("existing");
      onOpenChange(false);
      onComplete?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'ajouter les prospects au groupe",
      });
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
    "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersThree className="h-5 w-5 text-primary" />
            Ajouter au groupe
          </DialogTitle>
          <DialogDescription>
            Ajouter {prospectIds.length} prospect(s) à un groupe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as "existing" | "new")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing" />
              <Label htmlFor="existing">Groupe existant</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new">Créer un nouveau groupe</Label>
            </div>
          </RadioGroup>

          {mode === "existing" ? (
            <div className="space-y-2">
              <Label>Sélectionner un groupe</Label>
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Aucun groupe disponible. Créez-en un nouveau.
                </p>
              ) : (
                <ScrollArea className="h-48 border rounded-lg">
                  <div className="p-2 space-y-1">
                    {groups.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => setSelectedGroupId(group.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                          selectedGroupId === group.id
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="font-medium text-sm">{group.name}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Nom du groupe</Label>
                <Input
                  id="group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex: Clients VIP"
                />
              </div>
              <div className="space-y-2">
                <Label>Couleur</Label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewGroupColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newGroupColor === color
                          ? "ring-2 ring-offset-2 ring-primary scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || (mode === "existing" && !selectedGroupId) || (mode === "new" && !newGroupName.trim())}
            >
              {loading ? (
                <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Ajouter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddToGroupDialog;
