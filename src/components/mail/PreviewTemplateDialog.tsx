import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Sparkle } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category?: string;
  isPredefined?: boolean;
}

interface PreviewTemplateDialogProps {
  template: EmailTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PreviewTemplateDialog = ({ template, open, onOpenChange }: PreviewTemplateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!template) return null;

  const handleCopyTemplate = async () => {
    if (!template.isPredefined) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from("email_templates").insert({
        user_id: user.id,
        name: template.name,
        subject: template.subject,
        content: template.content,
      });

      if (error) throw error;

      toast({
        title: "Template copié",
        description: "Le template a été ajouté à vos templates personnels",
      });

      onOpenChange(false);
      window.location.reload(); // Refresh to show the new template
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{template.name}</DialogTitle>
            {template.isPredefined && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Prédéfini
              </Badge>
            )}
            {template.category && (
              <Badge variant="outline" className="text-xs">
                {template.category}
              </Badge>
            )}
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Sujet :</p>
            <p className="text-sm">{template.subject}</p>
          </div>
          <div className="border rounded-md bg-background overflow-auto max-h-[60vh] p-6">
            <div dangerouslySetInnerHTML={{ __html: template.content }} />
          </div>
        </div>
        {template.isPredefined && (
          <DialogFooter>
            <Button onClick={handleCopyTemplate} disabled={loading}>
              <Copy className="h-4 w-4 mr-2" />
              {loading ? "Copie en cours..." : "Utiliser ce template"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PreviewTemplateDialog;
