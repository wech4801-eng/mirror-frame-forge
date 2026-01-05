import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  CircleNotch,
  UsersThree,
  Trash,
  MagnifyingGlass,
  UserMinus,
} from "@phosphor-icons/react";

interface Group {
  id: string;
  name: string;
  color: string | null;
}

interface Prospect {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  status: string;
}

interface ViewGroupProspectsDialogProps {
  group: Group;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

const ViewGroupProspectsDialog = ({
  group,
  open,
  onOpenChange,
  onUpdate,
}: ViewGroupProspectsDialogProps) => {
  const [loading, setLoading] = useState(true);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [removing, setRemoving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchProspects();
    }
  }, [open, group.id]);

  const fetchProspects = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from("prospect_groups")
      .select(`
        prospect_id,
        prospects (
          id,
          full_name,
          email,
          company,
          status
        )
      `)
      .eq("group_id", group.id);

    if (data) {
      const prospectsList = data
        .map((item: any) => item.prospects)
        .filter((p: any) => p !== null);
      setProspects(prospectsList);
    }
    
    setLoading(false);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProspects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProspects.map((p) => p.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleRemoveFromGroup = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Retirer ${selectedIds.size} prospect(s) du groupe ?`)) return;

    setRemoving(true);
    try {
      const { error } = await supabase
        .from("prospect_groups")
        .delete()
        .eq("group_id", group.id)
        .in("prospect_id", Array.from(selectedIds));

      if (error) throw error;

      toast({
        title: "Succès",
        description: `${selectedIds.size} prospect(s) retiré(s) du groupe`,
      });

      setSelectedIds(new Set());
      fetchProspects();
      onUpdate?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de retirer les prospects",
      });
    } finally {
      setRemoving(false);
    }
  };

  const handleRemoveOne = async (prospectId: string) => {
    try {
      const { error } = await supabase
        .from("prospect_groups")
        .delete()
        .eq("group_id", group.id)
        .eq("prospect_id", prospectId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Prospect retiré du groupe",
      });

      fetchProspects();
      onUpdate?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de retirer le prospect",
      });
    }
  };

  const filteredProspects = prospects.filter(
    (p) =>
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      nouveau: "bg-primary/10 text-primary border-primary/20",
      contacte: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      qualifie: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      converti: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      perdu: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[status] || "bg-muted/50 text-muted-foreground border-muted";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: group.color || "#8B5CF6" }}
            />
            <UsersThree className="h-5 w-5 text-primary" />
            {group.name}
          </DialogTitle>
          <DialogDescription>
            {prospects.length} prospect(s) dans ce groupe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between p-2 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedIds.size} sélectionné(s)
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveFromGroup}
                disabled={removing}
              >
                {removing ? (
                  <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserMinus className="mr-2 h-4 w-4" />
                )}
                Retirer du groupe
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <CircleNotch className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProspects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UsersThree className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {searchQuery
                  ? "Aucun prospect trouvé"
                  : "Ce groupe est vide"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] border rounded-lg">
              <table className="w-full">
                <thead className="sticky top-0 bg-background border-b">
                  <tr>
                    <th className="p-3 w-12">
                      <Checkbox
                        checked={
                          selectedIds.size === filteredProspects.length &&
                          filteredProspects.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                      Nom
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                      Email
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                      Statut
                    </th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProspects.map((prospect) => (
                    <tr
                      key={prospect.id}
                      className={`border-b hover:bg-muted/30 ${
                        selectedIds.has(prospect.id) ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={selectedIds.has(prospect.id)}
                          onCheckedChange={() => handleSelectOne(prospect.id)}
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <span className="font-medium">{prospect.full_name}</span>
                          {prospect.company && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({prospect.company})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {prospect.email}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(prospect.status)} text-xs`}
                        >
                          {prospect.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveOne(prospect.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewGroupProspectsDialog;
