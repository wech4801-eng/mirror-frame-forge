// Variables disponibles pour les templates d'emails - correspond exactement aux champs de la table prospects
export const EMAIL_VARIABLES = {
  prospect_fields: [
    { key: "{{full_name}}", label: "Nom complet", description: "Nom complet du prospect" },
    { key: "{{email}}", label: "E-mail", description: "Adresse e-mail du prospect" },
    { key: "{{phone}}", label: "Téléphone", description: "Numéro de téléphone du prospect" },
    { key: "{{company}}", label: "Entreprise", description: "Entreprise du prospect" },
  ],
};

export const getAllVariables = () => {
  return [...EMAIL_VARIABLES.prospect_fields];
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
  
  return {
    valid: invalid.length === 0 && missing.length === 0,
    missing,
    invalid,
  };
};

export const renderTemplatePreview = (
  content: string,
  prospectData?: { full_name?: string; email?: string; phone?: string; company?: string }
): string => {
  let rendered = content;
  
  // Remplacer les variables prospect avec les vraies données ou des exemples
  rendered = rendered.replace(/\{\{full_name\}\}/g, prospectData?.full_name || 'Jean Martin');
  rendered = rendered.replace(/\{\{email\}\}/g, prospectData?.email || 'jean.martin@example.com');
  rendered = rendered.replace(/\{\{phone\}\}/g, prospectData?.phone || '+33 6 12 34 56 78');
  rendered = rendered.replace(/\{\{company\}\}/g, prospectData?.company || 'Entreprise Example');
  
  return rendered;
};
