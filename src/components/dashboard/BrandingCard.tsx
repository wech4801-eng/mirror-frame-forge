import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Image as ImageIcon } from "lucide-react";
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
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50">
      <div className="p-6 space-y-5">
        {/* Header with actions */}
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {branding.name}
          </h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onEdit(branding)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Logo section */}
        <div className="relative h-32 rounded-xl bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center overflow-hidden border border-border/50">
          {branding.logo_url ? (
            <img
              src={branding.logo_url}
              alt={`Logo ${branding.name}`}
              className="max-h-20 max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-10 w-10" />
              <span className="text-sm">Aucun logo</span>
            </div>
          )}
        </div>

        {/* Colors section */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Palette de couleurs</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <div
                className="h-14 rounded-lg border-2 border-border shadow-sm transition-transform hover:scale-105"
                style={{ backgroundColor: branding.primary_color }}
              />
              <p className="text-xs text-center text-muted-foreground font-medium">Principale</p>
            </div>
            <div className="space-y-2">
              <div
                className="h-14 rounded-lg border-2 border-border shadow-sm transition-transform hover:scale-105"
                style={{ backgroundColor: branding.secondary_color }}
              />
              <p className="text-xs text-center text-muted-foreground font-medium">Secondaire</p>
            </div>
            <div className="space-y-2">
              <div
                className="h-14 rounded-lg border-2 border-border shadow-sm transition-transform hover:scale-105"
                style={{ backgroundColor: branding.accent_color }}
              />
              <p className="text-xs text-center text-muted-foreground font-medium">Accent</p>
            </div>
          </div>
        </div>

        {/* Font section */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-sm font-medium text-muted-foreground mb-2">Typographie</p>
          <p
            className="text-xl font-semibold text-foreground"
            style={{ fontFamily: branding.font_family }}
          >
            {branding.font_family}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default BrandingCard;
