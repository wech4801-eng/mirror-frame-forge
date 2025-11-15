import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CreateTemplateDialog from "../mail/CreateTemplateDialog";
import TemplateCard from "../mail/TemplateCard";
import EditTemplateDialog from "../mail/EditTemplateDialog";
import PreviewTemplateDialog from "../mail/PreviewTemplateDialog";
import { predefinedTemplates } from "../mail/predefinedTemplates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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

const MailTab = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setEditDialogOpen(true);
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setPreviewDialogOpen(true);
  };

  const handleUsePredefined = (predefinedId: string) => {
    const predefined = predefinedTemplates.find(t => t.id === predefinedId);
    if (predefined) {
      setPreviewTemplate({
        id: predefined.id,
        name: predefined.name,
        subject: predefined.subject,
        content: predefined.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: predefined.category,
        isPredefined: true
      });
      setPreviewDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <div>
                <CardTitle>Templates d'Emails</CardTitle>
                <CardDescription>
                  Créez et gérez vos templates réutilisables pour vos campagnes et workflows
                </CardDescription>
              </div>
            </div>
            <CreateTemplateDialog onSuccess={fetchTemplates} />
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">
            Tous ({templates.length + predefinedTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="predefined">
            <Sparkles className="h-4 w-4 mr-2" />
            Prédéfinis ({predefinedTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {predefinedTemplates.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Templates Prédéfinis</h3>
                    <Badge variant="secondary" className="text-xs">
                      {predefinedTemplates.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {predefinedTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={{
                          id: template.id,
                          name: template.name,
                          subject: template.subject,
                          content: template.content,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          category: template.category,
                          isPredefined: true
                        }}
                        onEdit={() => {}}
                        onDelete={() => Promise.resolve()}
                        onPreview={() => handleUsePredefined(template.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {templates.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Mes Templates</h3>
                    <Badge variant="secondary" className="text-xs">
                      {templates.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onEdit={handleEdit}
                        onDelete={fetchTemplates}
                        onPreview={handlePreview}
                      />
                    ))}
                  </div>
                </div>
              )}

              {templates.length === 0 && predefinedTemplates.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Aucun template disponible.
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="predefined" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predefinedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={{
                  id: template.id,
                  name: template.name,
                  subject: template.subject,
                  content: template.content,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  category: template.category,
                  isPredefined: true
                }}
                onEdit={() => {}}
                onDelete={() => Promise.resolve()}
                onPreview={() => handleUsePredefined(template.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <EditTemplateDialog
        template={editingTemplate}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchTemplates}
      />

      <PreviewTemplateDialog
        template={previewTemplate}
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
      />
    </div>
  );
};

export default MailTab;
