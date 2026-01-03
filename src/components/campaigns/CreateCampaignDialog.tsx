import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplateSelector from "./TemplateSelector";
import { BrandingSelector } from "../mail/BrandingSelector";
import { WorkflowSelector } from "./WorkflowSelector";
import { PopulationSelector } from "./PopulationSelector";
import { applyBrandingToEmailContent } from "@/lib/emailBrandingUtils";
import { CampaignValidationDialog } from "../validation/CampaignValidationDialog";
import { UserPlus } from "@phosphor-icons/react";

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string; isPredefined?: boolean;
}

interface Branding {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_family: string | null;
}

const CreateCampaignDialog = ({ open, onOpenChange }: CreateCampaignDialogProps) => {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedBranding, setSelectedBranding] = useState<Branding | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [selectedPopulation, setSelectedPopulation] = useState<string[]>([]);
  const [populationType, setPopulationType] = useState<'prospects' | 'groups'>('prospects');
  const [autoEnrollNewProspects, setAutoEnrollNewProspects] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "population" | "template">("info");
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    const brandedContent = selectedBranding 
      ? applyBrandingToEmailContent(template.content, selectedBranding)
      : template.content;
    setContent(brandedContent);
  };

  const handleBrandingChange = (branding: Branding | null) => {
    setSelectedBranding(branding);
    
    if (branding && content) {
      setContent(applyBrandingToEmailContent(content, branding));
    } else if (branding && selectedTemplate) {
      setContent(applyBrandingToEmailContent(selectedTemplate.content, branding));
    }
  };

  const handlePopulationChange = (ids: string[], type: 'prospects' | 'groups') => {
    setSelectedPopulation(ids);
    setPopulationType(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à votre campagne",
        variant: "destructive",
      });
      return;
    }

    if (selectedPopulation.length === 0) {
      toast({
        title: "Population requise",
        description: "Veuillez sélectionner au moins un prospect ou groupe",
        variant: "destructive",
      });
      return;
    }

    // Ouvrir le dialog de validation
    setValidationDialogOpen(true);
  };

  const createCampaign = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Build workflow steps from the selected workflow or create default step
      let workflowSteps = [];
      if (selectedWorkflow) {
        const { data: workflow } = await supabase
          .from("workflows")
          .select("nodes, edges")
          .eq("id", selectedWorkflow)
          .single();
        
        if (workflow) {
          // Parse workflow nodes to create steps
          const nodes = workflow.nodes as Array<{ type: string; data?: { delay?: number; delayUnit?: string; templateId?: string; subject?: string; content?: string } }>;
          workflowSteps = nodes
            .filter((n: { type: string }) => n.type === 'action' || n.type === 'delay')
            .map((n: { type: string; data?: { delay?: number; delayUnit?: string; templateId?: string; subject?: string; content?: string } }, index: number) => {
              if (n.type === 'delay') {
                return null; // We'll incorporate delays into the next action
              }
              return {
                type: 'send_email',
                template_id: n.data?.templateId || null,
                subject: n.data?.subject || subject,
                content: n.data?.content || content,
                delay_days: index > 0 ? (n.data?.delay || 0) : 0,
              };
            })
            .filter(Boolean);
        }
      }

      // If no workflow steps, create a single step with the campaign email
      if (workflowSteps.length === 0) {
        workflowSteps = [{
          type: 'send_email',
          template_id: selectedTemplate?.isPredefined ? null : (selectedTemplate?.id || null),
          subject,
          content,
          delay_days: 0,
        }];
      }

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("email_campaigns")
        .insert({
          user_id: user.id,
          name,
          subject,
          content,
          template_id: selectedTemplate?.isPredefined ? null : (selectedTemplate?.id || null),
          workflow_id: selectedWorkflow || null,
          status: "brouillon",
          is_active: false,
          auto_enroll_new_prospects: populationType === 'groups' ? autoEnrollNewProspects : false,
          target_groups: populationType === 'groups' ? selectedPopulation : [],
          workflow_steps: workflowSteps,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Add recipients based on population selection
      if (populationType === 'prospects') {
        const recipients = selectedPopulation.map(prospectId => ({
          campaign_id: campaign.id,
          prospect_id: prospectId,
          status: 'en_attente',
        }));
        
        const { error: recipientsError } = await supabase
          .from("email_campaign_recipients")
          .insert(recipients);
        
        if (recipientsError) throw recipientsError;
      } else {
        // For groups, fetch all prospects in selected groups
        const { data: prospectGroups, error: groupsError } = await supabase
          .from("prospect_groups")
          .select("prospect_id")
          .in("group_id", selectedPopulation);
        
        if (groupsError) throw groupsError;
        
        const uniqueProspectIds = [...new Set(prospectGroups?.map(pg => pg.prospect_id) || [])];
        
        const recipients = uniqueProspectIds.map(prospectId => ({
          campaign_id: campaign.id,
          prospect_id: prospectId,
          status: 'en_attente',
        }));
        
        const { error: recipientsError } = await supabase
          .from("email_campaign_recipients")
          .insert(recipients);
        
        if (recipientsError) throw recipientsError;
      }

      toast({
        title: "Campagne créée",
        description: "La campagne a été créée avec succès",
      });

      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      onOpenChange(false);
      
      // Reset form
      setName("");
      setSubject("");
      setContent("");
      setSelectedTemplate(null);
      setSelectedBranding(null);
      setSelectedWorkflow(null);
      setSelectedPopulation([]);
      setAutoEnrollNewProspects(false);
      setActiveTab("info");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Nouvelle campagne email</DialogTitle>
          <DialogDescription>
            Suivez les 3 étapes pour créer votre campagne complète
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "info" | "population" | "template")} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="info">1. Informations</TabsTrigger>
              <TabsTrigger value="population">2. Population</TabsTrigger>
              <TabsTrigger value="template">3. Contenu</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="info" className="space-y-4 py-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la campagne</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Newsletter Mars 2024"
                  required
                />
              </div>
              
              <WorkflowSelector 
                onWorkflowChange={setSelectedWorkflow}
                selectedWorkflowId={selectedWorkflow || undefined}
              />
              
              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-medium mb-2">Étapes suivantes :</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Sélectionnez votre population cible</li>
                  <li>Choisissez un template et personnalisez le contenu</li>
                  <li>Activez la campagne pour démarrer l'envoi</li>
                </ol>
              </div>
              </TabsContent>
              
              <TabsContent value="population" className="space-y-4 py-4 mt-0">
                <PopulationSelector 
                  onSelectionChange={handlePopulationChange}
                  selectedIds={selectedPopulation}
                  selectionType={populationType}
                />
                
                <div className={`border rounded-lg p-4 mt-4 ${populationType === 'groups' && selectedPopulation.length > 0 ? 'bg-muted/50' : 'bg-muted/20 opacity-60'}`}>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="auto-enroll"
                      checked={autoEnrollNewProspects}
                      onCheckedChange={(checked) => setAutoEnrollNewProspects(checked === true)}
                      disabled={populationType !== 'groups' || selectedPopulation.length === 0}
                    />
                    <div className="space-y-1">
                      <Label 
                        htmlFor="auto-enroll" 
                        className={`text-sm font-medium flex items-center gap-2 ${populationType === 'groups' && selectedPopulation.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      >
                        <UserPlus className={`h-4 w-4 ${populationType === 'groups' && selectedPopulation.length > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                        Inclure automatiquement les nouveaux prospects
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {populationType === 'groups' 
                          ? "Les nouveaux prospects ajoutés à ces groupes recevront automatiquement le workflow et les emails de cette campagne."
                          : "Sélectionnez des groupes (au lieu de prospects individuels) pour activer cette option."}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="template" className="space-y-6 py-4 mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Paramètres de l'email</h3>
                  <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Objet de l'email</Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Ex: Découvrez nos nouvelles fonctionnalités"
                        required
                      />
                    </div>
                    
                    <BrandingSelector
                      onBrandingChange={handleBrandingChange}
                      selectedBrandingId={selectedBranding?.id}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-3">Choisir votre template</h3>
                  <TemplateSelector
                    selectedTemplateId={selectedTemplate?.id || null}
                    onSelect={handleTemplateSelect}
                  />
                </div>

                {selectedTemplate && (
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <p className="text-sm font-semibold">Template sélectionné</p>
                    </div>
                    <p className="text-sm text-muted-foreground ml-4">{selectedTemplate.name}</p>
                  </div>
                )}
              </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex items-center justify-between mt-4 pt-4 border-t flex-shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!name || loading || (activeTab === "template" && !selectedTemplate && !content)}
              onClick={handleSubmit}
            >
              {loading ? "Création..." : "Créer la campagne"}
            </Button>
          </div>
        </form>
      </DialogContent>

      <CampaignValidationDialog
        open={validationDialogOpen}
        onOpenChange={setValidationDialogOpen}
        onConfirm={createCampaign}
        populationIds={selectedPopulation}
        templateId={selectedTemplate?.id}
        workflowId={selectedWorkflow || undefined}
      />
    </Dialog>
  );
};

export default CreateCampaignDialog;
