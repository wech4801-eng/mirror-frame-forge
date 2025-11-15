import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersThree, EnvelopeSimple, TrendUp, Lightning, Eye, CursorClick } from "@phosphor-icons/react";

const StatsCards = () => {
  const [stats, setStats] = useState({
    totalProspects: 0,
    activeWorkflows: 0,
    totalCampaigns: 0,
    openRate: 0,
    clickRate: 0,
    templates: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [prospects, campaigns, workflows, templates] = await Promise.all([
        supabase.from("prospects").select("*", { count: "exact" }).eq("user_id", user.id),
        supabase.from("email_campaigns").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("workflows").select("*", { count: "exact" }).eq("user_id", user.id).eq("is_active", true),
        supabase.from("email_templates").select("*", { count: "exact" }).eq("user_id", user.id),
      ]);

      const campaignIds = campaigns.data?.map((c: any) => c.id) || [];
      
      let totalRecipients = 0;
      let totalOpened = 0;
      let totalClicked = 0;

      if (campaignIds.length > 0) {
        const { data: recipients } = await supabase
          .from("email_campaign_recipients")
          .select("opened_at, clicked_at")
          .in("campaign_id", campaignIds);

        totalRecipients = recipients?.length || 0;
        totalOpened = recipients?.filter((r) => r.opened_at).length || 0;
        totalClicked = recipients?.filter((r) => r.clicked_at).length || 0;
      }

      setStats({
        totalProspects: prospects.count || 0,
        activeWorkflows: workflows.count || 0,
        totalCampaigns: campaigns.count || 0,
        openRate: totalRecipients > 0 ? Math.round((totalOpened / totalRecipients) * 100) : 0,
        clickRate: totalRecipients > 0 ? Math.round((totalClicked / totalRecipients) * 100) : 0,
        templates: templates.count || 0,
      });
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Prospects",
      value: stats.totalProspects,
      icon: UsersThree,
      gradient: "from-primary to-pink",
      subtitle: "contacts",
    },
    {
      title: "Workflows Actifs",
      value: stats.activeWorkflows,
      icon: Lightning,
      gradient: "from-pink to-orange",
      subtitle: "automatisations",
    },
    {
      title: "Campagnes",
      value: stats.totalCampaigns,
      icon: EnvelopeSimple,
      gradient: "from-orange to-primary",
      subtitle: "envoyées",
    },
    {
      title: "Taux d'Ouverture",
      value: `${stats.openRate}%`,
      icon: Eye,
      gradient: "from-purple to-primary",
      subtitle: "moyen",
    },
    {
      title: "Taux de Clic",
      value: `${stats.clickRate}%`,
      icon: CursorClick,
      gradient: "from-primary to-secondary",
      subtitle: "moyen",
    },
    {
      title: "Templates",
      value: stats.templates,
      icon: TrendUp,
      gradient: "from-secondary to-accent",
      subtitle: "créés",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-card hover:shadow-glow transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient} opacity-90`}>
              <card.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {card.title}
            </p>
            <div className="text-2xl font-bold tracking-tight">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
