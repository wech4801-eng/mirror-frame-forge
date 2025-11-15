import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowTemplate } from "@/lib/workflowTemplates";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lightning } from "@phosphor-icons/react";

interface WizardStepTriggerProps {
  template: WorkflowTemplate;
  state: any;
  onUpdate: (data: any) => void;
}

export function WizardStepTrigger({
  template,
  state,
  onUpdate,
}: WizardStepTriggerProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("groups")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      setGroups(data || []);
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTriggerExplanation = () => {
    switch (template.trigger_config.type) {
      case "event":
        return {
          title: "Déclenchement par événement",
          description: `Ce workflow se lance automatiquement quand : ${template.trigger_config.event}`,
          icon: "⚡",
        };
      case "time":
        return {
          title: "Déclenchement planifié",
          description: "Ce workflow se lance à des moments précis définis",
          icon: "⏰",
        };
      case "segment":
        return {
          title: "Déclenchement par segment",
          description: "Ce workflow cible un groupe spécifique de prospects",
          icon: "🎯",
        };
      default:
        return {
          title: "Déclencheur",
          description: "Configuration du démarrage du workflow",
          icon: "🚀",
        };
    }
  };

  const explanation = getTriggerExplanation();

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="text-2xl">{explanation.icon}</div>
          <div>
            <h4 className="font-semibold">{explanation.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {explanation.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {template.trigger_config.conditions && template.trigger_config.conditions.length > 0 && (
        <div className="space-y-2">
          <Label>Conditions requises</Label>
          <div className="space-y-2">
            {template.trigger_config.conditions.map((condition, index) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {condition}
                  </code>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {template.trigger_config.type === "segment" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="group">
              Sélectionnez le groupe de prospects cible
              <span className="text-destructive ml-1">*</span>
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Le workflow s'appliquera à tous les prospects de ce groupe
            </p>
          </div>

          <Select
            value={state.selectedGroup}
            onValueChange={(value) => onUpdate({ selectedGroup: value })}
          >
            <SelectTrigger id="group">
              <SelectValue placeholder="Choisir un groupe..." />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <span>{group.name}</span>
                    {group.description && (
                      <span className="text-xs text-muted-foreground">
                        - {group.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {groups.length === 0 && (
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
              Aucun groupe disponible. Créez un groupe dans la section Prospects.
            </div>
          )}
        </div>
      )}

      {template.trigger_config.type === "event" && (
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Lightning className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">Déclenchement automatique</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ce workflow démarrera automatiquement quand l'événement se produit.
              Aucune configuration supplémentaire n'est nécessaire.
            </p>
            <div className="mt-3">
              <Badge variant="secondary" className="text-xs">
                Événement : {template.trigger_config.event}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg bg-muted p-4 text-sm">
        <p className="font-medium mb-2">💡 Astuce</p>
        <p className="text-muted-foreground text-xs">
          Vous pourrez tester le déclenchement du workflow avant de l'activer
          pour vérifier qu'il fonctionne comme prévu.
        </p>
      </div>
    </div>
  );
}
