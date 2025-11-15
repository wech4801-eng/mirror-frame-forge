import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from "@phosphor-icons/react";

export const DelayNode = ({ data }: any) => {
  return (
    <div>
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
      <Card className="min-w-[280px] p-4 border-2 border-muted-foreground bg-gradient-to-br from-muted/30 to-muted/10 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="mb-1">
              Délai
            </Badge>
            <h4 className="font-bold text-sm">{data.label}</h4>
          </div>
        </div>
        {data.config?.delay && (
          <div className="mt-3 pt-3 border-t text-center">
            <p className="text-2xl font-bold text-primary">{data.config.delay}</p>
            <p className="text-xs text-muted-foreground">{data.config.unit || 'jours'}</p>
          </div>
        )}
      </Card>
    </div>
  );
};