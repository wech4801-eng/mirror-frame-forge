import { useValidation } from "@/hooks/useValidation";
import { ValidationAlert } from "./ValidationAlert";

interface TemplateValidationGuardProps {
  children: React.ReactNode;
  onValidationFailed?: () => void;
}

export const TemplateValidationGuard = ({
  children,
  onValidationFailed,
}: TemplateValidationGuardProps) => {
  const { validateTemplateCreation, loading } = useValidation();

  if (loading) return null;

  const validation = validateTemplateCreation();

  if (!validation.isValid) {
    return (
      <ValidationAlert
        type="error"
        title="Configuration requise"
        messages={validation.errors}
        actionLabel="Créer un branding"
        actionRoute="/branding"
        onAction={onValidationFailed}
      />
    );
  }

  return <>{children}</>;
};
