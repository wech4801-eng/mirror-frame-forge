import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowTemplate } from "@/lib/workflowTemplates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Clock, Plus, ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface WizardStepActionsProps {
  template: WorkflowTemplate;
  state: any;
  brandingId?: string;
  onUpdate: (data: any) => void;
}

export function WizardStepActions({
  template,
  state,
  brandingId,
  onUpdate,
}: WizardStepActionsProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("email_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "send_email":
        return <Mail className="h-4 w-4" />;
      case "wait":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: any, index: number) => {
    switch (action.type) {
      case "send_email":
        return `Email ${index + 1}: ${action.params.template_key || "Template"}`;
      case "wait":
        const days = action.params.days || action.params.delay_days || 0;
        const hours = action.params.hours || action.params.delay_hours || 0;
        const minutes = action.params.minutes || action.params.delay_minutes || 0;
        if (days) return `Attendre ${days} jour${days > 1 ? "s" : ""}`;
        if (hours) return `Attendre ${hours} heure${hours > 1 ? "s" : ""}`;
        if (minutes) return `Attendre ${minutes} minute${minutes > 1 ? "s" : ""}`;
        return "Attendre";
      case "if":
        return "Condition";
      case "add_tag":
        return "Ajouter un tag";
      case "update_field":
        return "Mettre à jour un champ";
      default:
        return action.type;
    }
  };

  const emailActions = template.actions_config.filter(a => a.type === "send_email");

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-purple-500/10 p-4 text-sm text-purple-700 dark:text-purple-300">
        <p className="font-medium mb-1">Séquence d'actions</p>
        <p className="text-xs">
          Ce workflow comporte {template.actions_config.length} actions.
          Configurez les emails qui seront envoyés.
        </p>
      </div>

      {/* Preview of all actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Aperçu de la séquence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {template.actions_config.map((action, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                {getActionIcon(action.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{getActionLabel(action, index)}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                Étape {index + 1}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Configure email templates */}
      {emailActions.length > 0 && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Configuration des emails</h4>
            <p className="text-sm text-muted-foreground">
              Sélectionnez ou créez les templates d'email pour chaque envoi
            </p>
          </div>

          <Accordion type="multiple" className="w-full">
            {emailActions.map((action, actionIndex) => {
              const actualIndex = template.actions_config.indexOf(action);
              const stateKey = `action_${actualIndex}`;
              
              return (
                <AccordionItem key={actualIndex} value={`action-${actualIndex}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">
                        Email {actionIndex + 1}: {action.params.template_key}
                      </span>
                      {state.templates[stateKey] && (
                        <Badge variant="secondary" className="ml-2">
                          <span className="mr-1">✓</span> Configuré
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>
                        Template d'email
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Select
                        value={state.templates[stateKey] || ""}
                        onValueChange={(value) => {
                          onUpdate({
                            templates: {
                              ...state.templates,
                              [stateKey]: value,
                            },
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex flex-col">
                                <span>{template.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {template.subject}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {action.params.delay_days !== undefined && (
                      <div className="space-y-2">
                        <Label>Délai d'envoi (jours)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={state.delays[stateKey] || action.params.delay_days || 0}
                          onChange={(e) => {
                            onUpdate({
                              delays: {
                                ...state.delays,
                                [stateKey]: parseInt(e.target.value) || 0,
                              },
                            });
                          }}
                        />
                      </div>
                    )}

                    {templates.length === 0 && (
                      <div className="rounded-lg bg-muted p-3">
                        <p className="text-sm mb-2">Aucun template disponible</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open("/mail", "_blank")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Créer un template
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}

      {template.variables && template.variables.length > 0 && (
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2">Variables disponibles</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Utilisez ces variables dans vos templates pour la personnalisation :
            </p>
            <div className="flex flex-wrap gap-2">
              {template.variables.map((variable) => (
                <Badge key={variable} variant="secondary" className="text-xs font-mono">
                  {`{{${variable}}}`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
