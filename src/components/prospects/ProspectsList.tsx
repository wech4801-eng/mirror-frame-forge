import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MagnifyingGlass, Trash, PencilSimple, UsersThree } from "@phosphor-icons/react";
import { useToast } from "@/components/ui/use-toast";
import EditProspectDialog from "./EditProspectDialog";
import ManageGroupsDialog from "./ManageGroupsDialog";

interface Prospect {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  click_count: number;
  notes: string | null;
  created_at: string;
}

const ProspectsList = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [groupsDialogOpen, setGroupsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProspects();
    
    const channel = supabase
      .channel('prospects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prospects'
        },
        () => fetchProspects()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = prospects;

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.full_name.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase()) ||
          (p.company && p.company.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (statusFilter !== "tous") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredProspects(filtered);
  }, [search, statusFilter, prospects]);

  const fetchProspects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("prospects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProspects(data);
      setFilteredProspects(data);
    }
    setLoading(false);
  };

  const deleteProspect = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce prospect ?")) return;

    const { error } = await supabase.from("prospects").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le prospect",
      });
    } else {
      toast({
        title: "Succès",
        description: "Prospect supprimé avec succès",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      nouveau: "bg-primary/10 text-primary border-primary/20",
      contacte: "bg-orange/10 text-orange border-orange/20",
      qualifie: "bg-pink/10 text-pink border-pink/20",
      converti: "bg-purple/10 text-purple border-purple/20",
      perdu: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[status] || "bg-muted/50 text-muted-foreground border-muted";
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
    <>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un prospect..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background/50 border-border/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-background/50 border-border/50">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="nouveau">Nouveau</SelectItem>
                <SelectItem value="contacte">Contacté</SelectItem>
                <SelectItem value="qualifie">Qualifié</SelectItem>
                <SelectItem value="converti">Converti</SelectItem>
                <SelectItem value="perdu">Perdu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredProspects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>Aucun prospect trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Téléphone</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Entreprise</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Clics</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProspects.map((prospect) => (
                    <tr key={prospect.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{prospect.full_name}</td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {prospect.email}
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">{prospect.phone || "-"}</td>
                      <td className="p-4 text-muted-foreground text-sm">{prospect.company || "-"}</td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(
                            prospect.status
                          )} text-xs`}
                        >
                          {prospect.status}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium">{prospect.click_count || 0}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedProspect(prospect);
                              setGroupsDialogOpen(true);
                            }}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedProspect(prospect);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteProspect(prospect.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProspect && (
        <>
          <EditProspectDialog
            prospect={selectedProspect}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <ManageGroupsDialog
            prospect={selectedProspect}
            open={groupsDialogOpen}
            onOpenChange={setGroupsDialogOpen}
          />
        </>
      )}
    </>
  );
};

export default ProspectsList;
