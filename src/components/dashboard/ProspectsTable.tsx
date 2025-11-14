import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Prospect {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  status: string;
  click_count: number;
  created_at: string;
}

const ProspectsTable = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("prospects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setProspects(data);
    }
    setLoading(false);
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
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-card">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Prospects Récents</CardTitle>
          <Button 
            onClick={() => navigate("/prospects")} 
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Prospect
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {prospects.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-muted-foreground mb-4">
              Aucun prospect pour le moment
            </p>
            <Button 
              onClick={() => navigate("/prospects")}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter votre premier prospect
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Entreprise</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                  <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Clics</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((prospect) => (
                  <tr key={prospect.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">
                      {prospect.full_name}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">{prospect.email}</td>
                    <td className="p-4 text-muted-foreground text-sm">{prospect.company || "-"}</td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(prospect.status || "nouveau")} text-xs`}
                      >
                        {prospect.status || "nouveau"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-medium">
                      {prospect.click_count || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProspectsTable;
