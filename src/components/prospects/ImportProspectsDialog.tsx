import { useState, useEffect } from "react";
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
import { Upload, CircleNotch, FileArrowDown, MagicWand, CheckCircle, Warning, UsersThree } from "@phosphor-icons/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { notificationHelpers } from "@/lib/notificationsUtils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ImportProspectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

interface ColumnMapping {
  email: number | null;
  fullName: number | null;
  phone: number | null;
  company: number | null;
}

interface DetectionResult {
  mapping: ColumnMapping;
  headers: string[];
  previewRows: string[][];
  totalRows: number;
}

interface Group {
  id: string;
  name: string;
  color: string;
}

// Patterns de détection pour chaque type de colonne
const DETECTION_PATTERNS = {
  email: {
    headerPatterns: [
      /^e[-_]?mail$/i,
      /^email[-_]?address$/i,
      /^adresse[-_]?e[-_]?mail$/i,
      /^courriel$/i,
      /^mail$/i,
      /^contact[-_]?email$/i,
    ],
    valuePattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  fullName: {
    headerPatterns: [
      /^(full[-_]?)?name$/i,
      /^nom[-_]?(complet)?$/i,
      /^prenom[-_]?nom$/i,
      /^nom[-_]?prenom$/i,
      /^contact$/i,
      /^nom[-_]?et[-_]?prenom$/i,
      /^prenom[-_]?et[-_]?nom$/i,
      /^identite$/i,
      /^personne$/i,
    ],
    valuePattern: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
  },
  phone: {
    headerPatterns: [
      /^phone$/i,
      /^telephone$/i,
      /^tel$/i,
      /^mobile$/i,
      /^portable$/i,
      /^numero$/i,
      /^num[-_]?tel$/i,
      /^cell$/i,
      /^gsm$/i,
    ],
    valuePattern: /^[\+]?[\d\s\-\.\(\)]{6,20}$/,
  },
  company: {
    headerPatterns: [
      /^company$/i,
      /^entreprise$/i,
      /^societe$/i,
      /^organisation$/i,
      /^org$/i,
      /^structure$/i,
      /^etablissement$/i,
      /^raison[-_]?sociale$/i,
    ],
    valuePattern: null,
  },
};

const ImportProspectsDialog = ({
  open,
  onOpenChange,
  onImportComplete,
}: ImportProspectsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [addToGroup, setAddToGroup] = useState(false);
  const [groupMode, setGroupMode] = useState<"existing" | "new">("existing");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#6366f1");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open]);

  const fetchGroups = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (data) {
      setGroups(data);
    }
  };

  const parseCSV = (text: string): string[][] => {
    const cleanedText = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = cleanedText.split("\n");
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
        } else if ((char === "," || char === ";") && !inQuotes) {
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

  const detectColumnType = (
    header: string,
    values: string[]
  ): "email" | "fullName" | "phone" | "company" | null => {
    for (const [type, patterns] of Object.entries(DETECTION_PATTERNS)) {
      for (const pattern of patterns.headerPatterns) {
        if (pattern.test(header.replace(/[^a-zA-Z]/g, ""))) {
          return type as "email" | "fullName" | "phone" | "company";
        }
      }
    }

    const nonEmptyValues = values.filter((v) => v && v.trim());
    if (nonEmptyValues.length === 0) return null;

    const scores: Record<string, number> = { email: 0, phone: 0, fullName: 0 };

    for (const value of nonEmptyValues) {
      if (DETECTION_PATTERNS.email.valuePattern.test(value)) {
        scores.email++;
      }
      if (DETECTION_PATTERNS.phone.valuePattern.test(value)) {
        scores.phone++;
      }
      if (DETECTION_PATTERNS.fullName.valuePattern.test(value) && !value.includes("@")) {
        scores.fullName++;
      }
    }

    const threshold = nonEmptyValues.length * 0.7;

    if (scores.email >= threshold) return "email";
    if (scores.phone >= threshold) return "phone";
    if (scores.fullName >= threshold) return "fullName";

    return null;
  };

  const analyzeFileContent = (text: string): DetectionResult => {
    const rows = parseCSV(text);

    if (rows.length < 1) {
      throw new Error("Le fichier est vide");
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);
    const previewRows = dataRows.slice(0, 3);

    const mapping: ColumnMapping = {
      email: null,
      fullName: null,
      phone: null,
      company: null,
    };

    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const header = headers[colIndex];
      const columnValues = dataRows.map((row) => row[colIndex] || "");
      const detectedType = detectColumnType(header, columnValues);

      if (detectedType && mapping[detectedType] === null) {
        mapping[detectedType] = colIndex;
      }
    }

    if (mapping.email === null) {
      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        const columnValues = dataRows.map((row) => row[colIndex] || "");
        const emailCount = columnValues.filter((v) =>
          DETECTION_PATTERNS.email.valuePattern.test(v)
        ).length;
        if (emailCount > dataRows.length * 0.5) {
          mapping.email = colIndex;
          break;
        }
      }
    }

    if (mapping.fullName === null) {
      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        if (
          colIndex !== mapping.email &&
          colIndex !== mapping.phone &&
          colIndex !== mapping.company
        ) {
          const columnValues = dataRows.map((row) => row[colIndex] || "");
          const hasText = columnValues.some(
            (v) => v && !DETECTION_PATTERNS.email.valuePattern.test(v)
          );
          if (hasText) {
            mapping.fullName = colIndex;
            break;
          }
        }
      }
    }

    return {
      mapping,
      headers,
      previewRows,
      totalRows: dataRows.length,
    };
  };

  const readFileWithEncoding = async (file: File): Promise<string> => {
    let text = await file.text();
    
    if (text.includes("�") || text.includes("\uFFFD")) {
      const buffer = await file.arrayBuffer();
      const decoder = new TextDecoder("iso-8859-1");
      text = decoder.decode(buffer);
    }
    
    return text;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setDetectionResult(null);

    if (selectedFile) {
      try {
        const text = await readFileWithEncoding(selectedFile);
        const result = analyzeFileContent(text);
        setDetectionResult(result);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erreur d'analyse",
          description: error.message || "Impossible d'analyser le fichier",
        });
      }
    }
  };

  const handleImport = async () => {
    if (!file || !detectionResult) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un fichier CSV",
      });
      return;
    }

    if (detectionResult.mapping.email === null) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de détecter la colonne email. L'email est obligatoire.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const text = await readFileWithEncoding(file);
      const rows = parseCSV(text);
      const dataRows = rows.slice(1);

      const { mapping } = detectionResult;

      const prospects = dataRows
        .map((row) => {
          const email = mapping.email !== null ? row[mapping.email]?.trim() : null;
          const fullName = mapping.fullName !== null ? row[mapping.fullName]?.trim() : null;
          const phone = mapping.phone !== null ? row[mapping.phone]?.trim() : null;
          const company = mapping.company !== null ? row[mapping.company]?.trim() : null;

          if (!email || !DETECTION_PATTERNS.email.valuePattern.test(email)) return null;

          return {
            user_id: user.id,
            full_name: fullName || email.split("@")[0],
            email,
            phone: phone || null,
            company: company || null,
            status: "nouveau",
            source: "Import CSV",
          };
        })
        .filter((p) => p !== null);

      if (prospects.length === 0) {
        throw new Error("Aucun prospect valide trouvé dans le fichier");
      }

      const { data: insertedProspects, error } = await supabase
        .from("prospects")
        .insert(prospects)
        .select("id");

      if (error) throw error;

      // Ajouter au groupe si demandé
      if (addToGroup && insertedProspects && insertedProspects.length > 0) {
        let targetGroupId = selectedGroupId;

        // Créer un nouveau groupe si nécessaire
        if (groupMode === "new" && newGroupName.trim()) {
          const { data: newGroup, error: groupError } = await supabase
            .from("groups")
            .insert({
              user_id: user.id,
              name: newGroupName.trim(),
              color: newGroupColor,
            })
            .select()
            .single();

          if (groupError) throw groupError;
          targetGroupId = newGroup.id;
        }

        if (targetGroupId) {
          const associations = insertedProspects.map((p) => ({
            prospect_id: p.id,
            group_id: targetGroupId,
          }));

          const { error: assocError } = await supabase
            .from("prospect_groups")
            .insert(associations);

          if (assocError) {
            console.error("Erreur lors de l'ajout au groupe:", assocError);
          }
        }
      }

      await notificationHelpers.csvImported(prospects.length);

      const groupMessage = addToGroup
        ? groupMode === "new"
          ? ` et ajouté(s) au groupe "${newGroupName}"`
          : ` et ajouté(s) au groupe`
        : "";

      toast({
        title: "Import réussi",
        description: `${prospects.length} prospect(s) importé(s)${groupMessage}`,
      });

      // Reset
      setFile(null);
      setDetectionResult(null);
      setAddToGroup(false);
      setGroupMode("existing");
      setSelectedGroupId("");
      setNewGroupName("");
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
    const headers = ["Nom", "Email", "Téléphone", "Entreprise"];
    const example1 = ["Jean Dupont", "jean.dupont@example.com", "+33612345678", "Entreprise ABC"];
    const example2 = ["Marie Martin", "marie.martin@test.fr", "+33698765432", "Société XYZ"];

    const csvContent = [headers.join(","), example1.join(","), example2.join(",")].join("\n");

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

  const getColumnLabel = (type: keyof ColumnMapping): string => {
    const labels: Record<keyof ColumnMapping, string> = {
      email: "Email",
      fullName: "Nom complet",
      phone: "Téléphone",
      company: "Entreprise",
    };
    return labels[type];
  };

  const isRequired = (type: keyof ColumnMapping): boolean => {
    return type === "email";
  };

  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
    "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MagicWand className="h-5 w-5 text-primary" />
            Importer des Prospects
          </DialogTitle>
          <DialogDescription>
            Importez un fichier CSV — les colonnes sont détectées automatiquement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-primary/5 border-primary/20">
            <MagicWand className="h-4 w-4 text-primary" />
            <AlertDescription>
              <p className="font-medium text-primary">Détection automatique</p>
              <p className="text-sm text-muted-foreground">
                Peu importe l'ordre ou le nom de vos colonnes, le système détecte automatiquement où se trouvent les emails, noms, téléphones et entreprises.
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="csv-file">Fichier CSV</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>

          {detectionResult && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" weight="fill" />
                <span className="font-medium">
                  {detectionResult.totalRows} ligne(s) détectée(s)
                </span>
              </div>

              {/* Mapping détecté */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Colonnes détectées :</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(detectionResult.mapping) as Array<keyof ColumnMapping>).map(
                    (type) => {
                      const colIndex = detectionResult.mapping[type];
                      const isDetected = colIndex !== null;
                      const headerName = isDetected
                        ? detectionResult.headers[colIndex]
                        : null;

                      return (
                        <div
                          key={type}
                          className={`flex items-center justify-between p-2 rounded border ${
                            isDetected
                              ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                              : isRequired(type)
                              ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                              : "bg-muted border-border"
                          }`}
                        >
                          <span className="text-sm">
                            {getColumnLabel(type)}
                            {isRequired(type) && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </span>
                          {isDetected ? (
                            <Badge variant="secondary" className="text-xs">
                              {headerName}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Non détecté
                            </span>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Aperçu */}
              {detectionResult.previewRows.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Aperçu (3 premières lignes) :</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border rounded">
                      <thead>
                        <tr className="bg-muted">
                          {detectionResult.headers.map((header, i) => (
                            <th
                              key={i}
                              className="px-2 py-1 border-r border-border text-left"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detectionResult.previewRows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-2 py-1 border-r border-border text-muted-foreground"
                              >
                                {cell || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {detectionResult.mapping.email === null && (
                <Alert variant="destructive">
                  <Warning className="h-4 w-4" />
                  <AlertDescription>
                    Aucune colonne email détectée. Vérifiez que votre fichier contient des adresses email valides.
                  </AlertDescription>
                </Alert>
              )}

              {/* Option d'ajout au groupe */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    id="add-to-group"
                    checked={addToGroup}
                    onCheckedChange={(checked) => setAddToGroup(checked === true)}
                  />
                  <Label htmlFor="add-to-group" className="flex items-center gap-2 cursor-pointer">
                    <UsersThree className="h-4 w-4 text-primary" />
                    Ajouter tous les prospects à un groupe
                  </Label>
                </div>

                {addToGroup && (
                  <div className="pl-6 space-y-4">
                    <RadioGroup value={groupMode} onValueChange={(v) => setGroupMode(v as "existing" | "new")}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="existing" id="existing" />
                        <Label htmlFor="existing">Groupe existant</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id="new" />
                        <Label htmlFor="new">Créer un nouveau groupe</Label>
                      </div>
                    </RadioGroup>

                    {groupMode === "existing" ? (
                      <div className="space-y-2">
                        {groups.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Aucun groupe disponible. Créez-en un nouveau.
                          </p>
                        ) : (
                          <ScrollArea className="h-32 border rounded-lg">
                            <div className="p-2 space-y-1">
                              {groups.map((group) => (
                                <button
                                  key={group.id}
                                  type="button"
                                  onClick={() => setSelectedGroupId(group.id)}
                                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                                    selectedGroupId === group.id
                                      ? "bg-primary/10 border border-primary/30"
                                      : "hover:bg-muted"
                                  }`}
                                >
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: group.color }}
                                  />
                                  <span className="text-sm">{group.name}</span>
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="new-group-name">Nom du groupe</Label>
                          <Input
                            id="new-group-name"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Ex: Import janvier 2025"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Couleur</Label>
                          <div className="flex flex-wrap gap-2">
                            {colors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setNewGroupColor(color)}
                                className={`w-6 h-6 rounded-full transition-all ${
                                  newGroupColor === color
                                    ? "ring-2 ring-offset-2 ring-primary scale-110"
                                    : "hover:scale-105"
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {!detectionResult && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <p>Ou utilisez notre modèle simple :</p>
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={downloadTemplate}
              >
                <FileArrowDown className="mr-1 h-4 w-4" />
                Télécharger le modèle CSV
              </Button>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFile(null);
                setDetectionResult(null);
                setAddToGroup(false);
                setGroupMode("existing");
                setSelectedGroupId("");
                setNewGroupName("");
                onOpenChange(false);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleImport}
              disabled={
                loading ||
                !file ||
                !detectionResult ||
                detectionResult.mapping.email === null ||
                (addToGroup && groupMode === "existing" && !selectedGroupId) ||
                (addToGroup && groupMode === "new" && !newGroupName.trim())
              }
            >
              {loading ? (
                <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Importer {detectionResult ? `(${detectionResult.totalRows})` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportProspectsDialog;
