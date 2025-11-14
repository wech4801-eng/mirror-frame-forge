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
      nouveau: "bg-info/10 text-info border-info/20",
      contacte: "bg-warning/10 text-warning border-warning/20",
      qualifie: "bg-status-progress/10 text-status-progress border-status-progress/20",
      converti: "bg-success/10 text-success border-success/20",
      perdu: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[status] || "bg-muted text-muted-foreground";
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
    <Card className="shadow-sm border-border">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-card pb-4">
        <CardTitle className="text-lg font-semibold">Prospects Récents</CardTitle>
        <Button onClick={() => navigate("/prospects")} size="sm" className="bg-success hover:bg-success/90">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Prospect
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {prospects.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground mb-4">
              Aucun prospect pour le moment
            </p>
            <Button onClick={() => navigate("/prospects")} className="bg-success hover:bg-success/90">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter votre premier prospect
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Nom</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Entreprise</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Clics</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((prospect) => (
                  <tr key={prospect.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4 font-medium text-foreground">{prospect.full_name}</td>
                    <td className="p-4 text-muted-foreground">
                      {prospect.email}
                    </td>
                    <td className="p-4 text-muted-foreground">{prospect.company || "-"}</td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(
                          prospect.status
                        )} font-medium`}
                      >
                        {prospect.status}
                      </Badge>
                    </td>
                    <td className="p-4 font-medium text-foreground">{prospect.click_count}</td>
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
