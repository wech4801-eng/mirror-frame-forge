import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { workflowTemplates } from "@/lib/workflowTemplates";
import * as Icons from "lucide-react";
import { Loader2 } from "lucide-react";

const WorkflowLibrary = () => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = {
    onboarding: { label: "Onboarding", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
    nurturing: { label: "Nurturing", color: "bg-green-500/10 text-green-700 dark:text-green-300" },
    reengagement: { label: "Réengagement", color: "bg-orange-500/10 text-orange-700 dark:text-orange-300" },
    qualification: { label: "Qualification", color: "bg-purple-500/10 text-purple-700 dark:text-purple-300" },
    customer_success: { label: "Customer Success", color: "bg-pink-500/10 text-pink-700 dark:text-pink-300" },
    compliance: { label: "Conformité", color: "bg-gray-500/10 text-gray-700 dark:text-gray-300" }
  };

  const handleUseTemplate = async (template: typeof workflowTemplates[0], index: number) => {
    setLoadingId(`${index}`);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Create a new workflow from template
      const { data: workflow, error } = await supabase
        .from("workflows")
        .insert({
          user_id: user.id,
          name: template.name,
          description: template.description,
          nodes: [],
          edges: [],
          is_active: false
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Workflow créé",
        description: `Le template "${template.name}" a été ajouté à vos workflows. Vous pouvez maintenant le personnaliser.`,
      });

      // Navigate to workflow editor
      navigate(`/workflow/${workflow.id}`);
    } catch (error) {
      console.error("Error creating workflow from template:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le workflow. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <Icons.Workflow className="h-5 w-5" />;
  };

  const filterByCategory = (category: string) => {
    if (category === "all") return workflowTemplates;
    return workflowTemplates.filter(t => t.category === category);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bibliothèque de Workflows</h1>
          <p className="text-muted-foreground mt-2">
            20 workflows prêts à l'emploi pour automatiser votre marketing et vos ventes
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">Tous ({workflowTemplates.length})</TabsTrigger>
            {Object.entries(categories).map(([key, { label }]) => (
              <TabsTrigger key={key} value={key}>
                {label} ({filterByCategory(key).length})
              </TabsTrigger>
            ))}
          </TabsList>

          {["all", ...Object.keys(categories)].map(category => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByCategory(category).map((template, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {getIcon(template.icon)}
                          </div>
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <Badge 
                              variant="secondary" 
                              className={`mt-1 ${categories[template.category].color}`}
                            >
                              {categories[template.category].label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="min-h-[40px]">
                        {template.description}
                      </CardDescription>

                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          <strong>Déclencheur:</strong> {template.trigger_config.type === 'event' ? 'Événement' : template.trigger_config.type === 'time' ? 'Planifié' : 'Segment'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <strong>Actions:</strong> {template.actions_config.length} étapes
                        </div>
                        {template.variables && template.variables.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <strong>Variables:</strong> {template.variables.slice(0, 3).join(", ")}
                            {template.variables.length > 3 && "..."}
                          </div>
                        )}
                        {template.safeguards && Object.keys(template.safeguards).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.safeguards.stop_on_reply && (
                              <Badge variant="outline" className="text-xs">Stop si réponse</Badge>
                            )}
                            {template.safeguards.quiet_hours && (
                              <Badge variant="outline" className="text-xs">Heures calmes</Badge>
                            )}
                            {template.safeguards.frequency_cap && (
                              <Badge variant="outline" className="text-xs">
                                Max {template.safeguards.frequency_cap}/jour
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleUseTemplate(template, index)}
                        disabled={loadingId === `${index}`}
                      >
                        {loadingId === `${index}` ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Création...
                          </>
                        ) : (
                          "Utiliser ce workflow"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default WorkflowLibrary;
