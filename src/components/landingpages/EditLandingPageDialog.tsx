import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface LandingPage {
  id: string;
  client_name: string;
  subdomain: string;
  title: string;
  description: string | null;
  primary_color: string;
  logo_url: string | null;
  cta_text: string;
  is_active: boolean;
}

interface EditLandingPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  landingPage: LandingPage;
  onSuccess: () => void;
}

const EditLandingPageDialog = ({ open, onOpenChange, landingPage, onSuccess }: EditLandingPageDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    primary_color: "#6366f1",
    logo_url: "",
    cta_text: "Get Started",
    is_active: true,
  });

  useEffect(() => {
    if (landingPage) {
      setFormData({
        title: landingPage.title,
        description: landingPage.description || "",
        primary_color: landingPage.primary_color,
        logo_url: landingPage.logo_url || "",
        cta_text: landingPage.cta_text,
        is_active: landingPage.is_active,
      });
    }
  }, [landingPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("landing_pages")
        .update({
          title: formData.title,
          description: formData.description || null,
          primary_color: formData.primary_color,
          logo_url: formData.logo_url || null,
          cta_text: formData.cta_text,
          is_active: formData.is_active,
        })
        .eq("id", landingPage.id);

      if (error) throw error;

      toast({
        title: "Landing page updated",
        description: "Your changes have been saved successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Landing Page</DialogTitle>
          <DialogDescription>
            Update the landing page for {landingPage.client_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active Status</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div>
            <Label htmlFor="title">Page Title</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Welcome to Our Platform"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A brief description of your offering"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="primary_color">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primary_color"
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                placeholder="#6366f1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="logo_url">Logo URL (Optional)</Label>
            <Input
              id="logo_url"
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <Label htmlFor="cta_text">Call-to-Action Button Text</Label>
            <Input
              id="cta_text"
              required
              value={formData.cta_text}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              placeholder="Get Started"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLandingPageDialog;