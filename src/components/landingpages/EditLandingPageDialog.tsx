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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LandingPage {
  id: string;
  client_name: string;
  subdomain: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  logo_url: string | null;
  cta_text: string;
  is_active: boolean;
  custom_fields: any;
}

interface EditLandingPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  landingPage: LandingPage;
  onSuccess: () => void;
}

interface CustomField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
}

const EditLandingPageDialog = ({ open, onOpenChange, landingPage, onSuccess }: EditLandingPageDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    primary_color: "#ef4444",
    secondary_color: "#8b5cf6",
    background_color: "#0f172a",
    logo_url: "",
    cta_text: "Get Started",
    is_active: true,
  });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  useEffect(() => {
    if (landingPage) {
      setFormData({
        title: landingPage.title,
        subtitle: landingPage.subtitle || "",
        description: landingPage.description || "",
        primary_color: landingPage.primary_color,
        secondary_color: landingPage.secondary_color || "#8b5cf6",
        background_color: landingPage.background_color || "#0f172a",
        logo_url: landingPage.logo_url || "",
        cta_text: landingPage.cta_text,
        is_active: landingPage.is_active,
      });
      setCustomFields(Array.isArray(landingPage.custom_fields) ? landingPage.custom_fields : [
        { name: "full_name", label: "Full Name", type: "text", required: true, placeholder: "" },
        { name: "email", label: "Email", type: "email", required: true, placeholder: "" },
        { name: "phone", label: "Phone", type: "tel", required: false, placeholder: "" },
      ]);
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
          subtitle: formData.subtitle || null,
          description: formData.description || null,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          background_color: formData.background_color,
          logo_url: formData.logo_url || null,
          cta_text: formData.cta_text,
          is_active: formData.is_active,
          custom_fields: customFields as any,
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

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { name: "", label: "", type: "text", required: false, placeholder: "" }
    ]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, updates: Partial<CustomField>) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], ...updates };
    setCustomFields(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Landing Page</DialogTitle>
          <DialogDescription>
            Update the landing page for {landingPage.client_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="form">Form Fields</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active Status</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div>
                <Label htmlFor="title">Main Title</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Transform Your Business Today"
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Join thousands of satisfied customers"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief description of your offering"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="cta_text">Button Text</Label>
                <Input
                  id="cta_text"
                  required
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  placeholder="Get Started"
                />
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-14 h-10 p-1"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-14 h-10 p-1"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="background_color">Background</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="w-14 h-10 p-1"
                    />
                    <Input
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="form" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label>Form Fields</Label>
                <Button type="button" size="sm" onClick={addCustomField}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {customFields.map((field, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Field {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Field Name</Label>
                        <Input
                          required
                          value={field.name}
                          onChange={(e) => updateCustomField(index, { name: e.target.value })}
                          placeholder="email"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Label</Label>
                        <Input
                          required
                          value={field.label}
                          onChange={(e) => updateCustomField(index, { label: e.target.value })}
                          placeholder="Email Address"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateCustomField(index, { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="tel">Phone</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="url">URL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Placeholder</Label>
                        <Input
                          value={field.placeholder}
                          onChange={(e) => updateCustomField(index, { placeholder: e.target.value })}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) => updateCustomField(index, { required: checked })}
                      />
                      <Label className="text-xs">Required field</Label>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
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