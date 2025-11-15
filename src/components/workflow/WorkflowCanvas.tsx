import { useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import { ConditionNode } from './nodes/ConditionNode';
import { DelayNode } from './nodes/DelayNode';

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
}

export const WorkflowCanvas = ({ 
  initialNodes = [], 
  initialEdges = [],
  onNodesChange,
  onEdgesChange
}: WorkflowCanvasProps) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);

  // Synchroniser avec les nodes/edges externes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => {
        const newEdges = addEdge({ ...params, animated: true }, eds);
        onEdgesChange?.(newEdges);
        return newEdges;
      });
    },
    [setEdges, onEdgesChange]
  );

  const handleNodesChange = useCallback((changes: any) => {
    onNodesChangeInternal(changes);
    // Delay to ensure state is updated
    setTimeout(() => {
      setNodes((nds) => {
        onNodesChange?.(nds);
        return nds;
      });
    }, 0);
  }, [onNodesChangeInternal, onNodesChange, setNodes]);

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChangeInternal(changes);
    setTimeout(() => {
      setEdges((eds) => {
        onEdgesChange?.(eds);
        return eds;
      });
    }, 0);
  }, [onEdgesChangeInternal, onEdgesChange, setEdges]);

  return (
    <div className="h-full w-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};