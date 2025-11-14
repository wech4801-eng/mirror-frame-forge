import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, TrendingUp, MousePointerClick } from "lucide-react";

const StatsCards = () => {
  const [stats, setStats] = useState({
    totalProspects: 0,
    newProspects: 0,
    totalCampaigns: 0,
    totalClicks: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [prospects, campaigns] = await Promise.all([
        supabase.from("prospects").select("*", { count: "exact" }).eq("user_id", user.id),
        supabase.from("email_campaigns").select("*", { count: "exact" }).eq("user_id", user.id),
      ]);

      const newProspects = prospects.data?.filter(
        (p) => p.status === "nouveau"
      ).length || 0;

      const totalClicks = prospects.data?.reduce(
        (sum, p) => sum + (p.click_count || 0),
        0
      ) || 0;

      setStats({
        totalProspects: prospects.count || 0,
        newProspects,
        totalCampaigns: campaigns.count || 0,
        totalClicks,
      });
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Prospects",
      value: stats.totalProspects,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Nouveaux Prospects",
      value: stats.newProspects,
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Campagnes",
      value: stats.totalCampaigns,
      icon: Mail,
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Clics Totaux",
      value: stats.totalClicks,
      icon: MousePointerClick,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient}`}>
              <card.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
