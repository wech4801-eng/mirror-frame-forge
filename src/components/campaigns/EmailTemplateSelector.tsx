import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "@phosphor-icons/react";

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  html: string;
}

const templates: EmailTemplate[] = [
  {
    id: "welcome",
    name: "🎉 Bienvenue - Inscription",
    description: "Mail d'accueil chaleureux après l'inscription",
    preview: "bg-gradient-to-br from-emerald-500 to-teal-600",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue !</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 50px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 32px; font-weight: 700;">{entreprise}</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 18px;">Bienvenue dans l'aventure !</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 28px; font-weight: 700;">Bonjour {nom} 👋</h2>
              <p style="color: #475569; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0;">
                Félicitations ! Vous venez de faire le premier pas vers votre réussite. Nous sommes ravis de vous accompagner dans cette transformation.
              </p>
              <p style="color: #475569; line-height: 1.8; font-size: 16px; margin: 0 0 30px 0;">
                <strong style="color: #10b981;">Votre formation vous attend :</strong> Accédez dès maintenant à tous les contenus exclusifs et commencez votre apprentissage.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 18px 50px; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 17px; border-radius: 12px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">
                      Accéder à ma formation
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #f1f5f9; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #334155; margin: 0; font-size: 15px; line-height: 1.6;">
                  <strong>💡 Astuce :</strong> Consultez votre tableau de bord pour suivre votre progression et découvrir tous les bonus inclus.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                © 2024 {entreprise}. Tous droits réservés.
              </p>
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                Des questions ? Répondez directement à cet email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: "reminder",
    name: "⏰ Rappel - Première relance",
    description: "Mail de rappel amical pour relancer l'engagement",
    preview: "bg-gradient-to-br from-blue-500 to-indigo-600",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>N'oubliez pas !</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 50px 40px; text-align: center;">
              <div style="font-size: 50px; margin: 0 0 15px 0;">⏰</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Ne passez pas à côté</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 26px; font-weight: 700;">Bonjour {nom},</h2>
              <p style="color: #475569; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0;">
                Nous avons remarqué que vous n'avez pas encore commencé votre formation. C'est dommage car <strong>vous ratez des opportunités incroyables !</strong>
              </p>
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); border-radius: 12px; padding: 30px; margin: 30px 0;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">Ce qui vous attend :</h3>
                <ul style="color: #475569; margin: 0; padding-left: 20px; line-height: 2;">
                  <li><strong>12 modules complets</strong> pour maîtriser votre sujet</li>
                  <li><strong>Études de cas pratiques</strong> directement applicables</li>
                  <li><strong>Support dédié</strong> pour répondre à vos questions</li>
                  <li><strong>Certificat officiel</strong> à l'issue de la formation</li>
                </ul>
              </div>
              <table cellpadding="0" cellspacing="0" style="margin: 30px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 18px 50px; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 17px; border-radius: 12px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);">
                      Commencer maintenant
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #64748b; font-size: 15px; text-align: center; margin: 20px 0 0 0;">
                Déjà <strong style="color: #3b82f6;">2 543 personnes</strong> ont transformé leur carrière grâce à cette formation.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                © 2024 {entreprise}. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: "urgency",
    name: "🚨 Urgence - Deuxième relance",
    description: "Mail créant l'urgence avec compteur",
    preview: "bg-gradient-to-br from-orange-500 to-red-600",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dernières heures !</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 3px solid #f97316;">
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 20px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                ⚡ Attention : Plus que 48h
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 40px 30px 40px; text-align: center;">
              <div style="font-size: 60px; margin: 0 0 20px 0;">🚨</div>
              <h1 style="color: #1e293b; margin: 0 0 15px 0; font-size: 32px; font-weight: 800;">Ne laissez pas passer cette chance, {nom}</h1>
              <p style="color: #64748b; margin: 0; font-size: 17px;">Il ne reste que quelques jours pour profiter de votre accès</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 50px 40px;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 30px; margin: 0 0 30px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px; font-weight: 700;">⏳ Temps limité</h3>
                <p style="color: #78350f; margin: 0; font-size: 15px; line-height: 1.6;">
                  Votre accès spécial expire dans <strong>48 heures</strong>. Après cette date, vous devrez repayer le prix fort.
                </p>
              </div>
              <p style="color: #475569; line-height: 1.8; font-size: 16px; margin: 0 0 25px 0;">
                Des centaines de personnes regrettent chaque mois de ne pas avoir saisi cette opportunité. <strong>Ne faites pas la même erreur.</strong>
              </p>
              <table cellpadding="0" cellspacing="0" style="margin: 30px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 20px 60px; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 18px; border-radius: 12px; box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5); text-transform: uppercase; letter-spacing: 0.5px;">
                      J'active mon accès maintenant
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                © 2024 {entreprise}. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: "final-offer",
    name: "💎 Promotion - Dernière chance",
    description: "Mail final avec réduction exclusive",
    preview: "bg-gradient-to-br from-purple-600 to-pink-600",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dernière chance !</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 15px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                🎁 Offre exclusive - Dernière chance
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 40px 30px 40px; text-align: center;">
              <div style="font-size: 70px; margin: 0 0 20px 0;">💎</div>
              <h1 style="color: #1e293b; margin: 0 0 15px 0; font-size: 34px; font-weight: 800; line-height: 1.2;">
                {nom}, voici votre<br/>dernière opportunité
              </h1>
              <p style="color: #64748b; margin: 0; font-size: 18px;">Une offre que nous ne referons jamais</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <div style="background: linear-gradient(135deg, #faf5ff 0%, #fce7f3 100%); border: 2px dashed #9333ea; border-radius: 16px; padding: 40px; text-align: center; margin: 0 0 40px 0;">
                <p style="color: #701a75; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Réduction exceptionnelle</p>
                <div style="margin: 20px 0;">
                  <span style="color: #94a3b8; font-size: 24px; text-decoration: line-through; display: block; margin-bottom: 10px;">497€</span>
                  <span style="color: #9333ea; font-size: 56px; font-weight: 900; line-height: 1;">197€</span>
                  <span style="color: #701a75; display: block; font-size: 18px; margin-top: 10px; font-weight: 600;">Économisez 300€</span>
                </div>
                <div style="background-color: #fde047; color: #713f12; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: 700; font-size: 15px; margin-top: 15px;">
                  -60% APPLIQUÉS AUTOMATIQUEMENT
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 50px 40px;">
              <table cellpadding="0" cellspacing="0" style="margin: 40px 0 30px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 22px 70px; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 19px; border-radius: 14px; box-shadow: 0 8px 25px rgba(147, 51, 234, 0.5); text-transform: uppercase; letter-spacing: 1px;">
                      Profiter de l'offre maintenant
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #64748b; font-size: 14px; text-align: center; margin: 20px 0 0 0; line-height: 1.6;">
                <strong>Garantie satisfait ou remboursé 30 jours</strong><br/>
                Zéro risque pour vous
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                © 2024 {entreprise}. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: "webinar",
    name: "🎥 Webinaire - Invitation",
    description: "Invitation exclusive à un webinaire en direct",
    preview: "bg-gradient-to-br from-cyan-500 to-blue-600",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Webinaire exclusif</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 15px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                🔴 Événement en direct - Places limitées
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 40px 30px 40px; text-align: center;">
              <div style="font-size: 70px; margin: 0 0 20px 0;">🎥</div>
              <h1 style="color: #1e293b; margin: 0 0 15px 0; font-size: 32px; font-weight: 800; line-height: 1.2;">
                {nom}, vous êtes invité à notre<br/>webinaire exclusif
              </h1>
              <p style="color: #64748b; margin: 0; font-size: 17px;">Un événement unique que vous ne voudrez pas manquer</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="background: linear-gradient(135deg, #ecfeff 0%, #dbeafe 100%); border-radius: 16px; padding: 35px; margin: 0 0 30px 0;">
                <h2 style="color: #1e293b; margin: 0 0 25px 0; font-size: 24px; font-weight: 700; text-align: center;">
                  Les 5 Stratégies qui ont Transformé<br/>Mon Business en 90 Jours
                </h2>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                  <tr>
                    <td style="padding: 15px; text-align: center;">
                      <p style="margin: 0; color: #0e7490; font-size: 15px; font-weight: 600;">📅 DATE</p>
                      <p style="margin: 5px 0 0 0; color: #164e63; font-size: 18px; font-weight: 700;">Jeudi 25 janvier</p>
                    </td>
                    <td style="padding: 15px; text-align: center; border-left: 2px solid #06b6d4;">
                      <p style="margin: 0; color: #0e7490; font-size: 15px; font-weight: 600;">⏰ HEURE</p>
                      <p style="margin: 5px 0 0 0; color: #164e63; font-size: 18px; font-weight: 700;">19h00 (Heure de Paris)</p>
                    </td>
                  </tr>
                </table>
              </div>
              <table cellpadding="0" cellspacing="0" style="margin: 30px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 20px 60px; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 18px; border-radius: 12px; box-shadow: 0 6px 20px rgba(6, 182, 212, 0.5); text-transform: uppercase; letter-spacing: 0.5px;">
                      Réserver ma place gratuite
                    </a>
                  </td>
                </tr>
              </table>
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #dc2626; font-size: 15px; font-weight: 700; margin: 0;">
                  ⚠️ Attention : Seulement 100 places disponibles
                </p>
                <p style="color: #64748b; font-size: 14px; margin: 10px 0 0 0;">
                  Déjà <strong style="color: #06b6d4;">73 inscrits</strong> - Ne tardez pas !
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                © 2024 {entreprise}. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }
];

interface EmailTemplateSelectorProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  selectedTemplate: string | null;
}

const EmailTemplateSelector = ({ onSelectTemplate, selectedTemplate }: EmailTemplateSelectorProps) => {
  const getPreviewHtml = (html: string) => {
    return html
      .replace(/\{nom\}/g, 'Jean Dupont')
      .replace(/\{email\}/g, 'jean@exemple.com')
      .replace(/\{entreprise\}/g, 'Votre Entreprise');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choisissez un template professionnel pour votre campagne. Cliquez sur "Utiliser ce template" pour l'éditer.
      </p>
      <div className="grid grid-cols-1 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`transition-all hover:shadow-lg ${
              selectedTemplate === template.id
                ? "ring-2 ring-primary"
                : "hover:border-primary/50"
            }`}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </div>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTemplate(template);
                  }}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  size="sm"
                >
                  {selectedTemplate === template.id ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Sélectionné
                    </>
                  ) : (
                    "Utiliser ce template"
                  )}
                </Button>
              </div>
              
              {/* Preview iframe */}
              <div className="border-2 rounded-lg overflow-hidden bg-muted/30">
                <div className="bg-background p-2 border-b flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">Aperçu du template</span>
                </div>
                <div className="h-80 overflow-auto bg-white">
                  <iframe
                    srcDoc={getPreviewHtml(template.html)}
                    className="w-full h-full border-0 scale-[0.8] origin-top-left"
                    style={{ width: '125%', height: '125%' }}
                    title={`Preview ${template.name}`}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmailTemplateSelector;
