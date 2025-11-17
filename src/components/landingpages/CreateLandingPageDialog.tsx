import { useState } from "react";
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

interface CreateLandingPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateLandingPageDialog = ({ open, onOpenChange, onSuccess }: CreateLandingPageDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    subdomain: "",
    title: "",
    description: "",
    primary_color: "#6366f1",
    logo_url: "",
    cta_text: "Get Started",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate subdomain format
      const subdomainRegex = /^[a-z0-9-]+$/;
      if (!subdomainRegex.test(formData.subdomain)) {
        throw new Error("Subdomain can only contain lowercase letters, numbers, and hyphens");
      }

      const { error } = await supabase.from("landing_pages").insert({
        user_id: user.id,
        client_name: formData.client_name,
        subdomain: formData.subdomain,
        title: formData.title,
        description: formData.description || null,
        primary_color: formData.primary_color,
        logo_url: formData.logo_url || null,
        cta_text: formData.cta_text,
      });

      if (error) throw error;

      toast({
        title: "Landing page created",
        description: "Your landing page has been created successfully",
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        client_name: "",
        subdomain: "",
        title: "",
        description: "",
        primary_color: "#6366f1",
        logo_url: "",
        cta_text: "Get Started",
      });
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

  const generateSubdomain = () => {
    const subdomain = formData.client_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData({ ...formData, subdomain });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Landing Page</DialogTitle>
          <DialogDescription>
            Create a white-label landing page for your client with a unique subdomain
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client_name">Client Name</Label>
            <Input
              id="client_name"
              required
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              onBlur={generateSubdomain}
              placeholder="Acme Corporation"
            />
          </div>

          <div>
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex gap-2">
              <div className="flex-1 flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  /lp/
                </span>
                <Input
                  id="subdomain"
                  required
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                  className="rounded-l-none"
                  placeholder="acme"
                  pattern="[a-z0-9-]+"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
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
              {loading ? "Creating..." : "Create Landing Page"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLandingPageDialog;