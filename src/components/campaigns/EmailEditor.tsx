import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface EmailEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const EmailEditor = ({ content, onChange }: EmailEditorProps) => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Édition</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Contenu HTML de l'email</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => onChange(e.target.value)}
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
              <p className="text-xs text-muted-foreground mt-2">
                Ces variables seront automatiquement remplacées par les informations du prospect lors de l'envoi.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="p-4">
            <Label className="mb-4 block">Aperçu de l'email</Label>
            <div 
              className="border rounded-md bg-background min-h-[400px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <p className="text-xs text-muted-foreground mt-4">
              Note : Cet aperçu est simplifié. L'email final peut varier selon le client email du destinataire.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailEditor;
