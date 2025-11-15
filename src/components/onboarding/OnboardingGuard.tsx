import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

interface OnboardingGuardProps {
  children: React.ReactNode;
  currentStepId: string;
}

export const OnboardingGuard = ({ children, currentStepId }: OnboardingGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { steps, loading, isStepAccessible, getNextIncompleteStep } = useOnboardingStatus();

  useEffect(() => {
    if (loading) return;

    // Ne pas rediriger si on est déjà sur la page d'authentification ou le dashboard
    if (location.pathname === "/auth" || location.pathname === "/dashboard" || location.pathname === "/") {
      return;
    }

    // Vérifier si l'étape actuelle est accessible
    const canAccess = isStepAccessible(currentStepId);
    
    if (!canAccess) {
      // Rediriger vers la prochaine étape incomplète
      const nextStep = getNextIncompleteStep();
      if (nextStep && nextStep.route !== location.pathname) {
        navigate(nextStep.route, { replace: true });
      }
    }
  }, [loading, currentStepId, isStepAccessible, getNextIncompleteStep, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
