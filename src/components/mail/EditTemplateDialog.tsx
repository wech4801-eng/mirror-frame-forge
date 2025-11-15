import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import VisualEmailEditor from "../campaigns/VisualEmailEditor";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

interface EditTemplateDialogProps {
  template: EmailTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditTemplateDialog = ({ template, open, onOpenChange, onSuccess }: EditTemplateDialogProps) => {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"html" | "visual">("html");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setContent(template.content);
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          name,
          subject,
          content,
        })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Template modifié",
        description: "Le template a été modifié avec succès",
      });

      onOpenChange(false);
      onSuccess();
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le template</DialogTitle>
          <DialogDescription>
            Modifiez votre template d'email
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du template</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Sujet par défaut</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "html" | "visual")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="visual">Éditeur Visuel</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Contenu HTML</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  required
                />
              </div>

              <Card className="p-4">
                <Label className="mb-4 block">Aperçu</Label>
                <div 
                  className="border rounded-md bg-background min-h-[200px] overflow-auto p-4"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </Card>
            </TabsContent>

            <TabsContent value="visual">
              <VisualEmailEditor content={content} onChange={setContent} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTemplateDialog;
