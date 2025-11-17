import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle } from "lucide-react";

interface LandingPageData {
  id: string;
  client_name: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  logo_url: string | null;
  cta_text: string;
  custom_fields: any;
}

const LandingPagePublic = () => {
  const { subdomain } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pageData, setPageData] = useState<LandingPageData | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLandingPage();
  }, [subdomain]);

  const fetchLandingPage = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("subdomain", subdomain)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setPageData(data);
        const initialFormData: Record<string, string> = {};
        if (Array.isArray(data.custom_fields)) {
          data.custom_fields.forEach((field: any) => {
            initialFormData[field.name] = "";
          });
        }
        setFormData(initialFormData);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Landing page not found or inactive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageData) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("landing_page_submissions")
        .insert({
          landing_page_id: pageData.id,
          email: formData.email || "",
          full_name: formData.full_name || formData.name || "",
          phone: formData.phone || "",
          additional_data: formData,
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Success!",
        description: "Your information has been submitted successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f172a" }}>
        <div className="text-center text-white">Loading...</div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f172a" }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-white">Page Not Found</h1>
          <p className="text-gray-400">This landing page doesn't exist or is inactive</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: pageData.background_color }}
    >
      {/* Gradient Background Effects */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: pageData.primary_color }}
      />
      <div 
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: pageData.secondary_color }}
      />

      <Card className="w-full max-w-lg relative z-10 backdrop-blur-sm bg-card/95 border-border/50">
        <CardContent className="pt-8 pb-8 px-6 sm:px-8">
          {pageData.logo_url && (
            <div className="flex justify-center mb-6">
              <img 
                src={pageData.logo_url} 
                alt="Logo" 
                className="h-12 sm:h-16 object-contain"
              />
            </div>
          )}

          <div className="text-center mb-8">
            <h1 
              className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r bg-clip-text text-transparent"
              style={{ 
                backgroundImage: `linear-gradient(135deg, ${pageData.primary_color}, ${pageData.secondary_color})`
              }}
            >
              {pageData.title}
            </h1>
            {pageData.subtitle && (
              <p className="text-lg sm:text-xl text-foreground/80 mb-2">
                {pageData.subtitle}
              </p>
            )}
            {pageData.description && (
              <p className="text-sm text-muted-foreground mt-3">
                {pageData.description}
              </p>
            )}
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${pageData.primary_color}20` }}
              >
                <CheckCircle 
                  className="w-8 h-8"
                  style={{ color: pageData.primary_color }}
                />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
              <p className="text-muted-foreground">
                We've received your information and will be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {Array.isArray(pageData.custom_fields) && pageData.custom_fields.length > 0 ? (
                pageData.custom_fields.map((field: any, index: number) => (
                  <div key={index}>
                    <Label htmlFor={field.name} className="text-foreground">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.name}
                      type={field.type || "text"}
                      required={field.required}
                      placeholder={field.placeholder || ""}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                ))
              ) : (
                <>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email || ""}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full mt-6 font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={submitting}
                style={{ 
                  backgroundColor: pageData.primary_color,
                  color: "white"
                }}
              >
                {submitting ? "Submitting..." : pageData.cta_text}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPagePublic;