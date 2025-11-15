import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplateSelector from "./TemplateSelector";
import { BrandingSelector } from "../mail/BrandingSelector";
import { applyBrandingToEmailContent } from "@/lib/emailBrandingUtils";

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

interface Branding {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_family: string | null;
}

const CreateCampaignDialog = ({ open, onOpenChange }: CreateCampaignDialogProps) => {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedBranding, setSelectedBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "template">("info");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    const brandedContent = selectedBranding 
      ? applyBrandingToEmailContent(template.content, selectedBranding)
      : template.content;
    setContent(brandedContent);
  };

  const handleBrandingChange = (branding: Branding | null) => {
    setSelectedBranding(branding);
    
    if (branding && content) {
      setContent(applyBrandingToEmailContent(content, branding));
    } else if (branding && selectedTemplate) {
      setContent(applyBrandingToEmailContent(selectedTemplate.content, branding));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from("email_campaigns").insert({
        user_id: user.id,
        name,
        subject,
        content,
        template_id: selectedTemplate?.id || null,
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
      setSelectedTemplate(null);
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
            Créez une campagne en utilisant vos templates
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "info" | "template")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="template">Choisir un template</TabsTrigger>
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
              
              <BrandingSelector
                onBrandingChange={handleBrandingChange}
                selectedBrandingId={selectedBranding?.id}
              />

              {selectedTemplate && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Template sélectionné :</p>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.name}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="template" className="py-4">
              <TemplateSelector
                selectedTemplateId={selectedTemplate?.id || null}
                onSelect={handleTemplateSelect}
              />
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !selectedTemplate}>
              {loading ? "Création..." : "Créer la campagne"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaignDialog;
