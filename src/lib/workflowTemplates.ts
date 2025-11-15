export interface WorkflowTemplate {
  name: string;
  description: string;
  category: 'onboarding' | 'nurturing' | 'reengagement' | 'qualification' | 'customer_success' | 'compliance';
  icon: string;
  trigger_config: {
    type: 'event' | 'time' | 'segment';
    event?: string;
    conditions?: string[];
  };
  actions_config: Array<{
    type: string;
    params: Record<string, any>;
  }>;
  variables?: string[];
  safeguards?: {
    frequency_cap?: number;
    quiet_hours?: boolean;
    stop_on_reply?: boolean;
  };
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    name: "Onboarding Immédiat",
    description: "Série de bienvenue automatique avec A/B testing si pas d'ouverture",
    category: "onboarding",
    icon: "UserPlus",
    trigger_config: {
      type: "event",
      event: "prospect_created",
      conditions: ["email_valid == true", "unsubscribed == false"]
    },
    actions_config: [
      { type: "send_email", params: { template_key: "bienvenue" } },
      { type: "wait", params: { days: 2 } },
      { type: "if", params: { condition: "opens_count == 0", then: [{ type: "send_email", params: { template_key: "bienvenue_variation" } }] } },
      { type: "add_tag", params: { tag: "warmup_bienvenue" } },
      { type: "update_field", params: { field: "status", value: "onboarding" } }
    ],
    variables: ["first_name", "company", "source", "cta_url_profil"],
    safeguards: { frequency_cap: 3, quiet_hours: true, stop_on_reply: true }
  },
  {
    name: "Série d'Éducation (5 emails)",
    description: "Nurturing progressif avec cas d'usage, guides et offre finale",
    category: "nurturing",
    icon: "BookOpen",
    trigger_config: {
      type: "segment",
      conditions: ["tag == 'warmup_bienvenue'", "score < 30"]
    },
    actions_config: [
      { type: "send_email", params: { template_key: "education_1", delay_days: 0 } },
      { type: "send_email", params: { template_key: "education_2", delay_days: 3 } },
      { type: "send_email", params: { template_key: "education_3", delay_days: 6 } },
      { type: "send_email", params: { template_key: "education_4", delay_days: 10 } },
      { type: "send_email", params: { template_key: "education_5", delay_days: 14 } },
      { type: "if", params: { condition: "clicks_count >= 2", then: [
        { type: "move_group", params: { group: "Hot Leads" } },
        { type: "notify", params: { channel: "slack", message: "Nouveau Hot Lead" } }
      ]} }
    ],
    variables: ["use_case", "case_study_link", "guide_link", "booking_link"],
    safeguards: { frequency_cap: 1, quiet_hours: true, stop_on_reply: true }
  },
  {
    name: "Relance Post-Essai",
    description: "Réengagement après fin d'essai ou démo avec offre limitée",
    category: "reengagement",
    icon: "RefreshCw",
    trigger_config: {
      type: "event",
      event: "trial_ended",
      conditions: ["converted == false"]
    },
    actions_config: [
      { type: "send_email", params: { template_key: "post_trial_thank", delay_days: 0 } },
      { type: "send_email", params: { template_key: "post_trial_recap", delay_days: 2 } },
      { type: "send_email", params: { template_key: "post_trial_offer", delay_days: 5 } },
      { type: "if", params: { condition: "opens_count == 0 AND emails_sent >= 2", then: [
        { type: "send_sms", params: { message: "Offre limitée pour votre essai" } }
      ]} }
    ],
    variables: ["date_fin_essai", "fonctionnalites_essai", "compte_manager"],
    safeguards: { frequency_cap: 2, quiet_hours: true }
  },
  {
    name: "Winback Inactifs",
    description: "Ré-engagement des contacts dormants avec contenu premium",
    category: "reengagement",
    icon: "AlertCircle",
    trigger_config: {
      type: "segment",
      conditions: ["days_since_last_open > 45", "score < 10", "unsubscribed == false"]
    },
    actions_config: [
      { type: "send_email", params: { template_key: "winback_missed", delay_days: 0 } },
      { type: "send_email", params: { template_key: "winback_survey", delay_days: 4 } },
      { type: "if", params: { condition: "opens_count == 0", then: [
        { type: "update_field", params: { field: "status", value: "froid" } },
        { type: "add_tag", params: { tag: "inactive_reduce_frequency" } }
      ]} }
    ],
    variables: ["offre_pdf", "sondage_url"],
    safeguards: { frequency_cap: 2, stop_on_reply: true }
  },
  {
    name: "Qualification par Source",
    description: "Routing et scoring automatique selon la provenance",
    category: "qualification",
    icon: "Filter",
    trigger_config: {
      type: "event",
      event: "prospect_created",
      conditions: ["source IN ['ads', 'webinar', 'referral', 'organic']"]
    },
    actions_config: [
      { type: "route_to_group", params: { by: "source" } },
      { type: "update_score", params: { 
        rules: { 
          referral: 10, 
          webinar: 7, 
          ads: 5, 
          organic: 3 
        } 
      }},
      { type: "add_tag", params: { tag_prefix: "source_" } },
      { type: "send_email", params: { template_key: "source_specific" } }
    ],
    variables: ["source", "landing_page", "utm_campaign"],
    safeguards: { frequency_cap: 1 }
  },
  {
    name: "MQL → SQL",
    description: "Passage automatique au commercial avec notification et task",
    category: "qualification",
    icon: "TrendingUp",
    trigger_config: {
      type: "segment",
      conditions: ["score >= 50 OR (opens_count >= 3 OR clicks_count >= 2) OR form_filled == true"]
    },
    actions_config: [
      { type: "update_field", params: { field: "status", value: "SQL" } },
      { type: "create_task", params: { title: "Appeler sous 24h", assignee: "sales_team" } },
      { type: "notify", params: { channel: "slack", message: "Nouveau SQL prêt" } },
      { type: "send_email", params: { template_key: "booking_confirmation" } }
    ],
    variables: ["account_exec", "booking_link", "need_summary"],
    safeguards: { stop_on_reply: true }
  },
  {
    name: "Abandon de Formulaire",
    description: "Relance douce avec aide et incentive progressif",
    category: "reengagement",
    icon: "FileX",
    trigger_config: {
      type: "event",
      event: "form_abandoned",
      conditions: ["time_since_view > 30min"]
    },
    actions_config: [
      { type: "send_email", params: { template_key: "form_reminder", delay_minutes: 30 } },
      { type: "send_email", params: { template_key: "form_help", delay_days: 2 } },
      { type: "send_email", params: { template_key: "form_incentive", delay_days: 5 } }
    ],
    variables: ["resume_url", "support_link", "panier_resume"],
    safeguards: { frequency_cap: 3, quiet_hours: true }
  },
  {
    name: "Onboarding Client",
    description: "Séquence post-activation avec ressources et succès client",
    category: "customer_success",
    icon: "CheckCircle",
    trigger_config: {
      type: "event",
      event: "payment_succeeded",
      conditions: ["is_new_customer == true"]
    },
    actions_config: [
      { type: "send_email", params: { template_key: "welcome_client", delay_days: 0 } },
      { type: "create_checklist", params: { items: ["setup", "integrations", "first_use"] } },
      { type: "send_email", params: { template_key: "features_key", delay_days: 3 } },
      { type: "send_email", params: { template_key: "integrations_tips", delay_days: 7 } },
      { type: "send_email", params: { template_key: "success_nps", delay_days: 14 } }
    ],
    variables: ["plan", "owner_name", "video_tutos", "nps_link"],
    safeguards: { frequency_cap: 2, quiet_hours: true }
  },
  {
    name: "Drip Contenu par Intérêt",
    description: "1 contenu/semaine pendant 4 semaines selon topic",
    category: "nurturing",
    icon: "Rss",
    trigger_config: {
      type: "segment",
      conditions: ["interest_tag_updated == true", "is_customer == false"]
    },
    actions_config: [
      { type: "send_email", params: { template_key: "content_week_1", delay_days: 0 } },
      { type: "send_email", params: { template_key: "content_week_2", delay_days: 7 } },
      { type: "send_email", params: { template_key: "content_week_3", delay_days: 14 } },
      { type: "send_email", params: { template_key: "content_week_4", delay_days: 21 } },
      { type: "if", params: { condition: "clicks_count > 2", then: [
        { type: "send_email", params: { template_key: "demo_offer" } }
      ], else: [
        { type: "update_field", params: { field: "email_frequency", value: "monthly" } }
      ]} }
    ],
    variables: ["topic", "content_link", "webinar_link"],
    safeguards: { frequency_cap: 1, quiet_hours: true }
  },
  {
    name: "Opt-in GDPR",
    description: "Confirmation d'opt-in pour contacts UE non confirmés",
    category: "compliance",
    icon: "Shield",
    trigger_config: {
      type: "event",
      event: "imported_unconfirmed",
      conditions: ["country == 'EU' OR gdpr_required == true"]
    },
    actions_config: [
      { type: "send_email", params: { template_key: "optin_request" } },
      { type: "wait", params: { days: 14 } },
      { type: "if", params: { condition: "optin_confirmed == true", then: [
        { type: "add_tag", params: { tag: "consent_optin" } },
        { type: "enable_nurturing", params: {} }
      ], else: [
        { type: "archive", params: {} },
        { type: "add_tag", params: { tag: "no_consent" } }
      ]} }
    ],
    variables: ["confirm_link", "policy_link"],
    safeguards: { frequency_cap: 1 }
  },
  {
    name: "Gestion Rebonds & Spam",
    description: "Nettoyage automatique et protection de réputation",
    category: "compliance",
    icon: "AlertTriangle",
    trigger_config: {
      type: "event",
      event: "bounce_or_spam",
      conditions: []
    },
    actions_config: [
      { type: "if", params: { condition: "event == 'bounce'", then: [
        { type: "disable_sending", params: {} },
        { type: "add_tag", params: { tag: "email_invalid" } }
      ]} },
      { type: "if", params: { condition: "event == 'spam'", then: [
        { type: "remove_from_campaigns", params: {} },
        { type: "add_tag", params: { tag: "spam_reporter" } }
      ]} },
      { type: "if", params: { condition: "event == 'unsubscribe'", then: [
        { type: "add_tag", params: { tag: "optout" } },
        { type: "block_future_sends", params: {} }
      ]} }
    ],
    variables: ["unsubscribe_reason"],
    safeguards: {}
  },
  {
    name: "Alertes Performance",
    description: "Monitoring temps réel avec suggestions d'optimisation",
    category: "compliance",
    icon: "Activity",
    trigger_config: {
      type: "event",
      event: "campaign_launched",
      conditions: []
    },
    actions_config: [
      { type: "monitor", params: { 
        metrics: ["open_rate", "spam_rate", "ctr"],
        thresholds: { open_rate_min: 15, spam_rate_max: 0.3, ctr_min: 2 }
      }},
      { type: "if", params: { condition: "metrics_below_threshold", then: [
        { type: "notify", params: { channel: "internal", message: "Performance dégradée - suggestions disponibles" } }
      ]} },
      { type: "if", params: { condition: "spam_rate > 0.3", then: [
        { type: "pause_campaign", params: { auto: true } }
      ]} }
    ],
    variables: ["campaign_name", "metrics_dashboard_url"],
    safeguards: {}
  },
  {
    name: "Lead Magnet",
    description: "Livraison ressource + séquence d'application",
    category: "nurturing",
    icon: "Gift",
    trigger_config: {
      type: "event",
      event: "lead_magnet_submitted",
      conditions: []
    },
    actions_config: [
      { type: "send_email", params: { template_key: "resource_delivery", delay_minutes: 0 } },
      { type: "send_email", params: { template_key: "resource_application", delay_days: 2 } },
      { type: "send_email", params: { template_key: "demo_invitation", delay_days: 5 } }
    ],
    variables: ["resource_link", "use_case"],
    safeguards: { frequency_cap: 3, quiet_hours: true }
  },
  {
    name: "Webinar Complet",
    description: "Rappels avant + replay après avec segmentation présent/absent",
    category: "nurturing",
    icon: "Video",
    trigger_config: {
      type: "event",
      event: "webinar_registered",
      conditions: []
    },
    actions_config: [
      { type: "send_email", params: { template_key: "webinar_j_minus_3", delay_days: -3 } },
      { type: "send_email", params: { template_key: "webinar_j_minus_1", delay_days: -1 } },
      { type: "send_email", params: { template_key: "webinar_h_minus_1", delay_hours: -1 } },
      { type: "send_email", params: { template_key: "webinar_starting", delay_minutes: 5 } },
      { type: "wait_for_event", params: { event: "webinar_ended" } },
      { type: "if", params: { condition: "attended == true", then: [
        { type: "send_email", params: { template_key: "replay_attendees" } },
        { type: "move_group", params: { group: "Webinar Attendees" } }
      ], else: [
        { type: "send_email", params: { template_key: "replay_absentees" } },
        { type: "move_group", params: { group: "Webinar No-Shows" } }
      ]} }
    ],
    variables: ["start_time", "join_link", "replay_link"],
    safeguards: { quiet_hours: true }
  },
  {
    name: "Scoring Comportemental",
    description: "Mise à jour continue du score avec décroissance temporelle",
    category: "qualification",
    icon: "Target",
    trigger_config: {
      type: "event",
      event: "engagement_action",
      conditions: []
    },
    actions_config: [
      { type: "update_score", params: { 
        rules: {
          open: 2,
          click: 5,
          reply: 10,
          site_visit: 3,
          pricing_visit: 7
        }
      }},
      { type: "if", params: { condition: "score >= 50", then: [
        { type: "update_field", params: { field: "status", value: "MQL" } }
      ]} },
      { type: "schedule_decay", params: { amount: -1, frequency: "weekly" } }
    ],
    variables: ["last_activity_at", "score"],
    safeguards: {}
  },
  {
    name: "Churn Risk",
    description: "Détection proactive avec intervention CSM",
    category: "customer_success",
    icon: "UserX",
    trigger_config: {
      type: "segment",
      conditions: ["product_inactivity_days > 14 OR support_tickets_high == true"]
    },
    actions_config: [
      { type: "send_email", params: { template_key: "csm_checkin" } },
      { type: "create_task", params: { title: "Appel proactif churn risk", assignee: "csm_team" } },
      { type: "send_email", params: { template_key: "reengagement_guide", delay_days: 3 } }
    ],
    variables: ["csm_name", "health_score", "last_login"],
    safeguards: { stop_on_reply: true }
  },
  {
    name: "Upsell/Cross-sell",
    description: "Proposition upgrade basée sur l'usage",
    category: "customer_success",
    icon: "TrendingUp",
    trigger_config: {
      type: "segment",
      conditions: ["usage_threshold_reached == true OR feature_used_not_in_plan == true"]
    },
    actions_config: [
      { type: "send_email", params: { template_key: "upsell_benefits" } },
      { type: "if", params: { condition: "simulator_clicked == true", then: [
        { type: "send_email", params: { template_key: "upgrade_meeting" } }
      ]} }
    ],
    variables: ["current_plan", "usage_metric", "upgrade_link"],
    safeguards: { frequency_cap: 1, quiet_hours: true }
  },
  {
    name: "Réchauffement Domaine",
    description: "Montée en charge progressive pour nouveau domaine d'envoi",
    category: "compliance",
    icon: "ThermometerSun",
    trigger_config: {
      type: "event",
      event: "new_sending_domain",
      conditions: []
    },
    actions_config: [
      { type: "set_send_limit", params: { day_1: 50, day_2: 200, day_3: 500, progressive: true } },
      { type: "filter_recipients", params: { segment: "engaged_only" } },
      { type: "ab_test_subjects", params: { avoid_spam_words: true } },
      { type: "monitor_reputation", params: { metrics: ["spam_rate", "bounce_rate"] } }
    ],
    variables: ["send_quota_today", "engaged_segment_size"],
    safeguards: { frequency_cap: 1 }
  },
  {
    name: "Pipeline Sales",
    description: "Emails et rappels automatiques par étape du pipeline",
    category: "qualification",
    icon: "GitBranch",
    trigger_config: {
      type: "event",
      event: "pipeline_stage_changed",
      conditions: []
    },
    actions_config: [
      { type: "send_email", params: { template_key: "stage_recap" } },
      { type: "if", params: { condition: "days_in_stage > 3", then: [
        { type: "create_task", params: { title: "Relancer le prospect", assignee: "sales_owner" } }
      ]} }
    ],
    variables: ["stage", "next_step", "doc_link"],
    safeguards: { quiet_hours: true }
  },
  {
    name: "Vérification Sécurité Email",
    description: "Check SPF/DKIM/DMARC et blocage si non conforme",
    category: "compliance",
    icon: "ShieldCheck",
    trigger_config: {
      type: "event",
      event: "email_config_check",
      conditions: []
    },
    actions_config: [
      { type: "verify_dns", params: { check: ["spf", "dkim", "dmarc"] } },
      { type: "if", params: { condition: "verification_failed", then: [
        { type: "block_mass_sending", params: {} },
        { type: "send_email", params: { template_key: "config_report", to: "admin" } }
      ]} }
    ],
    variables: ["dmarc_status", "spf_status", "dkim_status"],
    safeguards: {}
  }
];
