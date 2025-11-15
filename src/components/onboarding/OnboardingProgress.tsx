import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const OnboardingProgress = () => {
  const { steps, getCompletionPercentage, getNextIncompleteStep, loading } = useOnboardingStatus();
  const navigate = useNavigate();
  const nextStep = getNextIncompleteStep();
  const percentage = getCompletionPercentage();

  if (loading) return null;

  // Ne pas afficher si tout est complété
  if (percentage === 100) return null;

  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Configuration de votre compte</h3>
            <p className="text-sm text-muted-foreground">
              Complétez ces étapes pour commencer à utiliser toutes les fonctionnalités
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{percentage}%</div>
            <div className="text-xs text-muted-foreground">Complété</div>
          </div>
        </div>

        <Progress value={percentage} className="h-2" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-2 p-3 rounded-lg transition-colors ${
                step.completed
                  ? "bg-primary/10 border border-primary/20"
                  : index === 0 || steps[index - 1]?.completed
                  ? "bg-background border border-border hover:bg-accent/5"
                  : "bg-muted/30 border border-muted opacity-60"
              }`}
            >
              <div className="mt-0.5">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{step.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {nextStep && (
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Prochaine étape : <span className="font-medium text-foreground">{nextStep.name}</span>
            </p>
            <Button onClick={() => navigate(nextStep.route)} size="sm">
              Continuer
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
