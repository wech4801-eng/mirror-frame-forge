import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailTemplateSelector from "./EmailTemplateSelector";
import EmailEditor from "./EmailEditor";

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCampaignDialog = ({ open, onOpenChange }: CreateCampaignDialogProps) => {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("email_campaigns").insert({
        user_id: user.id,
        name,
        subject,
        content,
        status: "brouillon",
      });

      if (error) throw error;

      toast({
        title: "Campagne créée",
        description: "La campagne a été créée avec succès",
      });

      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      onOpenChange(false);
      setName("");
      setSubject("");
      setContent("");
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
          <DialogTitle>Nouvelle campagne email</DialogTitle>
          <DialogDescription>
            Créez une campagne professionnelle avec nos templates pré-définis
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="editor">Éditeur</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la campagne</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Newsletter Mars 2024"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Objet de l'email</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Découvrez nos nouvelles fonctionnalités"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="template" className="py-4">
              <EmailTemplateSelector 
                onSelectTemplate={(template) => {
                  setSelectedTemplate(template.id);
                  setContent(template.html);
                }}
                selectedTemplate={selectedTemplate}
              />
              {selectedTemplate && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm text-foreground">
                    ✓ Template sélectionné ! Passez à l'onglet <strong>"Éditeur"</strong> pour personnaliser votre email.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="editor" className="py-4">
              {content ? (
                <EmailEditor 
                  content={content}
                  onChange={setContent}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Veuillez d'abord sélectionner un template dans l'onglet "Template"</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer la campagne"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaignDialog;
