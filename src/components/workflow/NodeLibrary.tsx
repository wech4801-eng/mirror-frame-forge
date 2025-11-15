import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Zap, Send, GitBranch, Clock, UserPlus, Mail, MousePointer, CreditCard, Bell, Tag, UserX } from 'lucide-react';
import { Node } from 'reactflow';

interface NodeLibraryProps {
  onAddNode: (node: Partial<Node>) => void;
}

export const NodeLibrary = ({ onAddNode }: NodeLibraryProps) => {
  const triggers = [
    {
      id: 'new_prospect',
      label: 'Nouveau prospect',
      icon: UserPlus,
      description: 'Déclenché quand un nouveau prospect s\'inscrit',
      type: 'trigger',
      data: { triggerType: 'new_prospect' }
    },
    {
      id: 'email_opened',
      label: 'Email ouvert',
      icon: Mail,
      description: 'Déclenché quand un prospect ouvre un email',
      type: 'trigger',
      data: { triggerType: 'email_opened' }
    },
    {
      id: 'link_clicked',
      label: 'Lien cliqué',
      icon: MousePointer,
      description: 'Déclenché quand un lien est cliqué',
      type: 'trigger',
      data: { triggerType: 'link_clicked' }
    },
    {
      id: 'no_payment',
      label: 'Pas de paiement',
      icon: CreditCard,
      description: 'Déclenché après X jours sans paiement',
      type: 'trigger',
      data: { triggerType: 'no_payment' }
    },
  ];

  const actions = [
    {
      id: 'send_email',
      label: 'Envoyer un email',
      icon: Send,
      description: 'Envoie un email à partir d\'un template',
      type: 'action',
      data: { actionType: 'send_email' }
    },
    {
      id: 'send_notification',
      label: 'Envoyer notification',
      icon: Bell,
      description: 'Envoie une notification interne',
      type: 'action',
      data: { actionType: 'send_notification' }
    },
    {
      id: 'add_tag',
      label: 'Ajouter un tag',
      icon: Tag,
      description: 'Ajoute un tag au prospect',
      type: 'action',
      data: { actionType: 'add_tag' }
    },
    {
      id: 'remove_from_group',
      label: 'Retirer du groupe',
      icon: UserX,
      description: 'Retire le prospect d\'un groupe',
      type: 'action',
      data: { actionType: 'remove_from_group' }
    },
  ];

  const conditions = [
    {
      id: 'check_status',
      label: 'Vérifier statut',
      icon: GitBranch,
      description: 'Vérifie le statut du prospect',
      type: 'condition',
      data: {}
    },
    {
      id: 'check_group',
      label: 'Vérifier groupe',
      icon: GitBranch,
      description: 'Vérifie si le prospect est dans un groupe',
      type: 'condition',
      data: {}
    },
  ];

  const delays = [
    {
      id: 'wait',
      label: 'Attendre',
      icon: Clock,
      description: 'Attendre un certain temps',
      type: 'delay',
      data: { config: { delay: 3, unit: 'jours' } }
    },
  ];

  const handleDragStart = (event: React.DragEvent, nodeConfig: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeConfig));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Bibliothèque
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['triggers', 'actions']}>
          <AccordionItem value="triggers">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Déclencheurs ({triggers.length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {triggers.map((trigger) => {
                  const Icon = trigger.icon;
                  return (
                    <div
                      key={trigger.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, { ...trigger, position: { x: 0, y: 0 } })}
                      className="cursor-move"
                    >
                      <Card className="p-3 hover:bg-accent/50 transition-colors border-2 border-primary/20">
                        <div className="flex items-start gap-2">
                          <Icon className="h-4 w-4 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{trigger.label}</p>
                            <p className="text-xs text-muted-foreground">{trigger.description}</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="actions">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-accent" />
                Actions ({actions.length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, { ...action, position: { x: 0, y: 0 } })}
                      className="cursor-move"
                    >
                      <Card className="p-3 hover:bg-accent/50 transition-colors border-2 border-accent/20">
                        <div className="flex items-start gap-2">
                          <Icon className="h-4 w-4 text-accent mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{action.label}</p>
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="conditions">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-secondary" />
                Conditions ({conditions.length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {conditions.map((condition) => {
                  const Icon = condition.icon;
                  return (
                    <div
                      key={condition.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, { ...condition, position: { x: 0, y: 0 } })}
                      className="cursor-move"
                    >
                      <Card className="p-3 hover:bg-accent/50 transition-colors border-2 border-secondary/20">
                        <div className="flex items-start gap-2">
                          <Icon className="h-4 w-4 text-secondary mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{condition.label}</p>
                            <p className="text-xs text-muted-foreground">{condition.description}</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="delays">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Délais ({delays.length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {delays.map((delay) => {
                  const Icon = delay.icon;
                  return (
                    <div
                      key={delay.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, { ...delay, position: { x: 0, y: 0 } })}
                      className="cursor-move"
                    >
                      <Card className="p-3 hover:bg-accent/50 transition-colors border-2 border-muted/20">
                        <div className="flex items-start gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{delay.label}</p>
                            <p className="text-xs text-muted-foreground">{delay.description}</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};