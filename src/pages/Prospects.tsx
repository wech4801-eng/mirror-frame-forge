import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProspectsList from "@/components/prospects/ProspectsList";
import AddProspectDialog from "@/components/prospects/AddProspectDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";

const Prospects = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  return (
    <OnboardingGuard currentStepId="prospects">
      <DashboardLayout>
        <div className="space-y-8">
          <OnboardingProgress />
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Gestion des Prospects</h1>
              <p className="text-muted-foreground">
                Gérez tous vos prospects et organisez-les en groupes
              </p>
            </div>
            <Button 
              onClick={() => setDialogOpen(true)} 
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Prospect
            </Button>
          </div>

          <ProspectsList />
          
          <AddProspectDialog 
            open={dialogOpen} 
            onOpenChange={setDialogOpen}
          />
        </div>
      </DashboardLayout>
    </OnboardingGuard>
  );
};

export default Prospects;
