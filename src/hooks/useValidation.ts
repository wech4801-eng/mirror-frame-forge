import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { predefinedTemplates } from "@/components/mail/predefinedTemplates";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/** Check if a template ID exists (DB or predefined) */
const templateExists = async (templateId: string): Promise<boolean> => {
  // Check predefined templates first
  const isPredefined = predefinedTemplates.some((t) => t.id === templateId);
  if (isPredefined) return true;

  // Check DB templates
  const { data } = await supabase
    .from("email_templates")
    .select("id")
    .eq("id", templateId)
    .maybeSingle();

  return !!data;
};

export const useValidation = () => {
  const [hasBranding, setHasBranding] = useState(false);
  const [hasTemplates, setHasTemplates] = useState(false);
  const [hasWorkflows, setHasWorkflows] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkResources();
  }, []);

  const checkResources = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [brandingData, templatesData, workflowsData] = await Promise.all([
        supabase.from("brandings").select("id").eq("user_id", user.id).limit(1),
        supabase.from("email_templates").select("id").eq("user_id", user.id).limit(1),
        supabase.from("workflows").select("id").eq("user_id", user.id).limit(1),
      ]);

      setHasBranding((brandingData.data?.length ?? 0) > 0);
      // User has templates if they have DB templates OR predefined templates exist
      setHasTemplates((templatesData.data?.length ?? 0) > 0 || predefinedTemplates.length > 0);
      setHasWorkflows((workflowsData.data?.length ?? 0) > 0);
    } catch (error) {
      console.error("Error checking resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateTemplateCreation = (): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!hasBranding) {
      errors.push("Vous devez créer au moins un branding avant de créer un template");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  const validateWorkflowActivation = async (workflowId: string): Promise<ValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const { data: workflow } = await supabase
        .from("workflows")
        .select("nodes")
        .eq("id", workflowId)
        .single();

      if (workflow?.nodes) {
        const nodes = workflow.nodes as any[];
        const emailNodes = nodes.filter(n => n.type === "action" && n.data?.actionType === "send_email");

        for (const node of emailNodes) {
          const templateId = node.data?.templateId;
          if (templateId) {
            const exists = await templateExists(templateId);
            if (!exists) {
              errors.push(`Le template ${templateId} n'existe plus`);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error validating workflow:", error);
      errors.push("Erreur lors de la validation du workflow");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  const validateCampaignLaunch = async (
    populationIds: string[],
    templateId?: string,
    workflowId?: string
  ): Promise<ValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (populationIds.length === 0) {
      errors.push("Vous devez sélectionner au moins un prospect ou groupe");
    }

    if (!templateId && !workflowId) {
      errors.push("Vous devez sélectionner un template ou un workflow");
    }

    if (templateId) {
      const exists = await templateExists(templateId);
      if (!exists) {
        errors.push("Le template sélectionné n'existe plus");
      }
    }

    if (workflowId) {
      const workflowValidation = await validateWorkflowActivation(workflowId);
      errors.push(...workflowValidation.errors);
      warnings.push(...workflowValidation.warnings);
    }

    // Vérifier la limite d'envoi quotidienne (exemple: 1000)
    const dailyLimit = 1000;
    if (populationIds.length > dailyLimit) {
      warnings.push(`Attention : vous allez envoyer ${populationIds.length} emails, limite quotidienne: ${dailyLimit}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  return {
    loading,
    hasBranding,
    hasTemplates,
    hasWorkflows,
    validateTemplateCreation,
    validateWorkflowActivation,
    validateCampaignLaunch,
    refetch: checkResources,
  };
};
