import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CalendarBlank,
  PencilSimple,
  Trash,
  Plus,
  MagnifyingGlass,
  Users,
  Eye,
} from "@phosphor-icons/react";
import { useToast } from "@/components/ui/use-toast";
import EditGroupDialog from "./EditGroupDialog";
import ViewGroupProspectsDialog from "./ViewGroupProspectsDialog";

interface Group {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  prospect_count?: number;
}

interface ProspectsGroupsViewProps {
  onCreateGroup: () => void;
  refreshKey?: number;
}

const ProspectsGroupsView = ({ onCreateGroup, refreshKey }: ProspectsGroupsViewProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, [refreshKey]);

  const fetchGroups = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: groupsData } = await supabase
      .from("groups")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (groupsData) {
      const groupsWithCounts = await Promise.all(
        groupsData.map(async (group) => {
          const { count } = await supabase
            .from("prospect_groups")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);
          return { ...group, prospect_count: count || 0 };
        })
      );
      setGroups(groupsWithCounts);
    }
    setLoading(false);
  };

  const handleDeleteGroup = async (group: Group) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le groupe "${group.name}" ? Les prospects ne seront pas supprimés.`)) {
      return;
    }

    // D'abord supprimer les associations
    await supabase
      .from("prospect_groups")
      .delete()
      .eq("group_id", group.id);

    // Puis supprimer le groupe
    const { error } = await supabase
      .from("groups")
      .delete()
      .eq("id", group.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le groupe",
      });
    } else {
      toast({
        title: "Succès",
        description: "Groupe supprimé avec succès",
      });
      fetchGroups();
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un groupe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
        <Badge variant="secondary" className="text-sm">
          {groups.length} groupe(s)
        </Badge>
      </div>

      {filteredGroups.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery ? "Aucun groupe trouvé" : "Vous n'avez pas encore de groupe"}
            </p>
            {!searchQuery && (
              <Button onClick={onCreateGroup}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un groupe
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <Card
              key={group.id}
              className="border-border/50 bg-card/50 backdrop-blur-sm shadow-card hover:shadow-glow transition-all duration-300 group"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: group.color || "#8B5CF6" }}
                    />
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {group.name}
                      </h3>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {group.prospect_count} prospect(s)
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <CalendarBlank className="h-3 w-3" />
                  <span>Mis à jour: {formatDate(group.updated_at)}</span>
                </div>

                {group.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewingGroup(group)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Voir
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingGroup(group)}
                  >
                    <PencilSimple className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteGroup(group)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingGroup && (
        <EditGroupDialog
          group={editingGroup}
          open={!!editingGroup}
          onOpenChange={(open) => !open && setEditingGroup(null)}
          onGroupUpdated={fetchGroups}
        />
      )}

      {viewingGroup && (
        <ViewGroupProspectsDialog
          group={viewingGroup}
          open={!!viewingGroup}
          onOpenChange={(open) => !open && setViewingGroup(null)}
          onUpdate={fetchGroups}
        />
      )}
    </div>
  );
};

export default ProspectsGroupsView;
