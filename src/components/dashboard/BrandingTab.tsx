import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Palette, Plus } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import CreateBrandingDialog from "./CreateBrandingDialog";
import BrandingCard from "./BrandingCard";
import EditBrandingDialog from "./EditBrandingDialog";

interface Branding {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
}

const BrandingTab = () => {
  const [brandings, setBrandings] = useState<Branding[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBranding, setEditingBranding] = useState<Branding | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchBrandings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('brandings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrandings(data || []);
    } catch (error) {
      console.error('Error fetching brandings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandings();
  }, []);

  const handleEdit = (branding: Branding) => {
    setEditingBranding(branding);
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-card rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Palette className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Branding</h1>
            <p className="text-sm text-muted-foreground">
              Gérez les identités visuelles de vos entreprises
            </p>
          </div>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau Branding
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : brandings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-border rounded-2xl bg-muted/30">
          <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
            <Palette className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Aucun branding créé</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Créez votre premier branding pour définir l'identité visuelle de votre entreprise
          </p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Créer mon premier branding
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brandings.map((branding) => (
            <BrandingCard
              key={branding.id}
              branding={branding}
              onEdit={handleEdit}
              onDelete={fetchBrandings}
            />
          ))}
        </div>
      )}

      <CreateBrandingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchBrandings}
      />

      <EditBrandingDialog
        branding={editingBranding}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchBrandings}
      />
    </div>
  );
};

export default BrandingTab;
