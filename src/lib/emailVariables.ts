// Variables disponibles pour les templates d'emails
export const EMAIL_VARIABLES = {
  opportunities: [
    { key: "{{opportunity_id}}", label: "ID", description: "ID de l'opportunité" },
    { key: "{{opportunity_title}}", label: "Titre", description: "Titre de l'opportunité" },
    { key: "{{opportunity_status}}", label: "Statut", description: "Statut de l'opportunité" },
    { key: "{{opportunity_stage}}", label: "Étape", description: "Étape dans le pipeline" },
    { key: "{{opportunity_amount}}", label: "Montant", description: "Montant de l'opportunité" },
    { key: "{{opportunity_probability}}", label: "Probabilité", description: "Probabilité de closing" },
    { key: "{{owner_email}}", label: "Adresse e-mail du propriétaire", description: "Email du propriétaire" },
    { key: "{{owner_first_name}}", label: "Prénom du propriétaire", description: "Prénom du propriétaire" },
    { key: "{{owner_full_name}}", label: "Prénom et nom du propriétaire", description: "Nom complet du propriétaire" },
    { key: "{{closing_date}}", label: "Date de closing", description: "Date de closing prévue" },
    { key: "{{next_action_date}}", label: "Date de prochaine action", description: "Date de la prochaine action" },
    { key: "{{next_action_datetime}}", label: "Date et heure de prochaine action", description: "Date et heure de la prochaine action" },
    { key: "{{pipeline}}", label: "Pipeline", description: "Pipeline associé" },
    { key: "{{estimated_closing_date}}", label: "Date de closing estimée", description: "Date de closing estimée" },
  ],
  default_fields: [
    { key: "{{first_name}}", label: "Prénom", description: "Prénom du contact" },
    { key: "{{last_name}}", label: "Nom", description: "Nom du contact" },
    { key: "{{phone}}", label: "Téléphone", description: "Téléphone du contact" },
    { key: "{{email}}", label: "E-mail", description: "E-mail du contact" },
  ],
  user_variables: [
    { key: "{{user_id}}", label: "Identifiant de l'utilisateur", description: "ID de l'utilisateur" },
    { key: "{{user_first_name}}", label: "Prénom", description: "Prénom de l'utilisateur" },
    { key: "{{user_last_name}}", label: "Nom", description: "Nom de l'utilisateur" },
    { key: "{{user_email}}", label: "E-mail", description: "E-mail de l'utilisateur" },
    { key: "{{user_phone}}", label: "Téléphone", description: "Téléphone de l'utilisateur" },
    { key: "{{user_mobile}}", label: "Téléphone mobile", description: "Téléphone mobile de l'utilisateur" },
  ],
};

export const getAllVariables = () => {
  return [
    ...EMAIL_VARIABLES.opportunities,
    ...EMAIL_VARIABLES.default_fields,
    ...EMAIL_VARIABLES.user_variables,
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
  
  // Pas de variables obligatoires pour le moment
  const required: string[] = [];
  
  return {
    valid: invalid.length === 0 && missing.length === 0,
    missing,
    invalid,
  };
};

export const renderTemplatePreview = (
  content: string,
  prospectData?: any
): string => {
  let rendered = content;
  
  // Remplacer les variables opportunités
  rendered = rendered.replace(/\{\{opportunity_id\}\}/g, 'OPP-12345');
  rendered = rendered.replace(/\{\{opportunity_title\}\}/g, 'Nouvelle opportunité');
  rendered = rendered.replace(/\{\{opportunity_status\}\}/g, 'En cours');
  rendered = rendered.replace(/\{\{opportunity_stage\}\}/g, 'Qualification');
  rendered = rendered.replace(/\{\{opportunity_amount\}\}/g, '50 000€');
  rendered = rendered.replace(/\{\{opportunity_probability\}\}/g, '75%');
  rendered = rendered.replace(/\{\{owner_email\}\}/g, 'owner@example.com');
  rendered = rendered.replace(/\{\{owner_first_name\}\}/g, 'Marie');
  rendered = rendered.replace(/\{\{owner_full_name\}\}/g, 'Marie Dupont');
  rendered = rendered.replace(/\{\{closing_date\}\}/g, '15/12/2025');
  rendered = rendered.replace(/\{\{next_action_date\}\}/g, '20/11/2025');
  rendered = rendered.replace(/\{\{next_action_datetime\}\}/g, '20/11/2025 14:30');
  rendered = rendered.replace(/\{\{pipeline\}\}/g, 'Ventes');
  rendered = rendered.replace(/\{\{estimated_closing_date\}\}/g, '01/01/2026');
  
  // Remplacer les variables champs par défaut
  rendered = rendered.replace(/\{\{first_name\}\}/g, prospectData?.first_name || 'Jean');
  rendered = rendered.replace(/\{\{last_name\}\}/g, prospectData?.last_name || 'Martin');
  rendered = rendered.replace(/\{\{phone\}\}/g, prospectData?.phone || '+33 6 12 34 56 78');
  rendered = rendered.replace(/\{\{email\}\}/g, prospectData?.email || 'jean.martin@example.com');
  
  // Remplacer les variables utilisateur
  rendered = rendered.replace(/\{\{user_id\}\}/g, 'USR-001');
  rendered = rendered.replace(/\{\{user_first_name\}\}/g, 'Sophie');
  rendered = rendered.replace(/\{\{user_last_name\}\}/g, 'Durand');
  rendered = rendered.replace(/\{\{user_email\}\}/g, 'sophie.durand@example.com');
  rendered = rendered.replace(/\{\{user_phone\}\}/g, '+33 1 23 45 67 89');
  rendered = rendered.replace(/\{\{user_mobile\}\}/g, '+33 6 98 76 54 32');
  
  return rendered;
};
