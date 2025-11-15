import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Workflow as WorkflowIcon, Plus, Library } from "lucide-react";
import { WorkflowsList } from "@/components/workflow/WorkflowsList";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";

const Workflow = () => {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchWorkflows();
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('workflows')
        .insert({
          user_id: user.id,
          name: workflowName,
          description: workflowDescription,
          nodes: [],
          edges: [],
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Workflow créé',
        description: 'Le workflow a été créé avec succès',
      });

      setWorkflowName('');
      setWorkflowDescription('');
      setCreateDialogOpen(false);
      navigate(`/workflow/${data.id}`);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (workflowId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({ is_active: !isActive })
        .eq('id', workflowId);

      if (error) throw error;

      toast({
        title: isActive ? 'Workflow désactivé' : 'Workflow activé',
        description: `Le workflow est maintenant ${!isActive ? 'actif' : 'inactif'}`,
      });

      fetchWorkflows();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;

      toast({
        title: 'Workflow supprimé',
        description: 'Le workflow a été supprimé avec succès',
      });

      fetchWorkflows();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <OnboardingGuard currentStepId="workflows">
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <OnboardingProgress />
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WorkflowIcon className="h-5 w-5" />
                  <div>
                    <CardTitle>Workflows</CardTitle>
                    <CardDescription>
                      Gérez vos automatisations de campagnes
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate('/workflow/library')}>
                    <Library className="h-4 w-4 mr-2" />
                    Bibliothèque
                  </Button>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Workflow
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {workflows.length > 0 ? (
            <WorkflowsList
              workflows={workflows}
              onToggleActive={handleToggleActive}
              onDelete={handleDeleteWorkflow}
            />
          ) : (
            <Card>
              <CardContent className="py-20 text-center text-muted-foreground">
                <WorkflowIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Aucun workflow créé</p>
                <p className="text-sm mb-4">
                  Créez votre premier workflow ou explorez notre bibliothèque de 20 workflows prêts à l'emploi
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => navigate('/workflow/library')}>
                    <Library className="h-4 w-4 mr-2" />
                    Bibliothèque de workflows
                  </Button>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
        )}

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau workflow</DialogTitle>
              <DialogDescription>
                Donnez un nom et une description à votre workflow
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du workflow</Label>
                <Input
                  id="name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Ex: Relance après inscription"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Input
                  id="description"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Ex: Envoie un email 3 jours après l'inscription"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateWorkflow} disabled={!workflowName}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  </OnboardingGuard>
  );
};

export default Workflow;
