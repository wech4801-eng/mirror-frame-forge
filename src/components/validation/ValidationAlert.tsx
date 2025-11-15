import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WarningCircle, Warning, Info } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ValidationAlertProps {
  type: "error" | "warning" | "info";
  title: string;
  messages: string[];
  actionLabel?: string;
  actionRoute?: string;
  onAction?: () => void;
}

export const ValidationAlert = ({
  type,
  title,
  messages,
  actionLabel,
  actionRoute,
  onAction,
}: ValidationAlertProps) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionRoute) {
      navigate(actionRoute);
    }
  };

  const Icon = type === "error" ? WarningCircle : type === "warning" ? Warning : Info;
  const variant = type === "error" ? "destructive" : type === "warning" ? "default" : "default";

  return (
    <Alert variant={variant} className="mb-6">
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <ul className="list-disc list-inside space-y-1">
          {messages.map((msg, idx) => (
            <li key={idx} className="text-sm">
              {msg}
            </li>
          ))}
        </ul>
        {(actionLabel || actionRoute) && (
          <div className="mt-3">
            <Button
              variant={type === "error" ? "default" : "outline"}
              size="sm"
              onClick={handleAction}
            >
              {actionLabel || "Corriger"}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
