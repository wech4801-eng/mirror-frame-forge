import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaperPlaneTilt, Bell, Tag, UserMinus } from "@phosphor-icons/react";

const actionIcons = {
  'send_email': PaperPlaneTilt,
  'send_notification': Bell,
  'add_tag': Tag,
  'remove_from_group': UserMinus,
};

export const ActionNode = ({ data }: any) => {
  const Icon = actionIcons[data.actionType as keyof typeof actionIcons] || PaperPlaneTilt;

  return (
    <div>
      <Handle type="target" position={Position.Top} className="!bg-accent" />
      <Handle type="source" position={Position.Bottom} className="!bg-accent" />
      <Card className="min-w-[280px] p-4 border-2 border-accent bg-gradient-to-br from-accent/10 to-accent/5 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="mb-1 bg-accent/10">
              Action
            </Badge>
            <h4 className="font-bold text-sm">{data.label}</h4>
          </div>
        </div>
        {data.description && (
          <p className="text-xs text-muted-foreground mt-2">{data.description}</p>
        )}
        {data.config && (
          <div className="mt-3 pt-3 border-t">
            {data.config.template && (
              <p className="text-xs">
                <span className="font-semibold">Template:</span> {data.config.template}
              </p>
            )}
            {data.config.group && (
              <p className="text-xs">
                <span className="font-semibold">Groupe:</span> {data.config.group}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};