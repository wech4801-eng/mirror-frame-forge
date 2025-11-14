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
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-card hover:shadow-glow transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-3 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {card.title}
            </CardTitle>
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} opacity-90`}>
              <card.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
