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
      nouveau: "bg-blue-500",
      contacte: "bg-yellow-500",
      qualifie: "bg-purple-500",
      converti: "bg-green-500",
      perdu: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Prospects Récents</CardTitle>
        <Button onClick={() => navigate("/prospects")}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Prospect
        </Button>
      </CardHeader>
      <CardContent>
        {prospects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucun prospect pour le moment</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/prospects")}
            >
              Ajouter votre premier prospect
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Nom</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Entreprise</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                  <th className="text-left p-4 font-medium">Clics</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((prospect) => (
                  <tr key={prospect.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">{prospect.full_name}</td>
                    <td className="p-4 text-muted-foreground">
                      {prospect.email}
                    </td>
                    <td className="p-4">{prospect.company || "-"}</td>
                    <td className="p-4">
                      <Badge
                        className={`${getStatusColor(
                          prospect.status
                        )} text-white`}
                      >
                        {prospect.status}
                      </Badge>
                    </td>
                    <td className="p-4">{prospect.click_count}</td>
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
