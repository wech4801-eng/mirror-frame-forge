import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Mail, MousePointerClick, Eye } from "lucide-react";

const CampaignsPerformance = () => {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ sent: 0, opened: 0, clicked: 0 });

  useEffect(() => {
    const fetchCampaignsData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: campaigns } = await supabase
        .from("email_campaigns")
        .select(`
          id,
          name,
          status,
          sent_at,
          email_campaign_recipients (
            status,
            opened_at,
            clicked_at
          )
        `)
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(5);

      if (!campaigns) return;

      let totalSent = 0;
      let totalOpened = 0;
      let totalClicked = 0;

      const chartData = campaigns.map(campaign => {
        const recipients = campaign.email_campaign_recipients || [];
        const sent = recipients.length;
        const opened = recipients.filter((r: any) => r.opened_at).length;
        const clicked = recipients.filter((r: any) => r.clicked_at).length;

        totalSent += sent;
        totalOpened += opened;
        totalClicked += clicked;

        return {
          name: campaign.name.length > 20 ? campaign.name.substring(0, 20) + "..." : campaign.name,
          envoyés: sent,
          ouverts: opened,
          clics: clicked,
          tauxOuverture: sent > 0 ? Math.round((opened / sent) * 100) : 0,
          tauxClic: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
        };
      });

      setData(chartData);
      setStats({ sent: totalSent, opened: totalOpened, clicked: totalClicked });
    };

    fetchCampaignsData();
  }, []);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Performance des Campagnes</CardTitle>
        <p className="text-sm text-muted-foreground">5 dernières campagnes</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.sent}</p>
              <p className="text-xs text-muted-foreground">Envoyés</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Eye className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.opened}</p>
              <p className="text-xs text-muted-foreground">Ouvertures</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-2 rounded-lg bg-accent/10">
              <MousePointerClick className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.clicked}</p>
              <p className="text-xs text-muted-foreground">Clics</p>
            </div>
          </div>
        </div>

        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="envoyés" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ouverts" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clics" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Aucune donnée de campagne disponible
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignsPerformance;
