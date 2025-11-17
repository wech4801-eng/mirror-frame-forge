import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Globe, Copy, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CreateLandingPageDialog from "@/components/landingpages/CreateLandingPageDialog";
import EditLandingPageDialog from "@/components/landingpages/EditLandingPageDialog";

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
  created_at: string;
  custom_fields: any;
}

const LandingPages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);

  useEffect(() => {
    checkAuth();
    fetchLandingPages();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchLandingPages = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLandingPages(data || []);
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

  const copyLink = (subdomain: string) => {
    const link = `${window.location.origin}/lp/${subdomain}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Lien copié",
      description: "Le lien de la landing page a été copié dans le presse-papiers",
    });
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("landing_pages")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      
      fetchLandingPages();
      toast({
        title: "Statut mis à jour",
        description: `Landing page ${!currentStatus ? 'activée' : 'désactivée'}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette landing page ?")) return;

    try {
      const { error } = await supabase
        .from("landing_pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      fetchLandingPages();
      toast({
        title: "Supprimé",
        description: "Landing page supprimée avec succès",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Landing Pages</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage white-label landing pages for your clients
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Landing Page
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : landingPages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Landing Pages Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first landing page to start collecting leads
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Landing Page
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {landingPages.map((page) => (
              <Card key={page.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Client: {page.client_name}
                      </CardDescription>
                    </div>
                    <Badge variant={page.is_active ? "default" : "secondary"}>
                      {page.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <code className="flex-1 truncate">/lp/{page.subdomain}</code>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyLink(page.subdomain)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(`/lp/${page.subdomain}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedPage(page);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePage(page.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateLandingPageDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchLandingPages}
      />

      {selectedPage && (
        <EditLandingPageDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          landingPage={selectedPage}
          onSuccess={fetchLandingPages}
        />
      )}
    </DashboardLayout>
  );
};

export default LandingPages;