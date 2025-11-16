import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  UsersThree,
  FlowArrow,
  EnvelopeSimple,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  CursorClick,
} from "@phosphor-icons/react";

interface CampaignDetailsDialogProps {
  campaignId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CampaignDetailsDialog = ({
  campaignId,
  open,
  onOpenChange,
}: CampaignDetailsDialogProps) => {
  const { data: campaignDetails } = useQuery({
    queryKey: ["campaign-details", campaignId],
    enabled: !!campaignId && open,
    queryFn: async () => {
      if (!campaignId) return null;

      // Récupérer les détails de la campagne
      const { data: campaign, error: campaignError } = await supabase
        .from("email_campaigns")
        .select(`
          *,
          email_templates (name, subject),
          workflows (name, description)
        `)
        .eq("id", campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Récupérer les destinataires avec leurs détails
      const { data: recipients, error: recipientsError } = await supabase
        .from("email_campaign_recipients")
        .select(`
          *,
          prospects (
            id,
            full_name,
            email,
            company
          )
        `)
        .eq("campaign_id", campaignId);

      if (recipientsError) throw recipientsError;

      // Récupérer les groupes associés aux prospects
      const prospectIds = recipients.map((r: any) => r.prospect_id);
      const { data: prospectGroups } = await supabase
        .from("prospect_groups")
        .select(`
          prospect_id,
          groups (name, color)
        `)
        .in("prospect_id", prospectIds);

      // Calculer les statistiques
      const stats = {
        total: recipients.length,
        sent: recipients.filter((r: any) => r.sent_at).length,
        opened: recipients.filter((r: any) => r.opened_at).length,
        clicked: recipients.filter((r: any) => r.clicked_at).length,
        pending: recipients.filter((r: any) => !r.sent_at).length,
        error: recipients.filter((r: any) => r.status === "erreur").length,
      };

      // Organiser les prospects par groupe
      const groupsMap = new Map();
      prospectGroups?.forEach((pg: any) => {
        if (!groupsMap.has(pg.groups.name)) {
          groupsMap.set(pg.groups.name, {
            name: pg.groups.name,
            color: pg.groups.color,
            prospects: [],
          });
        }
        groupsMap.get(pg.groups.name).prospects.push(pg.prospect_id);
      });

      return {
        campaign,
        recipients,
        stats,
        groups: Array.from(groupsMap.values()),
      };
    },
  });

  const getStepColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-500 bg-green-500/10";
    if (percentage >= 50) return "text-yellow-500 bg-yellow-500/10";
    if (percentage >= 25) return "text-orange-500 bg-orange-500/10";
    return "text-red-500 bg-red-500/10";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  if (!campaignDetails) return null;

  const { campaign, recipients, stats, groups } = campaignDetails;

  const sentPercentage = stats.total > 0 ? (stats.sent / stats.total) * 100 : 0;
  const openedPercentage = stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0;
  const clickedPercentage = stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{campaign.name}</DialogTitle>
            <Badge variant={campaign.is_active ? "default" : "secondary"}>
              {campaign.is_active ? "Actif" : "Inactif"}
            </Badge>
          </div>
          <DialogDescription>{campaign.subject}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Progression des prospects */}
            {campaign.is_active && (
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Progression de la campagne
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Étape 1: Envoyés */}
                    <div className={`p-4 rounded-lg ${getStepColor(sentPercentage)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Envoyés</span>
                        <span className="text-xl font-bold">
                          {sentPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={sentPercentage}
                        className={`h-2 ${getProgressColor(sentPercentage)}`}
                      />
                      <p className="text-xs mt-2">
                        {stats.sent} / {stats.total} prospects
                      </p>
                    </div>

                    {/* Étape 2: Ouverts */}
                    <div className={`p-4 rounded-lg ${getStepColor(openedPercentage)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Ouverts</span>
                        <span className="text-xl font-bold">
                          {openedPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={openedPercentage}
                        className={`h-2 ${getProgressColor(openedPercentage)}`}
                      />
                      <p className="text-xs mt-2">
                        {stats.opened} / {stats.sent} envoyés
                      </p>
                    </div>

                    {/* Étape 3: Cliqués */}
                    <div className={`p-4 rounded-lg ${getStepColor(clickedPercentage)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Cliqués</span>
                        <span className="text-xl font-bold">
                          {clickedPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={clickedPercentage}
                        className={`h-2 ${getProgressColor(clickedPercentage)}`}
                      />
                      <p className="text-xs mt-2">
                        {stats.clicked} / {stats.opened} ouverts
                      </p>
                    </div>
                  </div>

                  {/* Détails des statuts */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold text-blue-500">{stats.pending}</p>
                      <p className="text-xs text-muted-foreground">En attente</p>
                    </div>
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold text-green-500">{stats.sent}</p>
                      <p className="text-xs text-muted-foreground">Envoyés</p>
                    </div>
                    <div className="text-center">
                      <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <p className="text-2xl font-bold text-red-500">{stats.error}</p>
                      <p className="text-xs text-muted-foreground">Erreurs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informations de la campagne */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Template */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <EnvelopeSimple className="h-4 w-4" />
                    Template Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {campaign.email_templates?.name || "Aucun template"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sujet : {campaign.email_templates?.subject || campaign.subject}
                  </p>
                </CardContent>
              </Card>

              {/* Workflow */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FlowArrow className="h-4 w-4" />
                    Workflow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {campaign.workflows?.name || "Aucun workflow"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {campaign.workflows?.description || "Envoi manuel"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Groupes */}
            {groups.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UsersThree className="h-4 w-4" />
                    Groupes de prospects ({groups.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {groups.map((group: any, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        style={{
                          borderColor: group.color,
                          color: group.color,
                        }}
                      >
                        {group.name} ({group.prospects.length})
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Liste des prospects */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Prospects ({stats.total})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {recipients.map((recipient: any) => (
                      <div
                        key={recipient.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {recipient.prospects.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {recipient.prospects.email}
                            {recipient.prospects.company &&
                              ` • ${recipient.prospects.company}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {recipient.opened_at && (
                            <Badge variant="outline" className="gap-1">
                              <Eye className="h-3 w-3" />
                              Ouvert
                            </Badge>
                          )}
                          {recipient.clicked_at && (
                            <Badge variant="outline" className="gap-1">
                              <CursorClick className="h-3 w-3" />
                              Cliqué
                            </Badge>
                          )}
                          <Badge
                            variant={
                              recipient.status === "envoye"
                                ? "default"
                                : recipient.status === "erreur"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {recipient.status === "envoye"
                              ? "Envoyé"
                              : recipient.status === "erreur"
                              ? "Erreur"
                              : "En attente"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDetailsDialog;
