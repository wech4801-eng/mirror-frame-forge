import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OnboardingStep {
  id: string;
  name: string;
  route: string;
  completed: boolean;
  description: string;
}

export const useOnboardingStatus = () => {
  const [steps, setSteps] = useState<OnboardingStep[]>([
    { id: "prospects", name: "Prospects", route: "/prospects", completed: false, description: "Ajoutez vos premiers prospects" },
    { id: "branding", name: "Branding", route: "/branding", completed: false, description: "Créez votre identité visuelle" },
    { id: "templates", name: "Templates", route: "/mail", completed: false, description: "Créez vos templates d'emails" },
    { id: "workflows", name: "Workflows", route: "/workflow", completed: false, description: "Automatisez vos actions" },
    { id: "campaigns", name: "Campagnes", route: "/campaigns", completed: false, description: "Lancez vos campagnes" },
  ]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUser(user.id);

      // Vérifier chaque étape
      const [prospectsData, brandingData, templatesData, workflowsData, campaignsData] = await Promise.all([
        supabase.from("prospects").select("id").eq("user_id", user.id).limit(1),
        supabase.from("brandings").select("id").eq("user_id", user.id).limit(1),
        supabase.from("email_templates").select("id").eq("user_id", user.id).limit(1),
        supabase.from("workflows").select("id").eq("user_id", user.id).limit(1),
        supabase.from("email_campaigns").select("id").eq("user_id", user.id).limit(1),
      ]);

      setSteps([
        { 
          id: "prospects", 
          name: "Prospects", 
          route: "/prospects", 
          completed: (prospectsData.data?.length ?? 0) > 0,
          description: "Ajoutez vos premiers prospects"
        },
        { 
          id: "branding", 
          name: "Branding", 
          route: "/branding", 
          completed: (brandingData.data?.length ?? 0) > 0,
          description: "Créez votre identité visuelle"
        },
        { 
          id: "templates", 
          name: "Templates", 
          route: "/mail", 
          completed: (templatesData.data?.length ?? 0) > 0,
          description: "Créez vos templates d'emails"
        },
        { 
          id: "workflows", 
          name: "Workflows", 
          route: "/workflow", 
          completed: (workflowsData.data?.length ?? 0) > 0,
          description: "Automatisez vos actions"
        },
        { 
          id: "campaigns", 
          name: "Campagnes", 
          route: "/campaigns", 
          completed: (campaignsData.data?.length ?? 0) > 0,
          description: "Lancez vos campagnes"
        },
      ]);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNextIncompleteStep = (): OnboardingStep | null => {
    return steps.find(step => !step.completed) || null;
  };

  const getCompletionPercentage = (): number => {
    const completedCount = steps.filter(step => step.completed).length;
    return Math.round((completedCount / steps.length) * 100);
  };

  const isStepAccessible = (stepId: string): boolean => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === 0) return true; // Première étape toujours accessible
    
    // Vérifier que toutes les étapes précédentes sont complétées
    for (let i = 0; i < stepIndex; i++) {
      if (!steps[i].completed) return false;
    }
    return true;
  };

  return {
    steps,
    loading,
    currentUser,
    getNextIncompleteStep,
    getCompletionPercentage,
    isStepAccessible,
    refetch: checkOnboardingStatus,
  };
};
