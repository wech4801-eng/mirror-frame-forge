interface Branding {
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_family: string | null;
}

export const applyBrandingToEmailContent = (content: string, branding: Branding | null): string => {
  if (!branding) return content;

  let updatedContent = content;

  // Remplacer les couleurs dans le HTML
  if (branding.primary_color) {
    // Remplacer les couleurs primaires courantes
    updatedContent = updatedContent
      .replace(/#6366f1/gi, branding.primary_color)
      .replace(/rgb\(99,\s*102,\s*241\)/gi, branding.primary_color);
  }

  if (branding.secondary_color) {
    updatedContent = updatedContent
      .replace(/#8b5cf6/gi, branding.secondary_color)
      .replace(/rgb\(139,\s*92,\s*246\)/gi, branding.secondary_color);
  }

  if (branding.accent_color) {
    updatedContent = updatedContent
      .replace(/#ec4899/gi, branding.accent_color)
      .replace(/rgb\(236,\s*72,\s*153\)/gi, branding.accent_color);
  }

  // Remplacer la police
  if (branding.font_family) {
    // Ajouter le Google Font si nécessaire
    if (!updatedContent.includes('fonts.googleapis.com')) {
      const fontUrl = `https://fonts.googleapis.com/css2?family=${branding.font_family.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
      updatedContent = updatedContent.replace(
        '<head>',
        `<head>\n<link href="${fontUrl}" rel="stylesheet">`
      );
    }
    
    // Remplacer les font-family dans le CSS
    updatedContent = updatedContent.replace(
      /font-family:\s*[^;]+;/gi,
      `font-family: '${branding.font_family}', sans-serif;`
    );
  }

  // Remplacer le logo
  if (branding.logo_url) {
    // Chercher les images qui ressemblent à des logos (dans l'en-tête généralement)
    updatedContent = updatedContent.replace(
      /<img[^>]*src=["'][^"']*["'][^>]*>/gi,
      (match) => {
        // Ne remplacer que les premières images (probablement le logo)
        if (match.toLowerCase().includes('logo') || match.includes('header')) {
          return match.replace(/src=["'][^"']*["']/, `src="${branding.logo_url}"`);
        }
        return match;
      }
    );

    // Si pas de logo trouvé, ajouter un logo au début du body
    if (!updatedContent.toLowerCase().includes('logo')) {
      updatedContent = updatedContent.replace(
        /<body/i,
        `<body>\n<div style="text-align: center; padding: 20px;"><img src="${branding.logo_url}" alt="Logo" style="max-width: 200px; height: auto;"></div>`
      );
    }
  }

  return updatedContent;
};

export const generateBrandedEmailTemplate = (branding: Branding): string => {
  const primaryColor = branding.primary_color || '#6366f1';
  const secondaryColor = branding.secondary_color || '#8b5cf6';
  const accentColor = branding.accent_color || '#ec4899';
  const fontFamily = branding.font_family || 'Inter';
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${fontUrl}" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: '${fontFamily}', sans-serif;
      background-color: #f8fafc;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
    }
    .header {
      background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      max-width: 200px;
      height: auto;
      margin-bottom: 20px;
    }
    .content {
      padding: 40px 30px;
      color: #1e293b;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 30px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }
    h1 {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
    }
    h2 {
      color: ${primaryColor};
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    p {
      line-height: 1.6;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${branding.logo_url ? `<img src="${branding.logo_url}" alt="Logo" class="logo">` : ''}
      <h1>Votre Titre Ici</h1>
    </div>
    <div class="content">
      <h2>Bonjour {{nom}},</h2>
      <p>Ceci est un template avec votre branding appliqué. Personnalisez ce contenu selon vos besoins.</p>
      <p>Les couleurs, la police et le logo de votre marque sont automatiquement intégrés pour une cohérence visuelle parfaite.</p>
      <a href="#" class="button">Votre Call-to-Action</a>
      <p>Cordialement,<br>Votre équipe</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Votre Entreprise. Tous droits réservés.</p>
      <p><a href="#" style="color: ${primaryColor};">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>`;
};
