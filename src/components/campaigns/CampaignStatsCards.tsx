import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnvelopeSimple, PaperPlaneTilt, Eye, CursorClick } from "@phosphor-icons/react";

const CampaignStatsCards = () => {
  const { data: stats } = useQuery({
    queryKey: ["campaign-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Total campaigns
      const { count: totalCampaigns } = await supabase
        .from("email_campaigns")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Sent campaigns
      const { count: sentCampaigns } = await supabase
        .from("email_campaigns")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "envoyee");

      // Total recipients
      const { data: campaigns } = await supabase
        .from("email_campaigns")
        .select("id")
        .eq("user_id", user.id);

      const campaignIds = campaigns?.map(c => c.id) || [];

      const { count: totalRecipients } = await supabase
        .from("email_campaign_recipients")
        .select("*", { count: "exact", head: true })
        .in("campaign_id", campaignIds);

      // Opened emails
      const { count: openedEmails } = await supabase
        .from("email_campaign_recipients")
        .select("*", { count: "exact", head: true })
        .in("campaign_id", campaignIds)
        .not("opened_at", "is", null);

      // Clicked emails
      const { count: clickedEmails } = await supabase
        .from("email_campaign_recipients")
        .select("*", { count: "exact", head: true })
        .in("campaign_id", campaignIds)
        .not("clicked_at", "is", null);

      return {
        totalCampaigns: totalCampaigns || 0,
        sentCampaigns: sentCampaigns || 0,
        totalRecipients: totalRecipients || 0,
        openedEmails: openedEmails || 0,
        clickedEmails: clickedEmails || 0,
        openRate: totalRecipients ? ((openedEmails || 0) / totalRecipients * 100).toFixed(1) : "0",
        clickRate: totalRecipients ? ((clickedEmails || 0) / totalRecipients * 100).toFixed(1) : "0",
      };
    },
  });

  const statsCards = [
    {
      title: "Total Campagnes",
      value: stats?.totalCampaigns || 0,
      icon: Mail,
      description: `${stats?.sentCampaigns || 0} envoyées`,
    },
    {
      title: "Emails Envoyés",
      value: stats?.totalRecipients || 0,
      icon: Send,
      description: "Total des destinataires",
    },
    {
      title: "Taux d'Ouverture",
      value: `${stats?.openRate || 0}%`,
      icon: Eye,
      description: `${stats?.openedEmails || 0} ouvertures`,
    },
    {
      title: "Taux de Clic",
      value: `${stats?.clickRate || 0}%`,
      icon: MousePointerClick,
      description: `${stats?.clickedEmails || 0} clics`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CampaignStatsCards;
