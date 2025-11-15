import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Palette } from "@phosphor-icons/react";

interface Branding {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_family: string | null;
}

interface BrandingSelectorProps {
  onBrandingChange: (branding: Branding | null) => void;
  selectedBrandingId?: string;
}

export const BrandingSelector = ({ onBrandingChange, selectedBrandingId }: BrandingSelectorProps) => {
  const [brandings, setBrandings] = useState<Branding[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBrandings();
  }, []);

  const fetchBrandings = async () => {
    try {
      const { data, error } = await supabase
        .from("brandings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBrandings(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les brandings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBrandingSelect = (brandingId: string) => {
    if (brandingId === "none") {
      onBrandingChange(null);
      return;
    }
    const branding = brandings.find((b) => b.id === brandingId);
    if (branding) {
      onBrandingChange(branding);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="branding" className="flex items-center gap-2">
        <Palette className="h-4 w-4" />
        Appliquer un branding
      </Label>
      <Select
        value={selectedBrandingId || "none"}
        onValueChange={handleBrandingSelect}
        disabled={loading}
      >
        <SelectTrigger id="branding">
          <SelectValue placeholder="Sélectionner un branding" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Aucun branding</SelectItem>
          {brandings.map((branding) => (
            <SelectItem key={branding.id} value={branding.id}>
              {branding.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedBrandingId && selectedBrandingId !== "none" && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          Le logo, les couleurs et la police seront appliqués automatiquement
        </div>
      )}
    </div>
  );
};
