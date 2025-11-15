import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MailTab from "@/components/dashboard/MailTab";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";

const Mail = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <OnboardingGuard currentStepId="templates">
      <DashboardLayout>
        <div className="space-y-8">
          <OnboardingProgress />
          <MailTab />
        </div>
      </DashboardLayout>
    </OnboardingGuard>
  );
};

export default Mail;
