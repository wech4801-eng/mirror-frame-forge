import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UsersThree, Folder } from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Prospect {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
}

interface Group {
  id: string;
  name: string;
  color: string | null;
}

interface PopulationSelectorProps {
  onSelectionChange: (selectedIds: string[], type: 'prospects' | 'groups') => void;
  selectedIds?: string[];
  selectionType?: 'prospects' | 'groups';
}

export const PopulationSelector = ({ 
  onSelectionChange, 
  selectedIds = [],
  selectionType = 'prospects'
}: PopulationSelectorProps) => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'prospects' | 'groups'>(selectionType);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const [prospectsResult, groupsResult] = await Promise.all([
        supabase
          .from("prospects")
          .select("id, full_name, email, company")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("groups")
          .select("id, name, color")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      ]);

      if (prospectsResult.error) throw prospectsResult.error;
      if (groupsResult.error) throw groupsResult.error;

      setProspects(prospectsResult.data || []);
      setGroups(groupsResult.data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: string, checked: boolean) => {
    let newSelection: string[];
    if (checked) {
      newSelection = [...selectedIds, id];
    } else {
      newSelection = selectedIds.filter(sid => sid !== id);
    }
    onSelectionChange(newSelection, currentTab);
  };

  const handleSelectAll = (items: any[]) => {
    const allIds = items.map(item => item.id);
    const allSelected = allIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      onSelectionChange([], currentTab);
    } else {
      onSelectionChange(allIds, currentTab);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        <UsersThree className="h-4 w-4" />
        Sélectionner la population cible
      </Label>
      
      <Tabs value={currentTab} onValueChange={(v) => {
        setCurrentTab(v as 'prospects' | 'groups');
        onSelectionChange([], v as 'prospects' | 'groups');
      }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prospects">Prospects individuels</TabsTrigger>
          <TabsTrigger value="groups">Par groupes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prospects" className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} prospect(s) sélectionné(s)
            </span>
            <button
              type="button"
              onClick={() => handleSelectAll(prospects)}
              className="text-sm text-primary hover:underline"
            >
              {prospects.length > 0 && prospects.every(p => selectedIds.includes(p.id))
                ? "Tout désélectionner"
                : "Tout sélectionner"}
            </button>
          </div>
          <ScrollArea className="h-[200px] border rounded-md p-4">
            {prospects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun prospect disponible
              </p>
            ) : (
              <div className="space-y-3">
                {prospects.map((prospect) => (
                  <div key={prospect.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`prospect-${prospect.id}`}
                      checked={selectedIds.includes(prospect.id)}
                      onCheckedChange={(checked) => handleToggle(prospect.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`prospect-${prospect.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      <div>{prospect.full_name}</div>
                      <div className="text-xs text-muted-foreground">{prospect.email}</div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="groups" className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} groupe(s) sélectionné(s)
            </span>
            <button
              type="button"
              onClick={() => handleSelectAll(groups)}
              className="text-sm text-primary hover:underline"
            >
              {groups.length > 0 && groups.every(g => selectedIds.includes(g.id))
                ? "Tout désélectionner"
                : "Tout sélectionner"}
            </button>
          </div>
          <ScrollArea className="h-[200px] border rounded-md p-4">
            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun groupe disponible
              </p>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`group-${group.id}`}
                      checked={selectedIds.includes(group.id)}
                      onCheckedChange={(checked) => handleToggle(group.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`group-${group.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex items-center gap-2"
                    >
                      <Folder 
                        className="h-4 w-4" 
                        style={{ color: group.color || undefined }}
                      />
                      {group.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
