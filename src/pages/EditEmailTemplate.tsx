import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FloppyDisk } from "@phosphor-icons/react";
import SimpleEmailEditor from "@/components/campaigns/SimpleEmailEditor";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";

const EditEmailTemplate = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("email_templates")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setName(data.name);
          setSubject(data.subject);
          setContent(data.content);
        }
      } catch (error: any) {
        console.error("Error fetching template:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le template",
          variant: "destructive",
        });
        navigate("/mail");
      } finally {
        setFetching(false);
      }
    };

    fetchTemplate();
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !subject.trim() || !content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          name: name.trim(),
          subject: subject.trim(),
          content: content,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Template modifié avec succès",
      });

      navigate("/mail");
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <OnboardingGuard currentStepId="templates">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/mail")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Modifier le modèle d'e-mail</h1>
                <p className="text-muted-foreground">
                  Modifiez votre template pour vos campagnes
                </p>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading || !name.trim() || !subject.trim() || !content.trim()}
              size="lg"
            >
              <FloppyDisk className="h-5 w-5 mr-2" />
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>

          {/* Editor */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <SimpleEmailEditor
              name={name}
              subject={subject}
              cc={cc}
              bcc={bcc}
              content={content}
              onNameChange={setName}
              onSubjectChange={setSubject}
              onCcChange={setCc}
              onBccChange={setBcc}
              onContentChange={setContent}
            />
          </form>
        </div>
      </DashboardLayout>
    </OnboardingGuard>
  );
};

export default EditEmailTemplate;
