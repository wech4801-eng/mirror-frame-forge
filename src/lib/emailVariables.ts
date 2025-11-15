// Variables disponibles pour les templates d'emails
export const EMAIL_VARIABLES = {
  prospect: [
    { key: "{{first_name}}", label: "Prénom", description: "Prénom du prospect" },
    { key: "{{full_name}}", label: "Nom complet", description: "Nom complet du prospect" },
    { key: "{{email}}", label: "Email", description: "Adresse email du prospect" },
    { key: "{{phone}}", label: "Téléphone", description: "Numéro de téléphone" },
    { key: "{{company}}", label: "Entreprise", description: "Nom de l'entreprise" },
  ],
  campaign: [
    { key: "{{campaign_name}}", label: "Nom campagne", description: "Nom de la campagne" },
    { key: "{{sender_name}}", label: "Nom expéditeur", description: "Nom de l'expéditeur" },
    { key: "{{sender_email}}", label: "Email expéditeur", description: "Email de l'expéditeur" },
  ],
  system: [
    { key: "{{unsubscribe_link}}", label: "Lien désabonnement", description: "Lien pour se désabonner" },
    { key: "{{view_online}}", label: "Voir en ligne", description: "Lien pour voir l'email en ligne" },
    { key: "{{current_date}}", label: "Date actuelle", description: "Date d'envoi" },
    { key: "{{current_year}}", label: "Année actuelle", description: "Année en cours" },
  ],
};

export const getAllVariables = () => {
  return [
    ...EMAIL_VARIABLES.prospect,
    ...EMAIL_VARIABLES.campaign,
    ...EMAIL_VARIABLES.system,
  ];
};

export const extractVariablesFromContent = (content: string): string[] => {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = content.match(regex) || [];
  return [...new Set(matches)];
};

export const validateVariables = (content: string): { valid: boolean; missing: string[]; invalid: string[] } => {
  const usedVariables = extractVariablesFromContent(content);
  const validVariables = getAllVariables().map(v => v.key);
  
  const invalid = usedVariables.filter(v => !validVariables.includes(v));
  const missing: string[] = [];
  
  // Variables obligatoires
  const required = ["{{unsubscribe_link}}"];
  required.forEach(req => {
    if (!usedVariables.includes(req)) {
      missing.push(req);
    }
  });
  
  return {
    valid: invalid.length === 0 && missing.length === 0,
    missing,
    invalid,
  };
};

export const renderTemplatePreview = (
  content: string,
  prospectData?: {
    first_name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    company?: string;
  }
): string => {
  let rendered = content;
  
  // Remplacer les variables prospect
  if (prospectData) {
    const firstName = prospectData.full_name?.split(' ')[0] || 'John';
    rendered = rendered.replace(/\{\{first_name\}\}/g, firstName);
    rendered = rendered.replace(/\{\{full_name\}\}/g, prospectData.full_name || 'John Doe');
    rendered = rendered.replace(/\{\{email\}\}/g, prospectData.email || 'john.doe@example.com');
    rendered = rendered.replace(/\{\{phone\}\}/g, prospectData.phone || '+33 6 12 34 56 78');
    rendered = rendered.replace(/\{\{company\}\}/g, prospectData.company || 'Acme Corp');
  } else {
    // Valeurs par défaut pour preview
    rendered = rendered.replace(/\{\{first_name\}\}/g, 'John');
    rendered = rendered.replace(/\{\{full_name\}\}/g, 'John Doe');
    rendered = rendered.replace(/\{\{email\}\}/g, 'john.doe@example.com');
    rendered = rendered.replace(/\{\{phone\}\}/g, '+33 6 12 34 56 78');
    rendered = rendered.replace(/\{\{company\}\}/g, 'Acme Corp');
  }
  
  // Remplacer les variables campagne
  rendered = rendered.replace(/\{\{campaign_name\}\}/g, 'Ma Campagne');
  rendered = rendered.replace(/\{\{sender_name\}\}/g, 'Équipe Marketing');
  rendered = rendered.replace(/\{\{sender_email\}\}/g, 'marketing@votreentreprise.com');
  
  // Remplacer les variables système
  rendered = rendered.replace(/\{\{unsubscribe_link\}\}/g, '#unsubscribe');
  rendered = rendered.replace(/\{\{view_online\}\}/g, '#view-online');
  rendered = rendered.replace(/\{\{current_date\}\}/g, new Date().toLocaleDateString('fr-FR'));
  rendered = rendered.replace(/\{\{current_year\}\}/g, new Date().getFullYear().toString());
  
  return rendered;
};
