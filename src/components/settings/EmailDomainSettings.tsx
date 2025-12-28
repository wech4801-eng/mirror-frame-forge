import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  CircleNotch, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Copy, 
  ArrowClockwise,
  EnvelopeSimple,
  Shield,
  Info
} from "@phosphor-icons/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface EmailDomain {
  id: string;
  domain: string;
  from_name: string;
  from_email: string;
  reply_to: string | null;
  is_verified: boolean;
  dkim_status: string;
  spf_status: string;
  dmarc_status: string;
  resend_domain_id: string | null;
}

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  status: string;
  ttl?: string;
}

interface EmailDomainSettingsProps {
  userId: string;
}

export const EmailDomainSettings = ({ userId }: EmailDomainSettingsProps) => {
  const [domain, setDomain] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [existingDomain, setExistingDomain] = useState<EmailDomain | null>(null);
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadExistingDomain();
  }, [userId]);

  const loadExistingDomain = async () => {
    const { data, error } = await supabase
      .from("email_domains")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data && !error) {
      setExistingDomain(data as EmailDomain);
      setDomain(data.domain);
      setFromName(data.from_name);
      setFromEmail(data.from_email);
      setReplyTo(data.reply_to || "");
    }
  };

  const handleAddDomain = async () => {
    const normalizedDomain = domain.trim().toLowerCase();
    const normalizedFromName = fromName.trim();
    const normalizedFromEmail = fromEmail.trim();
    const normalizedReplyTo = replyTo.trim();

    if (!normalizedDomain || !normalizedFromName || !normalizedFromEmail) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Validation simple côté UI pour éviter les erreurs classiques
    if (normalizedDomain.includes(" ") || !normalizedDomain.includes(".")) {
      toast({
        title: "Domaine invalide",
        description: "Veuillez saisir un domaine complet (ex: exemple.com).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Call backend function to add domain to Resend
      const { data: resendData, error: resendError } = await supabase.functions.invoke(
        "verify-domain",
        { body: { domain: normalizedDomain } }
      );

      if (resendError) throw resendError;

      // Save domain configuration
      const { error: dbError } = await supabase.from("email_domains").upsert({
        user_id: userId,
        domain: normalizedDomain,
        from_name: normalizedFromName,
        from_email: normalizedFromEmail,
        reply_to: normalizedReplyTo || null,
        resend_domain_id: resendData.domain_id,
        is_verified: false,
        dkim_status: "pending",
        spf_status: "pending",
        dmarc_status: "pending",
      });

      if (dbError) throw dbError;

      setDnsRecords(resendData.records || []);
      await loadExistingDomain();

      toast({
        title: "Domaine ajouté",
        description:
          "Configurez les enregistrements DNS ci-dessous pour vérifier votre domaine",
      });
    } catch (error: unknown) {
      let errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";

      // Supabase Functions errors often include a Response in `context`
      const maybeContext = (error as any)?.context;
      if (maybeContext && typeof maybeContext.json === "function") {
        try {
          const body = await maybeContext.json();
          if (body?.error) errorMessage = body.error;
        } catch {
          // ignore
        }
      }

      console.error("Error adding domain:", error);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!existingDomain?.resend_domain_id) return;

    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-domain-status", {
        body: { domainId: existingDomain.resend_domain_id },
      });

      if (error) throw error;

      // Update domain status in database
      await supabase.from("email_domains").update({
        is_verified: data.is_verified,
        dkim_status: data.dkim_status,
        spf_status: data.spf_status,
        dmarc_status: data.mx_status,
      }).eq("id", existingDomain.id);

      setDnsRecords(data.records || []);
      await loadExistingDomain();

      toast({
        title: data.is_verified ? "Domaine vérifié !" : "Vérification en cours",
        description: data.is_verified 
          ? "Votre domaine est prêt pour l'envoi d'emails" 
          : "Certains enregistrements DNS ne sont pas encore propagés",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!existingDomain) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("email_domains").update({
        from_name: fromName,
        from_email: fromEmail,
        reply_to: replyTo || null,
      }).eq("id", existingDomain.id);

      if (error) throw error;

      toast({
        title: "Paramètres mis à jour",
        description: "Vos paramètres d'envoi ont été enregistrés",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Valeur copiée dans le presse-papiers",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Vérifié</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Échec</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Configuration du domaine email
        </CardTitle>
        <CardDescription>
          Configurez votre propre domaine pour envoyer des emails professionnels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert pour les utilisateurs sans domaine */}
        {!existingDomain && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Pourquoi configurer un domaine ?</AlertTitle>
            <AlertDescription>
              Configurer votre propre domaine améliore la délivrabilité de vos emails et renforce la confiance de vos destinataires.
              Sans domaine configuré, vos emails seront envoyés depuis <code>onboarding@resend.dev</code>.
            </AlertDescription>
          </Alert>
        )}

        {/* Formulaire de configuration */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="domain">Nom de domaine *</Label>
            <Input
              id="domain"
              placeholder="exemple.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={!!existingDomain}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fromName">Nom d'expéditeur *</Label>
            <Input
              id="fromName"
              placeholder="Mon Entreprise"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fromEmail">Adresse d'envoi *</Label>
            <div className="flex items-center gap-2">
              <EnvelopeSimple className="h-4 w-4 text-muted-foreground" />
              <Input
                id="fromEmail"
                placeholder="contact@exemple.com"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="replyTo">Adresse de réponse (optionnel)</Label>
            <Input
              id="replyTo"
              placeholder="support@exemple.com"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2">
          {!existingDomain ? (
            <Button onClick={handleAddDomain} disabled={loading}>
              {loading ? (
                <CircleNotch className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Globe className="h-4 w-4 mr-2" />
              )}
              Ajouter le domaine
            </Button>
          ) : (
            <>
              <Button onClick={handleUpdateSettings} disabled={loading}>
                {loading ? (
                  <CircleNotch className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Enregistrer
              </Button>
              <Button variant="outline" onClick={handleCheckStatus} disabled={checking}>
                {checking ? (
                  <CircleNotch className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowClockwise className="h-4 w-4 mr-2" />
                )}
                Vérifier le statut
              </Button>
            </>
          )}
        </div>

        {/* Statut du domaine */}
        {existingDomain && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-1">
                <p className="font-medium">{existingDomain.domain}</p>
                <p className="text-sm text-muted-foreground">Statut de vérification</p>
              </div>
              {existingDomain.is_verified ? (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" /> Vérifié
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" /> En attente
                </Badge>
              )}
            </div>

            {/* Statuts détaillés */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg border text-center">
                <Shield className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">DKIM</p>
                {getStatusBadge(existingDomain.dkim_status)}
              </div>
              <div className="p-3 rounded-lg border text-center">
                <Shield className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">SPF</p>
                {getStatusBadge(existingDomain.spf_status)}
              </div>
              <div className="p-3 rounded-lg border text-center">
                <Shield className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">DMARC</p>
                {getStatusBadge(existingDomain.dmarc_status)}
              </div>
            </div>
          </div>
        )}

        {/* Enregistrements DNS */}
        {dnsRecords.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="dns-records">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Enregistrements DNS à configurer ({dnsRecords.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Configuration DNS</AlertTitle>
                    <AlertDescription>
                      Ajoutez ces enregistrements dans la zone DNS de votre domaine chez votre registrar (OVH, Gandi, Cloudflare, etc.).
                      La propagation DNS peut prendre jusqu'à 48 heures.
                    </AlertDescription>
                  </Alert>

                  {dnsRecords.map((record, index) => (
                    <div key={index} className="p-4 rounded-lg border space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{record.type}</Badge>
                        {getStatusBadge(record.status)}
                      </div>
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Nom :</span>
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-muted rounded text-xs max-w-[300px] truncate">
                              {record.name}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(record.name)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Valeur :</span>
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-muted rounded text-xs max-w-[300px] truncate">
                              {record.value}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(record.value)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};
