import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowTemplate } from "@/lib/workflowTemplates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Plus, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface WizardStepPrerequisitesProps {
  template: WorkflowTemplate;
  state: any;
  onUpdate: (data: any) => void;
}

export function WizardStepPrerequisites({
  template,
  state,
  onUpdate,
}: WizardStepPrerequisitesProps) {
  const [loading, setLoading] = useState(true);
  const [brandings, setBrandings] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkPrerequisites();
  }, []);

  const checkPrerequisites = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check brandings
      const { data: brandingData } = await supabase
        .from("brandings")
        .select("*")
        .eq("user_id", user.id);
      setBrandings(brandingData || []);

      // Check templates
      const { data: templateData } = await supabase
        .from("email_templates")
        .select("*")
        .eq("user_id", user.id);
      setTemplates(templateData || []);

      // Check groups
      const { data: groupData } = await supabase
        .from("groups")
        .select("*")
        .eq("user_id", user.id);
      setGroups(groupData || []);

      onUpdate({
        hasBranding: (brandingData?.length || 0) > 0,
        hasTemplates: (templateData?.length || 0) > 0,
        hasGroups: (groupData?.length || 0) > 0,
        selectedBranding: brandingData?.[0]?.id,
      });
    } catch (error) {
      console.error("Error checking prerequisites:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const prerequisites = [
    {
      name: "Branding",
      description: "Design et identité visuelle de vos emails",
      checked: state.hasBranding,
      createLink: "/branding",
      count: brandings.length,
    },
    {
      name: "Templates d'email",
      description: "Modèles d'emails préconçus",
      checked: state.hasTemplates,
      createLink: "/mail",
      count: templates.length,
      optional: true,
    },
    {
      name: "Groupes de prospects",
      description: "Segmentation de votre audience",
      checked: state.hasGroups,
      createLink: "/prospects",
      count: groups.length,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-700 dark:text-blue-300">
        <p className="font-medium mb-1">Pourquoi ces prérequis ?</p>
        <p className="text-xs">
          Pour que votre workflow <strong>{template.name}</strong> fonctionne correctement,
          vous devez avoir configuré ces éléments de base.
        </p>
      </div>

      <div className="space-y-3">
        {prerequisites.map((prereq) => (
          <Card key={prereq.name} className={prereq.checked ? "border-green-500/50" : ""}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    prereq.checked
                      ? "bg-green-500/20 text-green-700 dark:text-green-300"
                      : "bg-gray-500/20 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {prereq.checked ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <X className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{prereq.name}</p>
                    {prereq.optional && (
                      <span className="text-xs text-muted-foreground">(optionnel)</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {prereq.description}
                    {prereq.count > 0 && (
                      <span className="ml-2 text-xs font-medium">
                        ({prereq.count} disponible{prereq.count > 1 ? "s" : ""})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {!prereq.checked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open(prereq.createLink, "_blank");
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {state.hasBranding && brandings.length > 0 && (
        <div className="space-y-2">
          <Label>Sélectionnez le branding pour ce workflow</Label>
          <Select
            value={state.selectedBranding}
            onValueChange={(value) => onUpdate({ selectedBranding: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un branding" />
            </SelectTrigger>
            <SelectContent>
              {brandings.map((branding) => (
                <SelectItem key={branding.id} value={branding.id}>
                  {branding.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(!state.hasBranding || !state.hasGroups) && (
        <div className="rounded-lg bg-orange-500/10 p-4 text-sm">
          <p className="font-medium text-orange-700 dark:text-orange-300">
            ⚠️ Action requise
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            Créez les éléments manquants (ils s'ouvriront dans un nouvel onglet), puis revenez
            ici et cliquez sur "Rafraîchir" pour continuer.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={checkPrerequisites}
          >
            <Loader2 className="h-4 w-4 mr-2" />
            Rafraîchir
          </Button>
        </div>
      )}
    </div>
  );
}
