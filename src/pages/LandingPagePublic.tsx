import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface LandingPageData {
  id: string;
  client_name: string;
  title: string;
  description: string | null;
  primary_color: string;
  logo_url: string | null;
  cta_text: string;
  form_fields: any;
}

const LandingPagePublic = () => {
  const { subdomain } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pageData, setPageData] = useState<LandingPageData | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
  });

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
        .single();

      if (error) throw error;
      setPageData(data);
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
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">This landing page doesn't exist or is inactive</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: `${pageData.primary_color}10` }}>
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {pageData.logo_url && (
            <div className="flex justify-center mb-6">
              <img src={pageData.logo_url} alt="Logo" className="h-16 object-contain" />
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3" style={{ color: pageData.primary_color }}>
              {pageData.title}
            </h1>
            {pageData.description && (
              <p className="text-muted-foreground">{pageData.description}</p>
            )}
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
              <p className="text-muted-foreground">
                We've received your information and will be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {Array.isArray(pageData.form_fields) && pageData.form_fields.includes("full_name") && (
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
              )}

              {Array.isArray(pageData.form_fields) && pageData.form_fields.includes("email") && (
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              )}

              {Array.isArray(pageData.form_fields) && pageData.form_fields.includes("phone") && (
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
                style={{ backgroundColor: pageData.primary_color }}
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