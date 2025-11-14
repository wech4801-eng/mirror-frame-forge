import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Edit, Trash2, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

interface Group {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  prospect_count?: number;
}

const ProspectGroupsGrid = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Groupes{" "}
            <Badge variant="secondary" className="ml-2 text-xs">
              {groups.length.toString().padStart(2, "0")}
            </Badge>
          </h2>
        </div>
        <div className="w-full max-w-xs">
          <Input
            placeholder="Rechercher un groupe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background/50"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredGroups.map((group, index) => (
          <Card
            key={group.id}
            className="border-border/50 bg-card/50 backdrop-blur-sm shadow-card hover:shadow-glow transition-all duration-300 group animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: group.color || "#8B5CF6" }}
                  />
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {group.name}
                    </h3>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {group.prospect_count} Prospects
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Calendar className="h-3 w-3" />
                <span>MIS À JOUR: {formatDate(group.updated_at)}</span>
              </div>

              {group.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {group.description}
                </p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-border/30">
                <Button variant="ghost" size="sm" className="h-9 flex-1">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 flex-1">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 flex-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredGroups.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            <p>Aucun groupe trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProspectGroupsGrid;
