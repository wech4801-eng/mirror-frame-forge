import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightning, UserPlus, EnvelopeSimple, Cursor, CreditCard } from "@phosphor-icons/react";

const triggerIcons = {
  'new_prospect': UserPlus,
  'email_opened': EnvelopeSimple,
  'link_clicked': Cursor,
  'no_payment': CreditCard,
};

export const TriggerNode = ({ data }: any) => {
  const Icon = triggerIcons[data.triggerType as keyof typeof triggerIcons] || Lightning;

  return (
    <div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
      <Card className="min-w-[280px] p-4 border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <Badge variant="secondary" className="mb-1">
              <Lightning className="w-3 h-3 mr-1" />
              Déclencheur
            </Badge>
            <h4 className="font-bold text-sm">{data.label}</h4>
          </div>
        </div>
        {data.description && (
          <p className="text-xs text-muted-foreground mt-2">{data.description}</p>
        )}
      </Card>
    </div>
  );
};