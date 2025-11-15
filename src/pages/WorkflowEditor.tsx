import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloppyDisk, Play, Pause, ArrowLeft } from "@phosphor-icons/react";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { NodeLibrary } from "@/components/workflow/NodeLibrary";
import { useToast } from "@/hooks/use-toast";
import { Node, Edge, ReactFlowProvider } from "reactflow";

const WorkflowEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState<any>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeCounter, setNodeCounter] = useState(1);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      if (id) {
        fetchWorkflow();
      } else {
        setLoading(false);
      }
    });
  }, [id, navigate]);

  const fetchWorkflow = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setWorkflow(data);
      setNodes((data.nodes as unknown as Node[]) || []);
      setEdges((data.edges as unknown as Edge[]) || []);
      setNodeCounter(((data.nodes as unknown as Node[])?.length || 0) + 1);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/workflow');
    }
  };

  const handleSaveWorkflow = async () => {
    if (!workflow) return;

    try {
      const { error } = await supabase
        .from('workflows')
        .update({
          nodes: nodes as any,
          edges: edges as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workflow.id);

      if (error) throw error;

      toast({
        title: 'Workflow sauvegardé',
        description: 'Le workflow a été sauvegardé avec succès',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async () => {
    if (!workflow) return;

    try {
      const { error } = await supabase
        .from('workflows')
        .update({ is_active: !workflow.is_active })
        .eq('id', workflow.id);

      if (error) throw error;

      toast({
        title: workflow.is_active ? 'Workflow désactivé' : 'Workflow activé',
        description: `Le workflow est maintenant ${!workflow.is_active ? 'actif' : 'inactif'}`,
      });

      setWorkflow({ ...workflow, is_active: !workflow.is_active });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddNode = useCallback(
    (nodeConfig: any) => {
      const newNode: Node = {
        id: `node-${nodeCounter}`,
        type: nodeConfig.type,
        position: { x: 250, y: nodes.length * 100 + 50 },
        data: {
          label: nodeConfig.label,
          description: nodeConfig.description,
          icon: nodeConfig.icon,
          ...nodeConfig.data,
        },
      };

      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
      setNodeCounter((c) => c + 1);
    },
    [nodeCounter, nodes]
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 h-full p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/workflow')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{workflow?.name || 'Nouveau Workflow'}</h1>
              {workflow?.description && (
                <p className="text-sm text-muted-foreground">{workflow.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveWorkflow}>
              <FloppyDisk className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            {workflow && (
              <Button
                variant={workflow.is_active ? 'destructive' : 'default'}
                onClick={handleToggleActive}
              >
                {workflow.is_active ? (
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
            )}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_300px] gap-6 h-[calc(100vh-200px)]">
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
      </div>
    </DashboardLayout>
  );
};

export default WorkflowEditor;
