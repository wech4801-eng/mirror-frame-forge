import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, CircleNotch, FileArrowDown } from "@phosphor-icons/react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportProspectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

const ImportProspectsDialog = ({
  open,
  onOpenChange,
  onImportComplete,
}: ImportProspectsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): string[][] => {
    const lines = text.split("\n");
    const result: string[][] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      const row: string[] = [];
      let cell = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cell += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          row.push(cell.trim());
          cell = "";
        } else {
          cell += char;
        }
      }
      row.push(cell.trim());
      result.push(row);
    }

    return result;
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un fichier CSV",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        throw new Error("Le fichier CSV est vide ou invalide");
      }

      // Ignorer la première ligne (en-têtes)
      const dataRows = rows.slice(1);

      const prospects = dataRows
        .map((row) => {
          // Vérifier que la ligne a au moins un nom et un email
          if (!row[0] || !row[1]) return null;

          return {
            user_id: user.id,
            full_name: row[0],
            email: row[1],
            phone: row[2] || null,
            company: row[3] || null,
            status: row[4] || "nouveau",
            source: row[5] || null,
            notes: row[6] || null,
          };
        })
        .filter((p) => p !== null);

      if (prospects.length === 0) {
        throw new Error("Aucun prospect valide trouvé dans le fichier");
      }

      const { error } = await supabase.from("prospects").insert(prospects);

      if (error) throw error;

      toast({
        title: "Import réussi",
        description: `${prospects.length} prospect(s) importé(s) avec succès`,
      });

      setFile(null);
      onOpenChange(false);
      onImportComplete?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur d'import",
        description: error.message || "Impossible d'importer les prospects",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "Nom complet",
      "Email",
      "Téléphone",
      "Entreprise",
      "Statut",
      "Source",
      "Notes",
    ];
    const example = [
      '"Jean Dupont"',
      '"jean.dupont@example.com"',
      '"+33612345678"',
      '"Entreprise ABC"',
      '"nouveau"',
      '"Site web"',
      '"Intéressé par nos services"',
    ];

    const csvContent = [headers.join(","), example.join(",")].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modele_import_prospects.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Importer des Prospects</DialogTitle>
          <DialogDescription>
            Importez plusieurs prospects en une fois depuis un fichier CSV
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Alert>
            <FileArrowDown className="h-4 w-4" />
            <AlertDescription>
              Format du CSV : Nom complet, Email, Téléphone, Entreprise, Statut,
              Source, Notes
              <br />
              <Button
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={downloadTemplate}
              >
                Télécharger un modèle de fichier CSV
              </Button>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="csv-file">Fichier CSV</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Fichier sélectionné : {file.name}
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleImport} disabled={loading || !file}>
              {loading ? (
                <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Importer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportProspectsDialog;
