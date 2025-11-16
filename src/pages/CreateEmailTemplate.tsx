import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FloppyDisk } from "@phosphor-icons/react";
import SimpleEmailEditor from "@/components/campaigns/SimpleEmailEditor";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";

const CreateEmailTemplate = () => {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("email_templates").insert({
        name: name.trim(),
        subject: subject.trim(),
        content: content,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Template créé avec succès",
      });

      navigate("/mail");
    } catch (error: any) {
      console.error("Error creating template:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
                <h1 className="text-3xl font-bold">Nouveau modèle d'e-mail</h1>
                <p className="text-muted-foreground">
                  Créez un template personnalisé pour vos campagnes
                </p>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading || !name.trim() || !subject.trim() || !content.trim()}
              size="lg"
            >
              <FloppyDisk className="h-5 w-5 mr-2" />
              {loading ? "Enregistrement..." : "Enregistrer le modèle"}
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

export default CreateEmailTemplate;
