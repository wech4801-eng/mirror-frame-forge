import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  EnvelopeSimple, 
  Eye, 
  CursorClick, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendUp
} from "@phosphor-icons/react";

interface CampaignMetrics {
  id: string;
  name: string;
  subject: string;
  status: string;
  sentAt: string | null;
  totalRecipients: number;
  sent: number;
  opened: number;
  clicked: number;
  pending: number;
  errors: number;
  openRate: number;
  clickRate: number;
  deliveryRate: number;
  clickToOpenRate: number;
}

const ActiveCampaignsMetrics = () => {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["active-campaigns-metrics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch active campaigns
      const { data: activeCampaigns, error: campaignsError } = await supabase
        .from("email_campaigns")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (campaignsError) throw campaignsError;
      if (!activeCampaigns || activeCampaigns.length === 0) return [];

      // Fetch recipients for all active campaigns
      const campaignIds = activeCampaigns.map(c => c.id);
      const { data: recipients, error: recipientsError } = await supabase
        .from("email_campaign_recipients")
        .select("*")
        .in("campaign_id", campaignIds);

      if (recipientsError) throw recipientsError;

      // Calculate metrics for each campaign
      const metricsData: CampaignMetrics[] = activeCampaigns.map(campaign => {
        const campaignRecipients = recipients?.filter(r => r.campaign_id === campaign.id) || [];
        const total = campaignRecipients.length;
        const sent = campaignRecipients.filter(r => r.sent_at !== null).length;
        const opened = campaignRecipients.filter(r => r.opened_at !== null).length;
        const clicked = campaignRecipients.filter(r => r.clicked_at !== null).length;
        const pending = campaignRecipients.filter(r => r.status === 'en_attente').length;
        const errors = campaignRecipients.filter(r => r.status === 'erreur').length;

        return {
          id: campaign.id,
          name: campaign.name,
          subject: campaign.subject,
          status: campaign.status || 'brouillon',
          sentAt: campaign.sent_at,
          totalRecipients: total,
          sent,
          opened,
          clicked,
          pending,
          errors,
          openRate: sent > 0 ? (opened / sent) * 100 : 0,
          clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
          deliveryRate: total > 0 ? (sent / total) * 100 : 0,
          clickToOpenRate: opened > 0 ? (clicked / opened) * 100 : 0,
        };
      });

      return metricsData;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp className="h-5 w-5" />
            Campagnes Actives - Métriques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp className="h-5 w-5" />
            Campagnes Actives - Métriques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Aucune campagne active pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendUp className="h-5 w-5" />
          Campagnes Actives - Métriques
          <Badge variant="secondary" className="ml-2">{campaigns.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="border rounded-lg p-4 space-y-4">
            {/* Campaign Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{campaign.name}</h3>
                <p className="text-sm text-muted-foreground truncate max-w-md">
                  {campaign.subject}
                </p>
              </div>
              <Badge 
                variant={campaign.status === 'envoyee' ? 'default' : 'secondary'}
                className={campaign.status === 'envoyee' ? 'bg-green-500' : ''}
              >
                {campaign.status === 'envoyee' ? 'Envoyée' : 
                 campaign.status === 'en_cours' ? 'En cours' : 'Brouillon'}
              </Badge>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <EnvelopeSimple className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Envoyés</p>
                  <p className="font-semibold">{campaign.sent}/{campaign.totalRecipients}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Eye className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Ouverts</p>
                  <p className="font-semibold">{campaign.opened} ({campaign.openRate.toFixed(1)}%)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <CursorClick className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Clics</p>
                  <p className="font-semibold">{campaign.clicked} ({campaign.clickRate.toFixed(1)}%)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">En attente</p>
                  <p className="font-semibold">{campaign.pending}</p>
                </div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Taux de livraison
                  </span>
                  <span className="font-medium">{campaign.deliveryRate.toFixed(1)}%</span>
                </div>
                <Progress value={campaign.deliveryRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-blue-500" />
                    Taux d'ouverture
                  </span>
                  <span className="font-medium">{campaign.openRate.toFixed(1)}%</span>
                </div>
                <Progress value={campaign.openRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <CursorClick className="h-4 w-4 text-purple-500" />
                    Taux de clic
                  </span>
                  <span className="font-medium">{campaign.clickRate.toFixed(1)}%</span>
                </div>
                <Progress value={campaign.clickRate} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <TrendUp className="h-4 w-4 text-indigo-500" />
                    Click-to-Open Rate
                  </span>
                  <span className="font-medium">{campaign.clickToOpenRate.toFixed(1)}%</span>
                </div>
                <Progress value={campaign.clickToOpenRate} className="h-2" />
              </div>
            </div>

            {/* Error indicator if any */}
            {campaign.errors > 0 && (
              <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">{campaign.errors} erreur(s) de livraison</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActiveCampaignsMetrics;
