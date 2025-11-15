import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PencilSimple, Trash, Eye, Sparkle } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  created_at: string;
  updated_at: string;
  category?: string;
  isPredefined?: boolean;
}

interface TemplateCardProps {
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
  onDelete: () => void;
  onPreview: (template: EmailTemplate) => void;
}

const TemplateCard = ({ template, onEdit, onDelete, onPreview }: TemplateCardProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Template supprimé",
        description: "Le template a été supprimé avec succès",
      });

      onDelete();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              {template.isPredefined && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkle className="h-3 w-3 mr-1" />
                  Prédéfini
                </Badge>
              )}
              {template.category && (
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1">{template.subject}</CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onPreview(template)}>
              <Eye className="h-4 w-4" />
            </Button>
            {!template.isPredefined && (
              <>
                <Button variant="ghost" size="icon" onClick={() => onEdit(template)}>
                  <PencilSimple className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                  <Trash className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div 
            className="border rounded-md bg-muted/50 p-4 max-h-40 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: template.content }}
          />
          {!template.isPredefined && (
            <p className="text-xs text-muted-foreground">
              Modifié {formatDistanceToNow(new Date(template.updated_at), { addSuffix: true, locale: fr })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
