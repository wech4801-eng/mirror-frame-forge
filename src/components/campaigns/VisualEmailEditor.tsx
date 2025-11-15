import { useEffect, useRef } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import "grapesjs-preset-newsletter";

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
      plugins: ["gjs-preset-newsletter"],
      pluginsOpts: {
        "gjs-preset-newsletter": {
          modalTitleImport: "Importer du contenu",
          modalTitleExport: "Exporter le code",
          modalLabelExport: "Copier le code ci-dessous",
          modalLabelImport: "Coller votre code HTML ici",
          importPlaceholder: "<div>Votre HTML ici</div>",
          cellStyle: {
            "font-size": "12px",
            "font-weight": 300,
            "vertical-align": "top",
            color: "rgb(111, 119, 125)",
            margin: 0,
            padding: 0,
          },
        },
      },
      canvas: {
        styles: [
          "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
        ],
      },
      blockManager: {
        appendOnClick: true,
      },
      styleManager: {
        sectors: [
          {
            name: "Général",
            open: true,
            buildProps: ["float", "display", "position", "top", "right", "left", "bottom"],
          },
          {
            name: "Dimensions",
            open: false,
            buildProps: ["width", "height", "max-width", "min-height", "margin", "padding"],
          },
          {
            name: "Typographie",
            open: false,
            buildProps: ["font-family", "font-size", "font-weight", "letter-spacing", "color", "line-height", "text-align", "text-decoration", "text-shadow"],
          },
          {
            name: "Décorations",
            open: false,
            buildProps: ["background-color", "border-radius", "border", "box-shadow", "background"],
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
            id: "tablet",
            name: "Tablette",
            width: "768px",
            widthMedia: "992px",
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

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-md">
        <p className="text-xs font-semibold text-foreground mb-2">💡 Comment utiliser l'éditeur :</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Glissez-déposez des blocs depuis la barre latérale</li>
          <li>• Cliquez sur un élément pour le modifier dans le panneau de droite</li>
          <li>• Pour modifier un lien : cliquez sur le bouton/texte → panneau "Paramètres" → champ "Lien"</li>
          <li>• Variables disponibles : {"{nom}"}, {"{email}"}, {"{entreprise}"}</li>
        </ul>
      </div>
      <div ref={editorRef} className="border rounded-lg overflow-hidden shadow-lg" />
    </div>
  );
};

export default VisualEmailEditor;
