import { useEffect, useRef, useCallback } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import gjsPresetNewsletter from "grapesjs-preset-newsletter";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EMAIL_VARIABLES } from "@/lib/emailVariables";

interface VisualEmailEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const VisualEmailEditor = ({ content, onChange }: VisualEmailEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<any>(null);

  useEffect(() => {
    if (!editorRef.current || editorInstance.current) return;

    const editor = grapesjs.init({
      container: editorRef.current,
      height: "600px",
      width: "100%",
      storageManager: false,
      fromElement: false,
      plugins: [
        (editor) => gjsPresetNewsletter(editor, {
          modalTitleImport: "Importer du contenu",
          modalTitleExport: "Exporter le code",
          modalLabelExport: "Copier le code ci-dessous",
          modalLabelImport: "Coller votre code HTML ici",
          importPlaceholder: "<div>Votre HTML ici</div>",
        })
      ],
      canvas: {
        styles: [
          "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
        ],
      },
      blockManager: {
        appendOnClick: true,
      },
      panels: {
        defaults: [
          {
            id: "basic-actions",
            el: ".panel__basic-actions",
            buttons: [
              {
                id: "visibility",
                active: true,
                className: "btn-toggle-borders",
                label: '<i class="fa fa-clone"></i>',
                command: "sw-visibility",
              },
            ],
          },
          {
            id: "panel-devices",
            el: ".panel__devices",
            buttons: [
              {
                id: "device-desktop",
                label: '<i class="fa fa-desktop"></i>',
                command: "set-device-desktop",
                active: true,
              },
              {
                id: "device-mobile",
                label: '<i class="fa fa-mobile"></i>',
                command: "set-device-mobile",
              },
            ],
          },
        ],
      },
      styleManager: {
        sectors: [
          {
            name: "Texte",
            open: true,
            buildProps: ["font-family", "font-size", "font-weight", "color", "text-align"],
          },
          {
            name: "Couleurs",
            open: true,
            buildProps: ["background-color", "border-color"],
          },
          {
            name: "Espacement",
            open: false,
            buildProps: ["margin", "padding"],
          },
        ],
      },
      deviceManager: {
        devices: [
          {
            id: "desktop",
            name: "Desktop",
            width: "",
          },
          {
            id: "mobile",
            name: "Mobile",
            width: "320px",
            widthMedia: "480px",
          },
        ],
      },
    });

    // Désactiver les blocs complexes pour garder seulement l'édition de texte
    editor.on("load", () => {
      const blockManager = editor.BlockManager;
      const blocksToRemove = [
        "sect100",
        "sect50",
        "sect30",
        "sect37",
        "button",
        "divider",
        "image",
        "quote",
        "link",
        "link-block",
        "grid-items",
        "list-items",
      ];
      
      blocksToRemove.forEach((blockId) => {
        blockManager.remove(blockId);
      });

      // Masquer le panneau des blocs par défaut
      const panels = editor.Panels;
      const viewsPanel = panels.getPanel("views");
      if (viewsPanel) {
        viewsPanel.set("visible", false);
      }
    });

    // Charger le contenu initial
    if (content) {
      editor.setComponents(content);
    }

    // Mettre à jour le contenu lors des changements
    editor.on("update", () => {
      const html = editor.getHtml();
      const css = `<style>${editor.getCss()}</style>`;
      onChange(css + html);
    });

    editorInstance.current = editor;

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, []);

  // Mettre à jour le contenu si il change de l'extérieur
  useEffect(() => {
    if (editorInstance.current && content) {
      const currentContent = editorInstance.current.getHtml();
      if (currentContent !== content) {
        editorInstance.current.setComponents(content);
      }
    }
  }, [content]);

  const handleVariableClick = useCallback((variable: string) => {
    const editor = editorInstance.current;
    if (editor) {
      const selected = editor.getSelected();
      if (selected && selected.is('text')) {
        const currentText = selected.components().models[0]?.get('content') || '';
        selected.components().models[0]?.set('content', currentText + ' ' + variable + ' ');
      }
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, variable: string) => {
    e.dataTransfer.setData("text/plain", variable);
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
      {/* Éditeur visuel à gauche */}
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-md">
          <p className="text-xs font-semibold text-foreground mb-2">💡 Comment utiliser l'éditeur :</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Cliquez sur n'importe quel texte pour le modifier directement</li>
            <li>• Glissez-déposez ou cliquez sur les variables à droite pour les insérer</li>
            <li>• Utilisez les outils en haut pour personnaliser le design</li>
          </ul>
        </div>
        <div ref={editorRef} className="border rounded-lg overflow-hidden shadow-lg" />
      </div>

      {/* Variables à droite */}
      <Card className="p-4 h-fit sticky top-4">
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {/* Variables pour les opportunités */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Variables pour les opportunités</h3>
              <div className="flex flex-wrap gap-2">
                {EMAIL_VARIABLES.opportunities.map((v) => (
                  <VariableButton key={v.key} variable={v.key} label={v.label} />
                ))}
              </div>
            </div>

            {/* Champs par défaut disponibles */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Champs par défaut disponibles</h3>
              <div className="flex flex-wrap gap-2">
                {EMAIL_VARIABLES.default_fields.map((v) => (
                  <VariableButton key={v.key} variable={v.key} label={v.label} />
                ))}
              </div>
            </div>

            {/* Variables de l'utilisateur */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Variables de l'utilisateur</h3>
              <div className="flex flex-wrap gap-2">
                {EMAIL_VARIABLES.user_variables.map((v) => (
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

export default VisualEmailEditor;
