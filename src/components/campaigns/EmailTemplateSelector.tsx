import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  html: string;
}

const templates: EmailTemplate[] = [
  {
    id: "professional",
    name: "Professionnel",
    description: "Template moderne et élégant",
    preview: "bg-gradient-to-br from-primary/20 to-primary/5",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">{entreprise}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Bonjour {nom},</h2>
              <p style="color: #666666; line-height: 1.6; font-size: 16px; margin: 0 0 20px 0;">
                Votre message personnalisé ici...
              </p>
              <p style="color: #666666; line-height: 1.6; font-size: 16px; margin: 0 0 30px 0;">
                Variables disponibles : {nom}, {email}, {entreprise}
              </p>
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; text-align: center;">
                    <a href="#" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                      En savoir plus
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; font-size: 14px; margin: 0 0 10px 0;">
                © 2024 {entreprise}. Tous droits réservés.
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                Vous recevez cet email car vous êtes inscrit à notre liste de diffusion.
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
    id: "minimal",
    name: "Minimaliste",
    description: "Design épuré et moderne",
    preview: "bg-gradient-to-br from-slate-100 to-slate-50",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0">
          <!-- Logo -->
          <tr>
            <td style="padding: 0 0 40px 0; text-align: center; border-bottom: 2px solid #000000;">
              <h1 style="color: #000000; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">{entreprise}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 60px 0;">
              <h2 style="color: #000000; margin: 0 0 30px 0; font-size: 32px; font-weight: 300;">Bonjour {nom},</h2>
              <p style="color: #333333; line-height: 1.8; font-size: 16px; margin: 0 0 30px 0; font-weight: 300;">
                Votre message personnalisé ici...
              </p>
              <p style="color: #666666; line-height: 1.8; font-size: 14px; margin: 0 0 40px 0;">
                Variables : {nom}, {email}, {entreprise}
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border: 2px solid #000000; border-radius: 0; text-align: center;">
                    <a href="#" style="display: inline-block; padding: 14px 40px; color: #000000; text-decoration: none; font-weight: 500; font-size: 14px; letter-spacing: 1px;">
                      DÉCOUVRIR
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 40px 0 0 0; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999999; font-size: 12px; margin: 0; font-weight: 300;">
                © 2024 {entreprise} - Contact: {email}
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
    id: "corporate",
    name: "Corporate",
    description: "Style professionnel et structuré",
    preview: "bg-gradient-to-br from-blue-50 to-indigo-50",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f0f2f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a8a; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600;">{entreprise}</h1>
              <p style="color: #93c5fd; margin: 10px 0 0 0; font-size: 14px;">Excellence & Innovation</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #eff6ff; padding: 20px; border-left: 4px solid #1e3a8a; margin-bottom: 20px;">
                    <p style="color: #1e3a8a; margin: 0; font-size: 14px; font-weight: 600;">MESSAGE IMPORTANT</p>
                  </td>
                </tr>
              </table>
              <h2 style="color: #1e3a8a; margin: 30px 0 20px 0; font-size: 22px; font-weight: 600;">Cher(e) {nom},</h2>
              <p style="color: #374151; line-height: 1.7; font-size: 15px; margin: 0 0 20px 0;">
                Votre message personnalisé ici...
              </p>
              <p style="color: #6b7280; line-height: 1.7; font-size: 14px; margin: 0 0 30px 0;">
                Variables disponibles : {nom}, {email}, {entreprise}
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #1e3a8a; border-radius: 4px; text-align: center;">
                    <a href="#" style="display: inline-block; padding: 14px 35px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px;">
                      Consulter maintenant
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0;">
                      <strong>{entreprise}</strong> | Contact: {email}
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      © 2024 Tous droits réservés. Communication professionnelle.
                    </p>
                  </td>
                </tr>
              </table>
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
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choisissez un template professionnel pour votre campagne
      </p>
      <div className="grid grid-cols-1 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate === template.id
                ? "ring-2 ring-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </div>
                {selectedTemplate === template.id && (
                  <div className="bg-primary text-primary-foreground rounded-full p-2">
                    <Check className="h-5 w-5" />
                  </div>
                )}
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
                    srcDoc={template.html.replace('{nom}', 'Jean Dupont').replace('{email}', 'jean@exemple.com').replace('{entreprise}', 'Votre Entreprise').replace('{entreprise}', 'Votre Entreprise')}
                    className="w-full h-full border-0"
                    title={`Preview ${template.name}`}
                    sandbox="allow-same-origin"
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
