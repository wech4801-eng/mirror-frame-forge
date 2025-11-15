import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilSimple, Trash } from "@phosphor-icons/react";
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
    <Card className="border-primary/20 hover:border-primary/40 transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold text-primary">{branding.name}</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(branding)}>
            <PencilSimple className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete}>
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Logo Section - Compact */}
        {branding.logo_url && (
          <div className="flex justify-center py-4 bg-muted/50 rounded-lg">
            <img
              src={branding.logo_url}
              alt={`Logo ${branding.name}`}
              className="h-12 object-contain"
            />
          </div>
        )}

        {/* Couleurs - Circles horizontaux */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Couleurs</p>
          <div className="flex items-center justify-around py-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-12 h-12 rounded-full border-2 border-border shadow-sm"
                style={{ backgroundColor: branding.primary_color }}
                title="Principale"
              />
              <span className="text-xs text-muted-foreground">Principale</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-12 h-12 rounded-full border-2 border-border shadow-sm"
                style={{ backgroundColor: branding.secondary_color }}
                title="Secondaire"
              />
              <span className="text-xs text-muted-foreground">Secondaire</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-12 h-12 rounded-full border-2 border-border shadow-sm"
                style={{ backgroundColor: branding.accent_color }}
                title="Accent"
              />
              <span className="text-xs text-muted-foreground">Accent</span>
            </div>
          </div>
        </div>

        {/* Police - Compact */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Police</p>
          <p
            className="text-base font-semibold"
            style={{ fontFamily: branding.font_family }}
          >
            {branding.font_family}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandingCard;
