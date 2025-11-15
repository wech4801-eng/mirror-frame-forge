import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WarningCircle, Warning } from "@phosphor-icons/react";
import { validateVariables } from "@/lib/emailVariables";

interface TemplateValidationBannerProps {
  content: string;
}

export const TemplateValidationBanner = ({ content }: TemplateValidationBannerProps) => {
  const validation = validateVariables(content);

  if (validation.valid) {
    return null;
  }

  return (
    <div className="space-y-2">
      {validation.missing.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Variables obligatoires manquantes</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2">
              {validation.missing.map((v) => (
                <li key={v}>
                  <code className="bg-destructive/20 px-1 py-0.5 rounded text-xs">{v}</code>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.invalid.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Variables non reconnues</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Les variables suivantes ne sont pas valides :</p>
            <ul className="list-disc list-inside">
              {validation.invalid.map((v) => (
                <li key={v}>
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">{v}</code>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
