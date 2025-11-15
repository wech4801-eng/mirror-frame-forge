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
import { Plus, Sparkles } from "lucide-react";
import { predefinedTemplates } from "./predefinedTemplates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateTemplateDialogProps {
  onSuccess: () => void;
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
      setContent(template.content);
      setSelectedPredefined(templateId);
    }
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

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "predefined" | "html" | "visual")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="predefined"><Sparkles className="h-4 w-4 mr-2" />Templates</TabsTrigger>
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
