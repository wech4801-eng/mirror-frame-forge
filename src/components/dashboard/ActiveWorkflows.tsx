import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightning, Pause, Play } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ActiveWorkflows = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkflows = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("workflows")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      setWorkflows(data || []);
    };

    fetchWorkflows();
  }, []);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Workflows Actifs</CardTitle>
          <p className="text-sm text-muted-foreground">Automatisations en cours</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/workflow")}
        >
          Voir tout
        </Button>
      </CardHeader>
      <CardContent>
        {workflows.length > 0 ? (
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
                onClick={() => navigate(`/workflow-editor/${workflow.id}`)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${workflow.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Lightning className={`h-4 w-4 ${workflow.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{workflow.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {workflow.description || "Aucune description"}
                    </p>
                  </div>
                </div>
                <Badge variant={workflow.is_active ? "default" : "secondary"} className="ml-2">
                  {workflow.is_active ? (
                    <><Play className="h-3 w-3 mr-1" /> Actif</>
                  ) : (
                    <><Pause className="h-3 w-3 mr-1" /> Inactif</>
                  )}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Lightning className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">Aucun workflow créé</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/workflow")}
            >
              Créer un workflow
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveWorkflows;
