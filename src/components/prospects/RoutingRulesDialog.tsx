import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Trash2, Plus, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Group {
  id: string;
  name: string;
  color: string | null;
}

interface RoutingRule {
  id: string;
  name: string;
  is_active: boolean;
  priority: number;
  source_condition: string | null;
  status_condition: string | null;
  company_condition: string | null;
  target_group_id: string | null;
  target_group?: Group;
}

interface RoutingRulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoutingRulesDialog = ({ open, onOpenChange }: RoutingRulesDialogProps) => {
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formName, setFormName] = useState("");
  const [formSourceCondition, setFormSourceCondition] = useState("");
  const [formStatusCondition, setFormStatusCondition] = useState("");
  const [formCompanyCondition, setFormCompanyCondition] = useState("");
  const [formTargetGroup, setFormTargetGroup] = useState<string>("");
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [rulesData, groupsData] = await Promise.all([
        supabase
          .from("routing_rules")
          .select("*")
          .eq("user_id", user.id)
          .order("priority", { ascending: false }),
        supabase
          .from("groups")
          .select("id, name, color")
          .eq("user_id", user.id)
          .order("name"),
      ]);

      if (rulesData.error) {
        console.error("Erreur chargement règles:", rulesData.error);
        throw rulesData.error;
      }
      if (groupsData.error) {
        console.error("Erreur chargement groupes:", groupsData.error);
        throw groupsData.error;
      }

      // Enrichir les règles avec les infos des groupes
      const enrichedRules = rulesData.data?.map(rule => ({
        ...rule,
        target_group: groupsData.data?.find(g => g.id === rule.target_group_id)
      })) || [];

      setRules(enrichedRules);
      setGroups(groupsData.data || []);
      
      console.log("Règles chargées:", enrichedRules.length);
      console.log("Groupes disponibles:", groupsData.data?.length || 0);
    } catch (error: any) {
      console.error("Erreur fetchData:", error);
      toast({
        title: "Erreur de chargement",
        description: error.message || "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setFormName("");
    setFormSourceCondition("");
    setFormStatusCondition("");
    setFormCompanyCondition("");
    setFormTargetGroup("");
    setFormIsActive(true);
    setShowForm(true);
  };

  const handleEditRule = (rule: RoutingRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormSourceCondition(rule.source_condition || "");
    setFormStatusCondition(rule.status_condition || "");
    setFormCompanyCondition(rule.company_condition || "");
    setFormTargetGroup(rule.target_group_id || "");
    setFormIsActive(rule.is_active);
    setShowForm(true);
  };

  const handleSaveRule = async () => {
    if (!formName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la règle est requis",
        variant: "destructive",
      });
      return;
    }

    if (!formTargetGroup) {
      toast({
        title: "Erreur",
        description: "Vous devez sélectionner un groupe cible",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const ruleData = {
        user_id: user.id,
        name: formName.trim(),
        source_condition: formSourceCondition.trim() || null,
        status_condition: formStatusCondition || null,
        company_condition: formCompanyCondition.trim() || null,
        target_group_id: formTargetGroup,
        is_active: formIsActive,
        priority: editingRule?.priority ?? rules.length,
      };

      console.log("Sauvegarde règle:", ruleData);

      if (editingRule) {
        const { error } = await supabase
          .from("routing_rules")
          .update(ruleData)
          .eq("id", editingRule.id);
        
        if (error) {
          console.error("Erreur update:", error);
          throw error;
        }
        toast({ title: "Règle mise à jour avec succès" });
      } else {
        const { error } = await supabase
          .from("routing_rules")
          .insert(ruleData);
        
        if (error) {
          console.error("Erreur insert:", error);
          throw error;
        }
        toast({ title: "Règle créée avec succès" });
      }

      setShowForm(false);
      fetchData();
    } catch (error: any) {
      console.error("Erreur handleSaveRule:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Impossible de sauvegarder la règle",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Supprimer cette règle ?")) return;

    try {
      const { error } = await supabase
        .from("routing_rules")
        .delete()
        .eq("id", ruleId);

      if (error) throw error;

      toast({ title: "Règle supprimée" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (rule: RoutingRule) => {
    try {
      const { error } = await supabase
        .from("routing_rules")
        .update({ is_active: !rule.is_active })
        .eq("id", rule.id);

      if (error) throw error;

      toast({ title: rule.is_active ? "Règle désactivée" : "Règle activée" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle>Règles de routage automatique</DialogTitle>
          <DialogDescription>
            Définissez des règles pour assigner automatiquement les prospects à des groupes
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : showForm ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de la règle</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Prospects du site web vers Groupe Lead Web"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Source (optionnel)</Label>
                <Input
                  value={formSourceCondition}
                  onChange={(e) => setFormSourceCondition(e.target.value)}
                  placeholder="Ex: website"
                />
              </div>
              <div className="space-y-2">
                <Label>Statut (optionnel)</Label>
                <Select value={formStatusCondition || "all"} onValueChange={(val) => setFormStatusCondition(val === "all" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="nouveau">Nouveau</SelectItem>
                    <SelectItem value="qualifie">Qualifié</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="perdu">Perdu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Entreprise contient (optionnel)</Label>
                <Input
                  value={formCompanyCondition}
                  onChange={(e) => setFormCompanyCondition(e.target.value)}
                  placeholder="Ex: Tech"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Groupe cible</Label>
              <Select value={formTargetGroup} onValueChange={setFormTargetGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un groupe" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: group.color || "#6366f1" }}
                        />
                        {group.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
              <Label>Règle active</Label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveRule} disabled={!formName || !formTargetGroup}>
                {editingRule ? "Mettre à jour" : "Créer la règle"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            {groups.length === 0 ? (
              <Card className="border-orange/50 bg-orange/5">
                <CardContent className="py-8 text-center">
                  <p className="text-lg font-medium mb-2">Aucun groupe disponible</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vous devez d'abord créer des groupes de prospects avant de pouvoir configurer des règles de routage.
                  </p>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Fermer et créer des groupes
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {rules.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        <p>Aucune règle de routage configurée</p>
                        <p className="text-sm mt-2">
                          Créez votre première règle pour automatiser l'assignation des prospects
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    rules.map((rule) => (
                      <Card key={rule.id} className={!rule.is_active ? "opacity-60" : ""}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-move" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-base">{rule.name}</CardTitle>
                                  {!rule.is_active && <Badge variant="secondary">Inactive</Badge>}
                                </div>
                                <CardDescription className="mt-2 space-y-1">
                                  {rule.source_condition && (
                                    <div className="text-sm">Source: {rule.source_condition}</div>
                                  )}
                                  {rule.status_condition && (
                                    <div className="text-sm">Statut: {rule.status_condition}</div>
                                  )}
                                  {rule.company_condition && (
                                    <div className="text-sm">Entreprise contient: {rule.company_condition}</div>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <ArrowRight className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">
                                      Groupe: {rule.target_group?.name || "N/A"}
                                    </span>
                                  </div>
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={rule.is_active}
                                onCheckedChange={() => handleToggleActive(rule)}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditRule(rule)}
                              >
                                Modifier
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRule(rule.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  )}
                </div>

                <DialogFooter>
                  <Button onClick={handleCreateRule}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle règle
                  </Button>
                </DialogFooter>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
