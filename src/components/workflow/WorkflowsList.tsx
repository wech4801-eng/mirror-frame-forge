import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  nodes: any;
}

interface WorkflowsListProps {
  workflows: Workflow[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

export const WorkflowsList = ({ workflows, onToggleActive, onDelete }: WorkflowsListProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workflows.map((workflow) => (
        <Card
          key={workflow.id}
          className="hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate(`/workflow/${workflow.id}`)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-lg">{workflow.name}</h3>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive(workflow.id, workflow.is_active);
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
                    navigate(`/workflow/${workflow.id}`);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(workflow.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            {workflow.description && (
              <p className="text-sm text-muted-foreground mb-3">
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
  );
};
