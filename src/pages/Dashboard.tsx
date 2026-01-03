import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsCards from "@/components/dashboard/StatsCards";
import ProspectGroupsGrid from "@/components/dashboard/ProspectGroupsGrid";
import ProspectsTable from "@/components/dashboard/ProspectsTable";
import ProspectsChart from "@/components/dashboard/ProspectsChart";
import CampaignsPerformance from "@/components/dashboard/CampaignsPerformance";
import ActiveWorkflows from "@/components/dashboard/ActiveWorkflows";
import ActiveCampaignsMetrics from "@/components/dashboard/ActiveCampaignsMetrics";
const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
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
    <DashboardLayout>
      <div className="space-y-6">
        <WelcomeBanner />
        <StatsCards />
        
        <div className="grid gap-6 lg:grid-cols-2">
          <ProspectsChart />
          <CampaignsPerformance />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProspectGroupsGrid />
          </div>
          <ActiveWorkflows />
        </div>

        <ActiveCampaignsMetrics />
        
        <ProspectsTable />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
