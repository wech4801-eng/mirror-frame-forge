import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

interface PreviewTemplateDialogProps {
  template: EmailTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PreviewTemplateDialog = ({ template, open, onOpenChange }: PreviewTemplateDialogProps) => {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
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
      </DialogContent>
    </Dialog>
  );
};

export default PreviewTemplateDialog;
