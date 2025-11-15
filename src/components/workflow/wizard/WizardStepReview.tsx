import { WorkflowTemplate } from "@/lib/workflowTemplates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle } from "lucide-react";

interface WizardStepReviewProps {
  template: WorkflowTemplate;
  wizardState: any;
}

export function WizardStepReview({ template, wizardState }: WizardStepReviewProps) {
  const emailActionsCount = template.actions_config.filter(
    (a) => a.type === "send_email"
  ).length;
  const configuredEmailsCount = Object.keys(wizardState.actions.templates).length;

  const allEmailsConfigured = configuredEmailsCount >= emailActionsCount;

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-300">
        <div className="flex items-center gap-2 mb-2">
          <Check className="h-5 w-5" />
          <p className="font-medium">Configuration terminée !</p>
        </div>
        <p className="text-xs">
          Vérifiez les informations ci-dessous avant de créer votre workflow.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Résumé du workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom</p>
              <p className="text-sm font-semibold">{template.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Catégorie</p>
              <Badge variant="secondary">{template.category}</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{template.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prérequis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Branding sélectionné</span>
            {wizardState.prerequisites.hasBranding ? (
              <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                <Check className="h-3 w-3 mr-1" />
                Configuré
              </Badge>
            ) : (
              <Badge variant="destructive">Manquant</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Groupes de prospects</span>
            {wizardState.prerequisites.hasGroups ? (
              <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                <Check className="h-3 w-3 mr-1" />
                Disponible
              </Badge>
            ) : (
              <Badge variant="destructive">Manquant</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Déclencheur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Type</span>
              <Badge variant="outline">{template.trigger_config.type}</Badge>
            </div>
            {template.trigger_config.type === "segment" &&
              wizardState.trigger.selectedGroup && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Groupe cible</span>
                  <Badge variant="secondary">Configuré</Badge>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Nombre total d'actions</span>
            <Badge>{template.actions_config.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Emails à configurer</span>
            <Badge>{emailActionsCount}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Emails configurés</span>
            {allEmailsConfigured ? (
              <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                <Check className="h-3 w-3 mr-1" />
                {configuredEmailsCount}/{emailActionsCount}
              </Badge>
            ) : (
              <Badge variant="destructive">
                {configuredEmailsCount}/{emailActionsCount}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {template.safeguards && Object.keys(template.safeguards).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Protections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {template.safeguards.stop_on_reply && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Arrêt automatique si le prospect répond</span>
                </div>
              )}
              {template.safeguards.quiet_hours && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Respect des heures calmes (21h-8h)</span>
                </div>
              )}
              {template.safeguards.frequency_cap && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>
                    Maximum {template.safeguards.frequency_cap} emails par jour
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!allEmailsConfigured && (
        <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 p-3 text-sm text-orange-700 dark:text-orange-300">
          <AlertCircle className="h-4 w-4" />
          <span>
            Tous les emails ne sont pas encore configurés. Retournez à l'étape "Actions"
            pour terminer la configuration.
          </span>
        </div>
      )}

      <div className="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-700 dark:text-blue-300">
        <p className="font-medium mb-1">📝 Prochaine étape</p>
        <p className="text-xs">
          Une fois créé, votre workflow sera en mode <strong>inactif</strong>. Vous pourrez le
          tester et l'activer quand vous serez prêt.
        </p>
      </div>
    </div>
  );
}
