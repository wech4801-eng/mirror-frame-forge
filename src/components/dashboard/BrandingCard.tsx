import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Branding {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
}

interface BrandingCardProps {
  branding: Branding;
  onEdit: (branding: Branding) => void;
  onDelete: () => void;
}

const BrandingCard = ({ branding, onEdit, onDelete }: BrandingCardProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce branding ?")) return;
    
    try {
      const { error } = await supabase
        .from('brandings')
        .delete()
        .eq('id', branding.id);

      if (error) throw error;

      if (branding.logo_url) {
        const fileName = branding.logo_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('branding-logos')
            .remove([fileName]);
        }
      }

      toast({
        title: "Branding supprimé",
        description: "Le branding a été supprimé avec succès",
      });

      onDelete();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold text-primary">{branding.name}</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(branding)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {branding.logo_url && (
            <div className="flex justify-center p-8 bg-muted rounded-lg">
              <img
                src={branding.logo_url}
                alt={`Logo ${branding.name}`}
                className="h-20 object-contain"
              />
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-3">Palette de couleurs</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div
                  className="h-24 rounded-lg border-2 border-border"
                  style={{ backgroundColor: branding.primary_color }}
                />
                <p className="text-sm text-center text-muted-foreground">Principale</p>
              </div>
              <div className="space-y-2">
                <div
                  className="h-24 rounded-lg border-2 border-border"
                  style={{ backgroundColor: branding.secondary_color }}
                />
                <p className="text-sm text-center text-muted-foreground">Secondaire</p>
              </div>
              <div className="space-y-2">
                <div
                  className="h-24 rounded-lg border-2 border-border"
                  style={{ backgroundColor: branding.accent_color }}
                />
                <p className="text-sm text-center text-muted-foreground">Accent</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Typographie</p>
            <p
              className="text-2xl font-semibold"
              style={{ fontFamily: branding.font_family }}
            >
              {branding.font_family}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandingCard;
