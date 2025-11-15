import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorkflowTemplate } from "@/lib/workflowTemplates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, WarningCircle, CircleNotch, CaretRight, CaretLeft } from "@phosphor-icons/react";
import { WizardStepPrerequisites } from "./wizard/WizardStepPrerequisites";
import { WizardStepTrigger } from "./wizard/WizardStepTrigger";
import { WizardStepActions } from "./wizard/WizardStepActions";
import { WizardStepReview } from "./wizard/WizardStepReview";

interface WorkflowWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WorkflowTemplate;
}

interface WizardState {
  prerequisites: {
    hasBranding: boolean;
    hasTemplates: boolean;
    hasGroups: boolean;
    selectedBranding?: string;
  };
  trigger: {
    type: string;
    conditions: Record<string, any>;
    selectedGroup?: string;
  };
  actions: {
    templates: Record<string, string>; // action_key -> template_id
    delays: Record<string, number>;
    customValues: Record<string, any>;
  };
  variables: Record<string, string>;
}

const STEPS = [
  { id: "prerequisites", label: "Prérequis", description: "Vérification de votre configuration" },
  { id: "trigger", label: "Déclencheur", description: "Quand ce workflow démarre" },
  { id: "actions", label: "Actions", description: "Ce que fait le workflow" },
  { id: "review", label: "Révision", description: "Vérification finale" },
];

export function WorkflowWizard({ open, onOpenChange, template }: WorkflowWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>({
    prerequisites: {
      hasBranding: false,
      hasTemplates: false,
      hasGroups: false,
    },
    trigger: {
      type: template.trigger_config.type,
      conditions: {},
    },
    actions: {
      templates: {},
      delays: {},
      customValues: {},
    },
    variables: {},
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const canGoNext = validateCurrentStep();
  const canGoPrevious = currentStep > 0;

  function validateCurrentStep(): boolean {
    switch (STEPS[currentStep].id) {
      case "prerequisites":
        return wizardState.prerequisites.hasBranding && 
               wizardState.prerequisites.hasGroups;
      case "trigger":
        if (template.trigger_config.type === "segment") {
          return !!wizardState.trigger.selectedGroup;
        }
        return true;
      case "actions":
        const requiredTemplates = template.actions_config.filter(
          a => a.type === "send_email"
        ).length;
        return Object.keys(wizardState.actions.templates).length >= requiredTemplates;
      case "review":
        return true;
      default:
        return true;
    }
  }

  const handleNext = () => {
    if (canGoNext && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Create workflow with configuration
      const workflowConfig = {
        template_name: template.name,
        branding_id: wizardState.prerequisites.selectedBranding,
        trigger_config: {
          ...template.trigger_config,
          ...wizardState.trigger,
        },
        actions_config: template.actions_config.map((action, index) => ({
          ...action,
          template_id: wizardState.actions.templates[`action_${index}`],
          delay: wizardState.actions.delays[`action_${index}`],
          ...wizardState.actions.customValues[`action_${index}`],
        })),
        variables: wizardState.variables,
      };

      const { data: workflow, error } = await supabase
        .from("workflows")
        .insert({
          user_id: user.id,
          name: template.name,
          description: template.description,
          nodes: [], // Will be converted from config
          edges: [],
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Workflow créé !",
        description: "Votre workflow est prêt. Vous pouvez maintenant l'activer.",
      });

      onOpenChange(false);
      navigate(`/workflow/${workflow.id}`);
    } catch (error: any) {
      console.error("Error creating workflow:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le workflow. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWizardState = (section: keyof WizardState, data: any) => {
    setWizardState(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Configuration : {template.name}
          </DialogTitle>
          <DialogDescription>
            Suivez ces étapes pour configurer votre workflow automatisé
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-1 ${
                  index === currentStep ? "text-primary font-medium" : ""
                } ${index < currentStep ? "text-green-600" : ""}`}
              >
                {index < currentStep ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="flex h-3 w-3 items-center justify-center rounded-full border text-[10px]">
                    {index + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px] py-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{STEPS[currentStep].label}</h3>
            <p className="text-sm text-muted-foreground">
              {STEPS[currentStep].description}
            </p>
          </div>

          {STEPS[currentStep].id === "prerequisites" && (
            <WizardStepPrerequisites
              template={template}
              state={wizardState.prerequisites}
              onUpdate={(data) => updateWizardState("prerequisites", data)}
            />
          )}

          {STEPS[currentStep].id === "trigger" && (
            <WizardStepTrigger
              template={template}
              state={wizardState.trigger}
              onUpdate={(data) => updateWizardState("trigger", data)}
            />
          )}

          {STEPS[currentStep].id === "actions" && (
            <WizardStepActions
              template={template}
              state={wizardState.actions}
              brandingId={wizardState.prerequisites.selectedBranding}
              onUpdate={(data) => updateWizardState("actions", data)}
            />
          )}

          {STEPS[currentStep].id === "review" && (
            <WizardStepReview
              template={template}
              wizardState={wizardState}
            />
          )}
        </div>

        {/* Validation Message */}
        {!canGoNext && currentStep < STEPS.length - 1 && (
          <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 p-3 text-sm text-orange-700 dark:text-orange-300">
            <WarningCircle className="h-4 w-4" />
            <span>Complétez tous les champs requis pour continuer</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoPrevious || loading}
          >
            <CaretLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext} disabled={!canGoNext || loading}>
                Suivant
                <CaretRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={!canGoNext || loading}>
                {loading ? (
                  <>
                    <CircleNotch className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Créer le workflow
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
