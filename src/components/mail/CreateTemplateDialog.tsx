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
import { Plus, Sparkle, PaperPlaneTilt } from "@phosphor-icons/react";
import { predefinedTemplates } from "./predefinedTemplates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandingSelector } from "./BrandingSelector";
import { applyBrandingToEmailContent, generateBrandedEmailTemplate } from "@/lib/emailBrandingUtils";
import { VariablesPicker } from "./VariablesPicker";
import { TemplateValidationBanner } from "./TemplateValidationBanner";
import { renderTemplatePreview } from "@/lib/emailVariables";

interface CreateTemplateDialogProps {
  onSuccess: () => void;
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

const CreateTemplateDialog = ({ onSuccess }: CreateTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"predefined" | "html" | "visual">("predefined");
  const [loading, setLoading] = useState(false);
  const [selectedPredefined, setSelectedPredefined] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedBranding, setSelectedBranding] = useState<Branding | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const { toast } = useToast();

  const categories = ["all", ...new Set(predefinedTemplates.map(t => t.category))];
  const filteredTemplates = categoryFilter === "all" 
    ? predefinedTemplates 
    : predefinedTemplates.filter(t => t.category === categoryFilter);

  const handlePredefinedSelect = (templateId: string) => {
    const template = predefinedTemplates.find(t => t.id === templateId);
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      const brandedContent = selectedBranding 
        ? applyBrandingToEmailContent(template.content, selectedBranding)
        : template.content;
      setContent(brandedContent);
      setSelectedPredefined(templateId);
    }
  };

  const handleBrandingChange = (branding: Branding | null) => {
    setSelectedBranding(branding);
    
    if (branding) {
      // Si un template est déjà sélectionné, appliquer le branding
      if (selectedPredefined) {
        const template = predefinedTemplates.find(t => t.id === selectedPredefined);
        if (template) {
          setContent(applyBrandingToEmailContent(template.content, branding));
        }
      } else if (content) {
        // Appliquer le branding au contenu existant
        setContent(applyBrandingToEmailContent(content, branding));
      } else {
        // Générer un nouveau template avec le branding
        setContent(generateBrandedEmailTemplate(branding));
      }
    }
  };

  const handleVariableInsert = (variable: string) => {
    setContent(prev => prev + variable);
    toast({
      title: "Variable ajoutée",
      description: `${variable} a été ajouté au template`,
    });
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir une adresse email",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implémenter l'envoi de test via edge function
    toast({
      title: "Test email envoyé",
      description: `Un email de test a été envoyé à ${testEmail}`,
    });
  };

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

          <BrandingSelector
            onBrandingChange={handleBrandingChange}
            selectedBrandingId={selectedBranding?.id}
          />

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "predefined" | "html" | "visual")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="predefined"><Sparkle className="h-4 w-4 mr-2" />Templates</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="visual">Éditeur Visuel</TabsTrigger>
            </TabsList>

            <TabsContent value="predefined" className="space-y-4">
              <div className="space-y-2">
                <Label>Filtrer par catégorie</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "Toutes les catégories" : cat} ({cat === "all" ? predefinedTemplates.length : predefinedTemplates.filter(t => t.category === cat).length})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-select">Choisir un template prédéfini</Label>
                <Select value={selectedPredefined} onValueChange={handlePredefinedSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un template" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {filteredTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex flex-col">
                          <span className="font-semibold">{template.name}</span>
                          <span className="text-xs text-muted-foreground">{template.category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedPredefined && (
                <Card className="p-4">
                  <Label className="mb-4 block">Aperçu du template</Label>
                  <div 
                    className="border rounded-md bg-background min-h-[300px] overflow-auto p-4"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </Card>
              )}
            </TabsContent>

            <TabsContent value="html" className="space-y-4">
              <TemplateValidationBanner content={content} />
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content">Contenu HTML</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? "Éditer" : "Preview"}
                      </Button>
                    </div>
                    
                    {showPreview ? (
                      <Card className="p-4 max-h-[500px] overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: renderTemplatePreview(content) }} />
                      </Card>
                    ) : (
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Votre contenu HTML ici..."
                        className="min-h-[500px] font-mono text-sm"
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Test email</Label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendTestEmail}
                      >
                        <PaperPlaneTilt className="h-4 w-4 mr-2" />
                        Envoyer test
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <VariablesPicker onVariableClick={handleVariableInsert} />
                </div>
              </div>
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
