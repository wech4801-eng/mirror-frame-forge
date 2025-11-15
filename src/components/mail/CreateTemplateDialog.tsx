import { useState } from "react";
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
import { Plus } from "lucide-react";

interface CreateTemplateDialogProps {
  onSuccess: () => void;
}

const CreateTemplateDialog = ({ onSuccess }: CreateTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"html" | "visual">("html");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from("email_templates").insert({
        user_id: user.id,
        name,
        subject,
        content,
      });

      if (error) throw error;

      toast({
        title: "Template créé",
        description: "Le template d'email a été créé avec succès",
      });

      setOpen(false);
      setName("");
      setSubject("");
      setContent("");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Nouveau Template
      </Button>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un template d'email</DialogTitle>
          <DialogDescription>
            Créez un template réutilisable pour vos campagnes
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du template</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Newsletter Mensuelle"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Sujet par défaut</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Votre newsletter du mois"
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
                  placeholder="Votre contenu HTML ici..."
                  className="min-h-[400px] font-mono text-sm"
                  required
                />
                <div className="bg-muted/50 p-4 rounded-md space-y-2">
                  <p className="text-xs font-semibold text-foreground">Variables disponibles :</p>
                  <div className="grid grid-cols-3 gap-2">
                    <code className="text-xs bg-background px-2 py-1 rounded">{"{nom}"}</code>
                    <code className="text-xs bg-background px-2 py-1 rounded">{"{email}"}</code>
                    <code className="text-xs bg-background px-2 py-1 rounded">{"{entreprise}"}</code>
                  </div>
                </div>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer le template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplateDialog;
