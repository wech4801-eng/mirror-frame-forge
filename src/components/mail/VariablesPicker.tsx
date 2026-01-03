import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EMAIL_VARIABLES } from "@/lib/emailVariables";
import { Copy, Check } from "@phosphor-icons/react";
import { useState } from "react";

interface VariablesPickerProps {
  onVariableClick: (variable: string) => void;
}

export const VariablesPicker = ({ onVariableClick }: VariablesPickerProps) => {
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

  const handleCopy = (variable: string) => {
    navigator.clipboard.writeText(variable);
    onVariableClick(variable);
    setCopiedVariable(variable);
    setTimeout(() => setCopiedVariable(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Variables disponibles</CardTitle>
        <CardDescription className="text-xs">
          Cliquez pour copier une variable dans votre template
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm mb-3">Champs du prospect</h3>
            {EMAIL_VARIABLES.prospect_fields.map((variable) => (
              <div
                key={variable.key}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => handleCopy(variable.key)}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{variable.label}</div>
                  <div className="text-xs text-muted-foreground">{variable.description}</div>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1 inline-block">
                    {variable.key}
                  </code>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(variable.key);
                  }}
                >
                  {copiedVariable === variable.key ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
