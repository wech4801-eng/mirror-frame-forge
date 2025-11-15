import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

interface TemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelect: (template: EmailTemplate) => void;
}

const TemplateSelector = ({ selectedTemplateId, onSelect }: TemplateSelectorProps) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
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

    fetchTemplates();
  }, []);

  const handlePreview = (template: EmailTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Aucun template disponible.</p>
          <p className="text-sm mt-2">Créez des templates dans l'onglet Mail.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplateId === template.id
                ? "ring-2 ring-primary shadow-lg"
                : "hover:ring-1 hover:ring-primary/50"
            }`}
            onClick={() => onSelect(template)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                </div>
                <div className="flex gap-2">
                  {selectedTemplateId === template.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handlePreview(template, e)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div 
                className="border rounded-md bg-muted/50 p-3 max-h-32 overflow-hidden text-xs"
                dangerouslySetInnerHTML={{ __html: template.content }}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Sujet :</p>
                <p className="text-sm">{previewTemplate.subject}</p>
              </div>
              <div className="border rounded-md bg-background overflow-auto max-h-[60vh] p-6">
                <div dangerouslySetInnerHTML={{ __html: previewTemplate.content }} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateSelector;
