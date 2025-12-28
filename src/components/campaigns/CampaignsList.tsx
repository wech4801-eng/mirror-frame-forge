import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnvelopeSimple, UsersThree, Eye, CursorClick, PencilSimple, PaperPlaneTilt, CalendarBlank, Play, Pause, ChartBar } from "@phosphor-icons/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import EditCampaignDialog from "./EditCampaignDialog";
import SelectProspectsDialog from "./SelectProspectsDialog";
import CampaignDetailsDialog from "./CampaignDetailsDialog";
import { useToast } from "@/components/ui/use-toast";

const CampaignsList = () => {
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [selectingProspects, setSelectingProspects] = useState<any>(null);
  const [detailsCampaignId, setDetailsCampaignId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: campaigns, refetch } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("email_campaigns")
        .select(`
          *,
          email_campaign_recipients (
            id,
            status,
            opened_at,
            clicked_at
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      brouillon: { label: "Brouillon", variant: "secondary" },
      programmee: { label: "Programmée", variant: "outline" },
      en_cours: { label: "En cours", variant: "default" },
      envoyee: { label: "Envoyée", variant: "default" },
    };
    const config = variants[status] || variants.brouillon;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleToggleCampaign = async (campaign: any) => {
    try {
      const { error } = await supabase
        .from("email_campaigns")
        .update({ is_active: !campaign.is_active })
        .eq("id", campaign.id);

      if (error) throw error;

      toast({
        title: campaign.is_active ? "Campagne pausée" : "Campagne activée",
        description: campaign.is_active 
          ? "La campagne a été mise en pause" 
          : "La campagne est maintenant active",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendCampaign = async (campaign: any) => {
    try {
      const { error } = await supabase.functions.invoke("send-campaign", {
        body: { campaignId: campaign.id },
      });

      if (error) throw error;

      toast({
        title: "Campagne envoyée",
        description: "La campagne a été envoyée avec succès",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        {campaigns?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <EnvelopeSimple className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune campagne</h3>
              <p className="text-sm text-muted-foreground">
                Créez votre première campagne d'emailing
              </p>
            </CardContent>
          </Card>
        )}

        {campaigns?.map((campaign) => {
          const recipients = campaign.email_campaign_recipients || [];
          const totalRecipients = recipients.length;
          const sentCount = recipients.filter((r: any) => r.status === "envoye").length;
          const openedCount = recipients.filter((r: any) => r.opened_at).length;
          const clickedCount = recipients.filter((r: any) => r.clicked_at).length;
          const openRate = totalRecipients > 0 ? ((openedCount / totalRecipients) * 100).toFixed(1) : "0";
          const clickRate = totalRecipients > 0 ? ((clickedCount / totalRecipients) * 100).toFixed(1) : "0";

          return (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {campaign.name}
                      {getStatusBadge(campaign.status)}
                      {campaign.is_active && (
                        <Badge variant="default" className="bg-green-600">
                          Actif
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{campaign.subject}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailsCampaignId(campaign.id)}
                    >
                      <ChartBar className="h-4 w-4 mr-2" />
                      Détails
                    </Button>
                    <Button
                      variant={campaign.is_active ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleCampaign(campaign)}
                      className={campaign.is_active ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {campaign.is_active ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Activer
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCampaign(campaign)}
                    >
                      <PencilSimple className="h-4 w-4" />
                    </Button>
                    {campaign.status === "brouillon" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectingProspects(campaign)}
                        >
                          <UsersThree className="h-4 w-4 mr-2" />
                          Destinataires ({totalRecipients})
                        </Button>
                        {totalRecipients > 0 && (
                          <Button
                            size="sm"
                            onClick={() => handleSendCampaign(campaign)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <PaperPlaneTilt className="h-4 w-4 mr-2" />
                            Envoyer
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <UsersThree className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{totalRecipients}</p>
                      <p className="text-xs text-muted-foreground">Destinataires</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PaperPlaneTilt className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{sentCount}</p>
                      <p className="text-xs text-muted-foreground">Envoyés</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{openRate}%</p>
                      <p className="text-xs text-muted-foreground">Ouverture</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CursorClick className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{clickRate}%</p>
                      <p className="text-xs text-muted-foreground">Clics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarBlank className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-xs">
                        {format(new Date(campaign.created_at), "dd MMM yyyy", { locale: fr })}
                      </p>
                      <p className="text-xs text-muted-foreground">Créée</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editingCampaign && (
        <EditCampaignDialog
          campaign={editingCampaign}
          open={!!editingCampaign}
          onOpenChange={(open) => !open && setEditingCampaign(null)}
          onSuccess={() => {
            setEditingCampaign(null);
            refetch();
          }}
        />
      )}

      {selectingProspects && (
        <SelectProspectsDialog
          campaign={selectingProspects}
          open={!!selectingProspects}
          onOpenChange={(open) => !open && setSelectingProspects(null)}
          onSuccess={() => {
            setSelectingProspects(null);
            refetch();
          }}
        />
      )}

      <CampaignDetailsDialog
        campaignId={detailsCampaignId}
        open={!!detailsCampaignId}
        onOpenChange={(open) => !open && setDetailsCampaignId(null)}
      />
    </>
  );
};

export default CampaignsList;
