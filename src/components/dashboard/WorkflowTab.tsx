import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlowArrow as Workflow, Plus, FloppyDisk, Play, Pause, Trash } from "@phosphor-icons/react";
import { WorkflowCanvas } from '../workflow/WorkflowCanvas';
import { NodeLibrary } from '../workflow/NodeLibrary';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Node, Edge, ReactFlowProvider } from 'reactflow';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const WorkflowTab = () => {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [nodeCounter, setNodeCounter] = useState(1);

  useEffect(() => {
    fetchWorkflows();
  }, []);

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

      setWorkflows([data, ...workflows]);
      setCurrentWorkflow(data);
      setWorkflowName('');
      setWorkflowDescription('');
      setCreateDialogOpen(false);
      setNodes([]);
      setEdges([]);
      setNodeCounter(1);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveWorkflow = async () => {
    if (!currentWorkflow) return;

    try {
      const { error } = await supabase
        .from('workflows')
        .update({
          nodes: nodes as any,
          edges: edges as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentWorkflow.id);

      if (error) throw error;

      toast({
        title: 'Workflow sauvegardé',
        description: 'Le workflow a été sauvegardé avec succès',
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
      if (currentWorkflow?.id === workflowId) {
        setCurrentWorkflow({ ...currentWorkflow, is_active: !isActive });
      }
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
      if (currentWorkflow?.id === workflowId) {
        setCurrentWorkflow(null);
        setNodes([]);
        setEdges([]);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLoadWorkflow = (workflow: any) => {
    setCurrentWorkflow(workflow);
    setNodes(workflow.nodes || []);
    setEdges(workflow.edges || []);
    setNodeCounter((workflow.nodes?.length || 0) + 1);
  };

  const handleAddNode = useCallback(
    (nodeConfig: any) => {
      const newNode: Node = {
        id: `node-${nodeCounter}`,
        type: nodeConfig.type,
        position: { x: 250, y: nodes.length * 150 + 50 },
        data: {
          label: nodeConfig.data?.label || nodeConfig.label || 'Nouveau bloc',
          description: nodeConfig.description || '',
          ...nodeConfig.data,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setNodeCounter((c) => c + 1);
    },
    [nodeCounter, nodes.length]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      try {
        const nodeConfig = JSON.parse(type);
        handleAddNode(nodeConfig);
      } catch (error) {
        console.error('Error parsing node data:', error);
      }
    },
    [handleAddNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="space-y-6 h-full">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              <div>
                <CardTitle>Workflow Builder</CardTitle>
                <CardDescription>
                  Créez des automatisations pour vos campagnes
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Workflow
              </Button>
              {currentWorkflow && (
                <>
                  <Button variant="outline" onClick={handleSaveWorkflow}>
                    <FloppyDisk className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button
                    variant={currentWorkflow.is_active ? 'destructive' : 'default'}
                    onClick={() => handleToggleActive(currentWorkflow.id, currentWorkflow.is_active)}
                  >
                    {currentWorkflow.is_active ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Activer
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {workflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Workflows existants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workflows.map((workflow) => (
                <Card
                  key={workflow.id}
                  className={`cursor-pointer transition-all ${
                    currentWorkflow?.id === workflow.id
                      ? 'ring-2 ring-primary'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleLoadWorkflow(workflow)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{workflow.name}</h4>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(workflow.id, workflow.is_active);
                          }}
                        >
                          {workflow.is_active ? (
                            <Pause className="h-4 w-4 text-green-600" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWorkflow(workflow.id);
                          }}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {workflow.description && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {workflow.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          workflow.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {workflow.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      <span className="text-muted-foreground">
                        {workflow.nodes?.length || 0} blocs
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentWorkflow ? (
        <div className="grid grid-cols-[1fr_300px] gap-6 h-[calc(100vh-400px)]">
          <Card className="overflow-hidden">
            <CardContent className="p-0 h-full" onDrop={onDrop} onDragOver={onDragOver}>
              <ReactFlowProvider>
                <WorkflowCanvas
                  initialNodes={nodes}
                  initialEdges={edges}
                  onNodesChange={setNodes}
                  onEdgesChange={setEdges}
                />
              </ReactFlowProvider>
            </CardContent>
          </Card>

          <NodeLibrary onAddNode={handleAddNode} />
        </div>
      ) : (
        <Card>
          <CardContent className="py-20 text-center text-muted-foreground">
            {workflows.length === 0 ? (
              <>
                <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Aucun workflow créé</p>
                <p className="text-sm">
                  Créez votre premier workflow pour commencer les automatisations
                </p>
              </>
            ) : (
              <>
                <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Sélectionnez un workflow pour commencer</p>
              </>
            )}
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
  );
};

export default WorkflowTab;
