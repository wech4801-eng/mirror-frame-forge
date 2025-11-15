import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <div>
                <CardTitle>Branding</CardTitle>
                <CardDescription>
                  Gérez les identités visuelles de vos entreprises
                </CardDescription>
              </div>
            </div>
            <CreateBrandingDialog onSuccess={fetchBrandings} />
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : brandings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun branding créé. Créez votre premier branding pour commencer.
          </CardContent>
        </Card>
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
