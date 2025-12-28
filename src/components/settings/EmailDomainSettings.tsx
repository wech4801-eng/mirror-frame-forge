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
  Info,
  MagnifyingGlass,
  Lightbulb,
  Warning
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
  const [testingDns, setTestingDns] = useState(false);
  const [dnsTestResults, setDnsTestResults] = useState<{type: string; status: 'success' | 'error' | 'pending'; message: string}[]>([]);
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

  const handleTestDns = async () => {
    if (!existingDomain) return;
    
    setTestingDns(true);
    setDnsTestResults([]);
    
    try {
      const domainName = existingDomain.domain;
      const results: {type: string; status: 'success' | 'error' | 'pending'; message: string}[] = [];
      
      // Vérifier l'enregistrement SPF (TXT sur send.domain)
      try {
        const spfSubdomain = `send.${domainName}`;
        const response = await fetch(`https://dns.google/resolve?name=${spfSubdomain}&type=TXT`);
        const data = await response.json();
        
        if (data.Answer && data.Answer.length > 0) {
          const hasSpf = data.Answer.some((a: { data: string }) => 
            a.data.includes('v=spf1') && a.data.includes('amazonses.com')
          );
          if (hasSpf) {
            results.push({
              type: 'SPF',
              status: 'success',
              message: `Enregistrement SPF correctement configuré sur send.${domainName}`
            });
          } else {
            results.push({
              type: 'SPF',
              status: 'error',
              message: `Enregistrement TXT trouvé sur send.${domainName} mais la valeur SPF est incorrecte`
            });
          }
        } else {
          results.push({
            type: 'SPF',
            status: 'error',
            message: `Aucun enregistrement SPF trouvé sur send.${domainName}`
          });
        }
      } catch {
        results.push({
          type: 'SPF',
          status: 'pending',
          message: 'Impossible de vérifier l\'enregistrement SPF'
        });
      }
      
      // Vérifier l'enregistrement MX (sur send.domain)
      try {
        const mxSubdomain = `send.${domainName}`;
        const response = await fetch(`https://dns.google/resolve?name=${mxSubdomain}&type=MX`);
        const data = await response.json();
        
        if (data.Answer && data.Answer.length > 0) {
          const hasMx = data.Answer.some((a: { data: string }) => 
            a.data.includes('amazonses.com')
          );
          if (hasMx) {
            results.push({
              type: 'MX',
              status: 'success',
              message: `Enregistrement MX correctement configuré sur send.${domainName}`
            });
          } else {
            results.push({
              type: 'MX',
              status: 'error',
              message: `Enregistrement MX trouvé sur send.${domainName} mais la valeur est incorrecte`
            });
          }
        } else {
          results.push({
            type: 'MX',
            status: 'error',
            message: `Aucun enregistrement MX trouvé sur send.${domainName}`
          });
        }
      } catch {
        results.push({
          type: 'MX',
          status: 'pending',
          message: 'Impossible de vérifier l\'enregistrement MX'
        });
      }
      
      // Vérifier l'enregistrement DKIM (TXT sur resend._domainkey.domain)
      try {
        const dkimDomain = `resend._domainkey.${domainName}`;
        const response = await fetch(`https://dns.google/resolve?name=${dkimDomain}&type=TXT`);
        const data = await response.json();
        
        if (data.Answer && data.Answer.length > 0) {
          const hasDkim = data.Answer.some((a: { data: string }) => 
            a.data.includes('p=') && a.data.includes('DQEBAQUAA')
          );
          if (hasDkim) {
            results.push({
              type: 'DKIM',
              status: 'success',
              message: `Enregistrement DKIM correctement configuré sur resend._domainkey.${domainName}`
            });
          } else {
            results.push({
              type: 'DKIM',
              status: 'error',
              message: `Enregistrement TXT trouvé sur resend._domainkey.${domainName} mais la clé DKIM est incorrecte`
            });
          }
        } else {
          results.push({
            type: 'DKIM',
            status: 'error',
            message: `Aucun enregistrement DKIM trouvé sur resend._domainkey.${domainName}`
          });
        }
      } catch {
        results.push({
          type: 'DKIM',
          status: 'pending',
          message: 'Impossible de vérifier l\'enregistrement DKIM'
        });
      }
      
      setDnsTestResults(results);
      
      const allSuccess = results.every(r => r.status === 'success');
      const successCount = results.filter(r => r.status === 'success').length;
      
      toast({
        title: allSuccess ? "Configuration DNS complète !" : `${successCount}/${results.length} enregistrements validés`,
        description: allSuccess 
          ? "Tous vos enregistrements DNS sont correctement configurés. Cliquez sur 'Vérifier le statut' pour finaliser."
          : "Certains enregistrements DNS sont manquants ou incorrects. Consultez les détails ci-dessous.",
        variant: allSuccess ? "default" : "destructive",
      });
    } catch (error) {
      console.error("DNS test error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de tester la configuration DNS",
        variant: "destructive",
      });
    } finally {
      setTestingDns(false);
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
              <Button variant="secondary" onClick={handleTestDns} disabled={testingDns}>
                {testingDns ? (
                  <CircleNotch className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MagnifyingGlass className="h-4 w-4 mr-2" />
                )}
                Tester DNS
              </Button>
            </>
          )}
        </div>

        {/* Explication du processus pour domaine existant */}
        {existingDomain && !existingDomain.is_verified && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-600">Comment ça fonctionne ?</AlertTitle>
            <AlertDescription className="space-y-2 text-sm">
              <p><strong>1. Ajoutez les enregistrements DNS</strong> : Copiez les enregistrements ci-dessous et ajoutez-les dans la zone DNS de votre domaine (chez OVH, Gandi, Cloudflare, etc.)</p>
              <p><strong>2. Attendez la propagation</strong> : Les modifications DNS peuvent prendre de 5 minutes à 48 heures pour se propager.</p>
              <p><strong>3. Testez votre configuration</strong> : Utilisez le bouton "Tester DNS" pour vérifier en temps réel si vos enregistrements sont visibles.</p>
              <p><strong>4. Validez</strong> : Une fois le test DNS réussi, cliquez sur "Vérifier le statut" pour finaliser la vérification avec Resend.</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Résultats du test DNS */}
        {dnsTestResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <MagnifyingGlass className="h-4 w-4" />
              Résultats du test DNS
            </h4>
            {dnsTestResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border flex items-start gap-3 ${
                  result.status === 'success' 
                    ? 'border-green-500/50 bg-green-500/10' 
                    : result.status === 'error'
                    ? 'border-red-500/50 bg-red-500/10'
                    : 'border-amber-500/50 bg-amber-500/10'
                }`}
              >
                {result.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : result.status === 'error' ? (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Warning className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{result.type}</p>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

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
