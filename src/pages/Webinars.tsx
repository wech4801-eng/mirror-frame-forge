import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Video, Calendar, Users, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import CreateWebinarDialog from "@/components/webinars/CreateWebinarDialog";

const Webinars = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [webinars, setWebinars] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadWebinars();
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadWebinars = async () => {
    const { data, error } = await supabase
      .from("webinars")
      .select(`
        *,
        webinar_invitations(count)
      `)
      .order("scheduled_at", { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les webinaires",
        variant: "destructive",
      });
    } else {
      setWebinars(data || []);
    }
  };

  const copyLink = (link: string) => {
    const fullLink = `${window.location.origin}/webinar/${link}`;
    navigator.clipboard.writeText(fullLink);
    toast({
      title: "Lien copié",
      description: "Le lien du webinaire a été copié dans le presse-papier",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Webinaires</h1>
            <p className="text-muted-foreground mt-1">
              Créez et gérez vos webinaires en direct
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un webinaire
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {webinars.map((webinar) => (
            <Card key={webinar.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    webinar.status === "planifie"
                      ? "bg-blue-100 text-blue-800"
                      : webinar.status === "en_cours"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {webinar.status === "planifie" ? "Planifié" : webinar.status === "en_cours" ? "En cours" : "Terminé"}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-foreground">{webinar.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{webinar.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(webinar.scheduled_at), "PPP 'à' HH:mm", { locale: fr })}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  {webinar.webinar_invitations?.[0]?.count || 0} invités
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => copyLink(webinar.viewer_link)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copier le lien
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/webinar/${webinar.id}/host`)}
                >
                  Démarrer
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {webinars.length === 0 && (
          <div className="text-center py-12">
            <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun webinaire</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre premier webinaire pour commencer à vendre vos formations
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un webinaire
            </Button>
          </div>
        )}

        <CreateWebinarDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={loadWebinars}
        />
      </div>
    </DashboardLayout>
  );
};

export default Webinars;
