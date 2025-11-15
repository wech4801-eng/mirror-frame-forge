import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "@phosphor-icons/react";
import CreateGroupDialog from "./CreateGroupDialog";

interface Group {
  id: string;
  name: string;
  color: string;
}

interface Prospect {
  id: string;
  full_name: string;
}

interface ManageGroupsDialogProps {
  prospect: Prospect;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ManageGroupsDialog = ({
  prospect,
  open,
  onOpenChange,
}: ManageGroupsDialogProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchGroups();
      fetchProspectGroups();
    }
  }, [open, prospect.id]);

  const fetchGroups = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (!error && data) {
      setGroups(data);
    }
  };

  const fetchProspectGroups = async () => {
    const { data, error } = await supabase
      .from("prospect_groups")
      .select("group_id")
      .eq("prospect_id", prospect.id);

    if (!error && data) {
      setSelectedGroups(new Set(data.map((pg) => pg.group_id)));
    }
  };

  const handleToggleGroup = async (groupId: string, checked: boolean) => {
    if (checked) {
      const { error } = await supabase.from("prospect_groups").insert({
        prospect_id: prospect.id,
        group_id: groupId,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter au groupe",
        });
        return;
      }
      setSelectedGroups((prev) => new Set([...prev, groupId]));
    } else {
      const { error } = await supabase
        .from("prospect_groups")
        .delete()
        .eq("prospect_id", prospect.id)
        .eq("group_id", groupId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de retirer du groupe",
        });
        return;
      }
      setSelectedGroups((prev) => {
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Gérer les groupes - {prospect.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCreateGroupOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer un nouveau groupe
            </Button>

            {groups.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucun groupe disponible
              </p>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={group.id}
                      checked={selectedGroups.has(group.id)}
                      onCheckedChange={(checked) =>
                        handleToggleGroup(group.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={group.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      {group.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onGroupCreated={fetchGroups}
      />
    </>
  );
};

export default ManageGroupsDialog;
