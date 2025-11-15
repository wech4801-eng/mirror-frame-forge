import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow } from "lucide-react";

const WorkflowTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            <CardTitle>Workflows Automatisés</CardTitle>
          </div>
          <CardDescription>
            Gérez vos automatisations et workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fonctionnalité à venir...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowTab;
