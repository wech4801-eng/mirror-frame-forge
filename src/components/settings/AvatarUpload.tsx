import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, CircleNotch, Trash } from "@phosphor-icons/react";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  userInitials: string;
  onAvatarUpdate: (url: string | null) => void;
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  userInitials,
  onAvatarUpdate,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Math.random()}.${fileExt}`;

      // Upload le fichier
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      onAvatarUpdate(data.publicUrl);

      toast({
        title: "Photo de profil mise à jour",
        description: "Votre photo a été téléchargée avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de télécharger la photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async () => {
    try {
      setUploading(true);

      // Mettre à jour le profil pour supprimer l'URL
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (error) throw error;

      onAvatarUpdate(null);

      toast({
        title: "Photo supprimée",
        description: "Votre photo de profil a été supprimée",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-24 w-24">
        <AvatarImage src={currentAvatarUrl || undefined} alt="Avatar" />
        <AvatarFallback className="text-2xl bg-gradient-primary text-white">
          {userInitials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <Label htmlFor="avatar-upload" className="cursor-pointer">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            asChild
          >
            <span>
              {uploading ? (
                <CircleNotch className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <span className="ml-2">
                {currentAvatarUrl ? "Changer" : "Ajouter"} la photo
              </span>
            </span>
          </Button>
        </Label>
        <Input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />

        {currentAvatarUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={deleteAvatar}
            disabled={uploading}
            className="text-destructive hover:text-destructive"
          >
            <Trash className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        )}
      </div>
    </div>
  );
}
