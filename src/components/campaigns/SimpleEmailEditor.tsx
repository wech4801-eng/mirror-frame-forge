import { useRef, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EMAIL_VARIABLES } from "@/lib/emailVariables";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface SimpleEmailEditorProps {
  name: string;
  subject: string;
  cc?: string;
  bcc?: string;
  content: string;
  onNameChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onCcChange?: (value: string) => void;
  onBccChange?: (value: string) => void;
  onContentChange: (value: string) => void;
}

const SimpleEmailEditor = ({
  name,
  subject,
  cc = "",
  bcc = "",
  content,
  onNameChange,
  onSubjectChange,
  onCcChange,
  onBccChange,
  onContentChange,
}: SimpleEmailEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  const handleVariableClick = useCallback((variable: string) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const cursorPosition = editor.getSelection()?.index || editor.getLength();
      editor.insertText(cursorPosition, ` ${variable} `);
      onContentChange(editor.root.innerHTML);
    }
  }, [onContentChange]);

  const handleDragStart = (e: React.DragEvent, variable: string) => {
    e.dataTransfer.setData("text/plain", variable);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const variable = e.dataTransfer.getData("text/plain");
    const editor = quillRef.current?.getEditor();
    if (editor && variable) {
      const cursorPosition = editor.getSelection()?.index || editor.getLength();
      editor.insertText(cursorPosition, ` ${variable} `);
      onContentChange(editor.root.innerHTML);
    }
  }, [onContentChange]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["link"],
      [{ header: [1, 2, 3, false] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["clean"],
    ],
  };

  const VariableButton = ({ variable, label }: { variable: string; label: string }) => (
    <button
      draggable
      onDragStart={(e) => handleDragStart(e, variable)}
      onClick={() => handleVariableClick(variable)}
      className="px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors border border-primary/20 cursor-move"
    >
      {label}
    </button>
  );

  return (
    <div className="grid grid-cols-[1fr,400px] gap-6">
      {/* Formulaire à gauche */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du modèle</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ex: Email de bienvenue"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Objet de l'e-mail</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Ex: Bienvenue chez nous !"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cc">Cc</Label>
            <Input
              id="cc"
              value={cc}
              onChange={(e) => onCcChange?.(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bcc">Cci</Label>
            <Input
              id="bcc"
              value={bcc}
              onChange={(e) => onBccChange?.(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Contenu de l'e-mail</Label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border rounded-md"
          >
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={onContentChange}
              modules={modules}
              className="min-h-[400px]"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Glissez-déposez ou cliquez sur les variables à droite pour les insérer
          </p>
        </div>

        <div className="space-y-2">
          <Label>Pièces jointes</Label>
          <div className="border-2 border-dashed rounded-md p-8 text-center">
            <p className="text-sm text-muted-foreground">Annexer des documents</p>
            <button className="mt-2 px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md">
              Browse
            </button>
          </div>
        </div>
      </div>

      {/* Variables à droite */}
      <Card className="p-4 h-fit sticky top-4">
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Champs du prospect</h3>
              <div className="flex flex-wrap gap-2">
                {EMAIL_VARIABLES.prospect_fields.map((v) => (
                  <VariableButton key={v.key} variable={v.key} label={v.label} />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default SimpleEmailEditor;
