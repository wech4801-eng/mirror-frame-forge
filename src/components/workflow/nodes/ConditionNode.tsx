import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch } from "@phosphor-icons/react";

export const ConditionNode = ({ data }: any) => {
  return (
    <div>
      <Handle type="target" position={Position.Top} className="!bg-secondary" />
      <Handle type="source" position={Position.Bottom} id="yes" className="!bg-green-500" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="no" className="!bg-red-500" style={{ left: '70%' }} />
      <Card className="min-w-[280px] p-4 border-2 border-secondary bg-gradient-to-br from-secondary/10 to-secondary/5 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="mb-1 bg-secondary/10">
              Condition
            </Badge>
            <h4 className="font-bold text-sm">{data.label}</h4>
          </div>
        </div>
        {data.description && (
          <p className="text-xs text-muted-foreground mt-2">{data.description}</p>
        )}
        <div className="flex justify-between mt-3 pt-3 border-t text-xs">
          <span className="text-green-600 font-semibold">✓ Oui</span>
          <span className="text-red-600 font-semibold">✗ Non</span>
        </div>
      </Card>
    </div>
  );
};