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
import { useToast } from "@/components/ui/use-toast";
import { Download, CircleNotch } from "@phosphor-icons/react";

interface ExportProspectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExportProspectsDialog = ({
  open,
  onOpenChange,
}: ExportProspectsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prospects, error } = await supabase
        .from("prospects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!prospects || prospects.length === 0) {
        toast({
          title: "Aucun prospect",
          description: "Il n'y a aucun prospect à exporter",
          variant: "destructive",
        });
        return;
      }

      // Créer le CSV
      const headers = [
        "Nom complet",
        "Email",
        "Téléphone",
        "Entreprise",
        "Statut",
        "Source",
        "Notes",
        "Date de création",
      ];

      const csvRows = [
        headers.join(","),
        ...prospects.map((prospect) =>
          [
            `"${prospect.full_name || ""}"`,
            `"${prospect.email || ""}"`,
            `"${prospect.phone || ""}"`,
            `"${prospect.company || ""}"`,
            `"${prospect.status || ""}"`,
            `"${prospect.source || ""}"`,
            `"${(prospect.notes || "").replace(/"/g, '""')}"`,
            `"${new Date(prospect.created_at).toLocaleDateString("fr-FR")}"`,
          ].join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      // Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `prospects_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: `${prospects.length} prospect(s) exporté(s) avec succès`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'exporter les prospects",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exporter les Prospects</DialogTitle>
          <DialogDescription>
            Téléchargez tous vos prospects au format CSV
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Le fichier CSV contiendra tous vos prospects avec leurs informations
            complètes. Vous pourrez l'ouvrir avec Excel, Google Sheets ou tout
            autre tableur.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleExport} disabled={loading}>
              {loading ? (
                <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Exporter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportProspectsDialog;
