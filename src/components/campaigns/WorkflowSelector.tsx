import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Workflow } from "lucide-react";

interface WorkflowData {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface WorkflowSelectorProps {
  onWorkflowChange: (workflowId: string | null) => void;
  selectedWorkflowId?: string;
}

export const WorkflowSelector = ({ onWorkflowChange, selectedWorkflowId }: WorkflowSelectorProps) => {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("workflows")
        .select("id, name, description, is_active")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowSelect = (workflowId: string) => {
    if (workflowId === "none") {
      onWorkflowChange(null);
      return;
    }
    onWorkflowChange(workflowId);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="workflow" className="flex items-center gap-2">
        <Workflow className="h-4 w-4" />
        Sélectionner un workflow (optionnel)
      </Label>
      <Select
        value={selectedWorkflowId || "none"}
        onValueChange={handleWorkflowSelect}
        disabled={loading}
      >
        <SelectTrigger id="workflow">
          <SelectValue placeholder="Sélectionner un workflow" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Aucun workflow</SelectItem>
          {workflows.map((workflow) => (
            <SelectItem key={workflow.id} value={workflow.id}>
              {workflow.name} {workflow.is_active ? "✓" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedWorkflowId && selectedWorkflowId !== "none" && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          Le workflow sera déclenché automatiquement pour cette campagne
        </div>
      )}
    </div>
  );
};
