import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useValidation, ValidationResult } from "@/hooks/useValidation";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CampaignValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  populationIds: string[];
  templateId?: string;
  workflowId?: string;
}

export const CampaignValidationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  populationIds,
  templateId,
  workflowId,
}: CampaignValidationDialogProps) => {
  const { validateCampaignLaunch } = useValidation();
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      checkValidation();
    }
  }, [open, populationIds, templateId, workflowId]);

  const checkValidation = async () => {
    setLoading(true);
    try {
      const result = await validateCampaignLaunch(populationIds, templateId, workflowId);
      setValidation(result);
    } catch (error) {
      console.error("Error validating campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (validation?.isValid) {
      onConfirm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Validation de la campagne</DialogTitle>
          <DialogDescription>
            Vérification de la configuration avant le lancement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : validation ? (
            <>
              {/* Résumé */}
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Résumé
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground ml-7">
                  <li>• Destinataires : {populationIds.length}</li>
                  {templateId && <li>• Template : Sélectionné</li>}
                  {workflowId && <li>• Workflow : Sélectionné</li>}
                </ul>
              </div>

              {/* Erreurs */}
              {validation.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">Erreurs bloquantes</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.errors.map((error, idx) => (
                        <li key={idx} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Avertissements */}
              {validation.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">Avertissements</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Succès */}
              {validation.isValid && validation.warnings.length === 0 && (
                <Alert className="border-primary/20 bg-primary/5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    Tout est prêt ! Vous pouvez lancer votre campagne.
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!validation?.isValid || loading}
          >
            {validation?.warnings.length ? "Confirmer malgré les avertissements" : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
