interface PredefinedTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  content: string;
}

const baseTemplate = (content: string) => `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f8fafc">${content}</body></html>`;

export const predefinedTemplates: PredefinedTemplate[] = [
  {
    id: "bienvenue-inscription",
    name: "🎉 Bienvenue - Premier Contact",
    subject: "Bienvenue {nom} ! Votre accès est prêt 🎉",
    category: "Inscription",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08)"><tr><td style="background-color:{primary_color};padding:50px 40px;text-align:center"><img src="{logo}" alt="Logo" style="max-width:180px;height:auto;margin-bottom:20px"><h1 style="color:#fff;margin:0 0 10px 0;font-size:32px;font-weight:700">Bienvenue dans la communauté !</h1><p style="color:rgba(255,255,255,0.9);margin:0;font-size:18px">Votre transformation commence maintenant</p></td></tr><tr><td style="padding:50px 40px"><h2 style="color:#1e293b;margin:0 0 20px 0;font-size:28px;font-weight:700">Bonjour {nom} 👋</h2><p style="color:#475569;line-height:1.8;font-size:16px;margin:0 0 20px 0"><strong>Félicitations !</strong> Vous venez de prendre la décision la plus importante pour votre réussite.</p><table cellpadding="0" cellspacing="0" style="margin:30px 0;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:18px 50px;color:#fff;text-decoration:none;font-weight:700;font-size:17px;border-radius:12px">Accéder à ma formation</a></td></tr></table></td></tr></table></td></tr></table>`)
  },
  {
    id: "relance-1",
    name: "⏰ Relance 1 - Rappel Engagement",
    subject: "{nom}, vous n'avez pas encore commencé... ⏰",
    category: "Relance",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:40px;text-align:center"><img src="{logo}" alt="Logo" style="max-width:150px;height:auto;margin-bottom:15px"><h1 style="color:#fff;margin:0;font-size:28px;font-weight:700">Vous n&apos;avez pas encore commencé...</h1></td></tr><tr><td style="padding:50px 40px"><p style="color:#475569;line-height:1.8;font-size:16px;margin:0 0 20px 0">Bonjour {nom},</p><p style="color:#475569;line-height:1.8;font-size:16px;margin:0 0 30px 0">J&apos;ai remarqué que vous ne vous êtes <strong>pas encore connecté</strong> à votre espace de formation.</p><table cellpadding="0" cellspacing="0" style="margin:30px auto;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background:linear-gradient(135deg,{accent_color} 0%,{primary_color} 100%);padding:20px 50px;color:#fff;text-decoration:none;font-weight:700;font-size:18px;border-radius:12px">Je commence maintenant</a></td></tr></table></td></tr></table></td></tr></table>`)
  },
  {
    id: "derniere-chance",
    name: "🚨 Dernière Chance - Urgence",
    subject: "🚨 DERNIÈRE CHANCE {nom} - Expire dans 24h",
    category: "Relance Urgente",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden;border:3px solid #ef4444"><tr><td style="background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);padding:40px;text-align:center"><h1 style="color:#fff;margin:0 0 10px 0;font-size:32px;font-weight:700">⏰ DERNIÈRE CHANCE</h1><p style="color:rgba(255,255,255,0.95);margin:0;font-size:18px;font-weight:600">Expire dans 24 heures</p></td></tr><tr><td style="padding:50px 40px"><p style="color:#475569;line-height:1.8;font-size:16px">Bonjour {nom},</p><p style="color:#475569;line-height:1.8;font-size:16px;margin:0 0 30px 0">C&apos;est mon <strong style="color:#ef4444">DERNIER EMAIL</strong>. Après minuit, cette opportunité disparaît.</p><table cellpadding="0" cellspacing="0" style="margin:30px auto;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background-color:#fff;padding:22px 60px;color:{primary_color};text-decoration:none;font-weight:700;font-size:20px;border-radius:12px;box-shadow:0 8px 25px rgba(0,0,0,0.3)">J&apos;ACTIVE MON ACCÈS</a></td></tr></table></td></tr></table></td></tr></table>`)
  },
  {
    id: "invitation-webinaire",
    name: "📺 Invitation Webinaire",
    subject: "📺 {nom}, LIVE Exceptionnel - Réservez votre place",
    category: "Webinaire",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:50px 40px;text-align:center"><img src="{logo}" alt="Logo" style="max-width:180px;height:auto;margin-bottom:20px"><div style="background-color:#ef4444;color:#fff;display:inline-block;padding:8px 20px;border-radius:20px;font-size:13px;font-weight:700;margin-bottom:15px">🔴 LIVE EN DIRECT</div><h1 style="color:#fff;margin:0;font-size:34px;font-weight:700">WEBINAIRE EXCLUSIF</h1></td></tr><tr><td style="padding:50px 40px"><h3 style="color:#1e293b;margin:0 0 20px 0;font-size:24px">Ce que vous allez découvrir :</h3><p style="color:#475569;line-height:1.8;font-size:16px">✓ Les stratégies qui fonctionnent vraiment<br>✓ Les erreurs à éviter absolument<br>✓ Le plan d&apos;action complet</p><table cellpadding="0" cellspacing="0" style="margin:40px auto;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background-color:#fff;padding:22px 60px;color:{primary_color};text-decoration:none;font-weight:700;font-size:20px;border-radius:12px;box-shadow:0 8px 25px rgba(0,0,0,0.3)">JE RÉSERVE MA PLACE</a></td></tr></table></td></tr></table></td></tr></table>`)
  },
  {
    id: "lancement-produit",
    name: "🚀 Lancement de Produit",
    subject: "🚀 C'est ENFIN disponible {nom} !",
    category: "Vente",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:50px 40px;text-align:center"><img src="{logo}" alt="Logo" style="max-width:180px;height:auto;margin-bottom:20px"><h1 style="color:#fff;margin:0;font-size:36px;font-weight:700">🚀 C&apos;EST LE GRAND JOUR !</h1></td></tr><tr><td style="padding:50px 40px"><p style="color:#475569;line-height:1.8;font-size:16px">Bonjour {nom},</p><p style="color:#475569;line-height:1.8;font-size:16px;margin:0 0 30px 0">Après des mois de travail, notre nouveau produit est <strong style="color:{accent_color}">enfin disponible</strong>...</p><table cellpadding="0" cellspacing="0" style="margin:40px auto;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background:linear-gradient(135deg,{primary_color} 0%,{accent_color} 100%);padding:20px 50px;color:#fff;text-decoration:none;font-weight:700;font-size:18px;border-radius:12px">Découvrir maintenant</a></td></tr></table></td></tr></table></td></tr></table>`)
  },
  {
    id: "temoignage-client",
    name: "⭐ Témoignage Client",
    subject: "⭐ {nom}, découvrez les résultats de Sarah...",
    category: "Témoignage",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:40px;text-align:center"><h1 style="color:#fff;margin:0;font-size:30px;font-weight:700">⭐ Résultat Exceptionnel</h1></td></tr><tr><td style="padding:50px 40px"><div style="background-color:#f8fafc;padding:30px;border-radius:12px;border-left:4px solid {accent_color};margin:30px 0"><p style="color:#475569;margin:0;font-size:17px;line-height:1.6;font-style:italic">&quot;En 3 mois, j&apos;ai <strong style="color:{accent_color}">triplé mon CA</strong>. Les méthodes sont ultra concrètes !&quot;</p><p style="color:#64748b;margin:10px 0 0 0"><strong>— Sarah M.</strong></p></div><table cellpadding="0" cellspacing="0" style="margin:30px auto;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:18px 45px;color:#fff;text-decoration:none;font-weight:700;font-size:17px;border-radius:12px">Rejoindre la communauté</a></td></tr></table></td></tr></table></td></tr></table>`)
  },
  {
    id: "contenu-gratuit",
    name: "🎁 Contenu Gratuit",
    subject: "🎁 {nom}, voici votre cadeau exclusif",
    category: "Lead Magnet",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,{secondary_color} 0%,{accent_color} 100%);padding:50px 40px;text-align:center"><h1 style="color:#fff;margin:0;font-size:32px;font-weight:700">🎁 Votre Cadeau est Prêt !</h1></td></tr><tr><td style="padding:50px 40px"><p style="color:#475569;line-height:1.8;font-size:16px">Bonjour {nom},</p><p style="color:#475569;line-height:1.8;font-size:16px;margin:0 0 30px 0">Voici votre <strong style="color:{accent_color}">guide exclusif gratuit</strong>.</p><table cellpadding="0" cellspacing="0" style="margin:30px auto;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:20px 50px;color:#fff;text-decoration:none;font-weight:700;font-size:18px;border-radius:12px">Télécharger mon guide</a></td></tr></table></td></tr></table></td></tr></table>`)
  },
  {
    id: "reengagement",
    name: "💭 Réengagement",
    subject: "💭 {nom}, on ne vous a pas vu depuis un moment...",
    category: "Réengagement",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:40px;text-align:center"><h1 style="color:#fff;margin:0;font-size:28px;font-weight:700">💭 Vous nous manquez !</h1></td></tr><tr><td style="padding:50px 40px"><p style="color:#475569;line-height:1.8;font-size:16px">Bonjour {nom},</p><p style="color:#475569;line-height:1.8;font-size:16px;margin:0 0 30px 0">Cela fait un moment que nous ne vous avons pas vu...</p><table cellpadding="0" cellspacing="0" style="margin:30px auto;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background:linear-gradient(135deg,{primary_color} 0%,{accent_color} 100%);padding:18px 45px;color:#fff;text-decoration:none;font-weight:700;font-size:17px;border-radius:12px">Revenir à mon espace</a></td></tr></table></td></tr></table></td></tr></table>`)
  },
  {
    id: "promotion-flash",
    name: "⚡ Promotion Flash",
    subject: "⚡ FLASH SALE {nom} - 50% pendant 6h",
    category: "Promotion",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden;border:3px solid #f59e0b"><tr><td style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:50px 40px;text-align:center"><h1 style="color:#fff;margin:0;font-size:40px;font-weight:700">⚡ FLASH SALE</h1><p style="color:rgba(255,255,255,0.95);margin:10px 0 0 0;font-size:24px;font-weight:700">-50% pendant 6h !</p></td></tr><tr><td style="padding:50px 40px"><div style="background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);padding:35px;border-radius:12px;margin:30px 0;text-align:center;border:2px solid #f59e0b"><h2 style="color:#92400e;margin:0;font-size:48px;font-weight:700">-50%</h2><p style="color:#78350f;margin:10px 0 0 0;font-size:20px;font-weight:600">⏰ Plus que 6 heures</p></div><table cellpadding="0" cellspacing="0" style="margin:30px auto;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:22px 60px;color:#fff;text-decoration:none;font-weight:700;font-size:20px;border-radius:12px">J&apos;EN PROFITE</a></td></tr></table></td></tr></table></td></tr></table>`)
  },
  {
    id: "storytelling",
    name: "📖 Storytelling",
    subject: "📖 {nom}, laissez-moi vous raconter mon histoire...",
    category: "Storytelling",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:40px;text-align:center"><h1 style="color:#fff;margin:0;font-size:30px;font-weight:700">Mon histoire pourrait être la vôtre</h1></td></tr><tr><td style="padding:50px 40px"><p style="color:#475569;line-height:1.8;font-size:16px">Bonjour {nom},</p><p style="color:#475569;line-height:1.8;font-size:16px;margin:0 0 30px 0">Il y a 5 ans, j&apos;étais <strong style="color:#ef4444">complètement perdu</strong>. Aujourd&apos;hui, je vis de ma passion...</p><table cellpadding="0" cellspacing="0" style="margin:30px auto;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:18px 45px;color:#fff;text-decoration:none;font-weight:700;font-size:17px;border-radius:12px">Commencer mon histoire</a></td></tr></table></td></tr></table></td></tr></table>`)
  },
  {
    id: "conseil-tip",
    name: "💡 Conseil du Jour",
    subject: "💡 {nom}, le conseil du jour qui peut tout changer",
    category: "Contenu",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,{secondary_color} 0%,{accent_color} 100%);padding:40px;text-align:center"><h1 style="color:#fff;margin:0;font-size:30px;font-weight:700">💡 Conseil du Jour</h1></td></tr><tr><td style="padding:50px 40px"><div style="background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);padding:35px;border-radius:12px;margin:30px 0;border-left:5px solid #f59e0b"><h3 style="color:#92400e;margin:0 0 15px 0;font-size:24px;font-weight:700">Le pouvoir du &quot;Non&quot;</h3><p style="color:#78350f;margin:0;font-size:16px;line-height:1.8">Apprenez à dire NON aux opportunités qui vous éloignent de votre objectif.</p></div></td></tr></table></td></tr></table>`)
  },
  {
    id: "bonus-exclusif",
    name: "🎯 Bonus Exclusif VIP",
    subject: "🎯 {nom}, un bonus EXCLUSIF rien que pour vous",
    category: "Bonus",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,{primary_color} 0%,{accent_color} 100%);padding:50px 40px;text-align:center"><div style="background-color:#fbbf24;color:#78350f;display:inline-block;padding:10px 25px;border-radius:25px;font-size:14px;font-weight:700;margin-bottom:15px">👑 MEMBRE VIP</div><h1 style="color:#fff;margin:0;font-size:34px;font-weight:700">Bonus Exclusif</h1></td></tr><tr><td style="padding:50px 40px"><div style="background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);padding:35px;border-radius:12px;margin:30px 0;text-align:center;border:2px solid #22c55e"><h3 style="color:#166534;margin:0 0 20px 0;font-size:26px">🎁 Votre Pack VIP</h3><p style="color:#166534;margin:20px 0 0 0;font-size:28px;font-weight:700"><span style="color:#22c55e">GRATUIT 🎉</span></p></div><table cellpadding="0" cellspacing="0" style="margin:30px auto;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background:linear-gradient(135deg,{primary_color} 0%,{accent_color} 100%);padding:20px 50px;color:#fff;text-decoration:none;font-weight:700;font-size:18px;border-radius:12px">Récupérer mon pack</a></td></tr></table></td></tr></table></td></tr></table>`)
  },
  {
    id: "case-study",
    name: "📊 Étude de Cas",
    subject: "📊 {nom}, comment Marc a généré 50k€ en 90 jours",
    category: "Case Study",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:40px;text-align:center"><h1 style="color:#fff;margin:0;font-size:30px;font-weight:700">📊 De 0 à 50k€ en 90 jours</h1></td></tr><tr><td style="padding:50px 40px"><div style="background:linear-gradient(135deg,{secondary_color} 0%,{accent_color} 100%);padding:30px;border-radius:12px;margin:30px 0;text-align:center"><p style="color:#fff;margin:0;font-size:40px;font-weight:700">50 000€</p><p style="color:rgba(255,255,255,0.9);margin:10px 0 0 0;font-size:18px">en 90 jours</p></div><table cellpadding="0" cellspacing="0" style="margin:30px auto;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:18px 45px;color:#fff;text-decoration:none;font-weight:700;font-size:17px;border-radius:12px">Découvrir la méthode</a></td></tr></table></td></tr></table></td></tr></table>`)
  },
  {
    id: "onboarding-j3",
    name: "🚀 Onboarding Jour 3",
    subject: "🚀 {nom}, Jour 3 : Votre prochaine étape",
    category: "Onboarding",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:40px;text-align:center"><h1 style="color:#fff;margin:0;font-size:30px;font-weight:700">🚀 Jour 3 de votre parcours</h1></td></tr><tr><td style="padding:50px 40px"><div style="background-color:#f1f5f9;padding:25px;border-radius:12px;margin:30px 0"><h3 style="color:#1e293b;margin:0 0 15px 0">📍 Progression</h3><div style="background-color:#e2e8f0;height:12px;border-radius:6px;overflow:hidden"><div style="background:linear-gradient(135deg,{primary_color} 0%,{accent_color} 100%);width:30%;height:100%"></div></div><p style="color:#64748b;margin:10px 0 0 0;font-size:15px">30% complété 🎉</p></div><table cellpadding="0" cellspacing="0" style="margin:30px auto;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background:linear-gradient(135deg,{primary_color} 0%,{secondary_color} 100%);padding:18px 45px;color:#fff;text-decoration:none;font-weight:700;font-size:17px;border-radius:12px">Continuer</a></td></tr></table></td></tr></table></td></tr></table>`)
  },
  {
    id: "anniversaire",
    name: "🎂 Email Anniversaire",
    subject: "🎂 Joyeux Anniversaire {nom} !",
    category: "Occasion Spéciale",
    content: baseTemplate(`<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,{secondary_color} 0%,{accent_color} 100%);padding:50px 40px;text-align:center"><h1 style="color:#fff;margin:0;font-size:42px">🎂🎉🎊</h1><h2 style="color:#fff;margin:15px 0 0 0;font-size:32px;font-weight:700">Joyeux Anniversaire !</h2></td></tr><tr><td style="padding:50px 40px"><div style="background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);padding:40px;border-radius:12px;margin:40px 0;text-align:center"><h3 style="color:#92400e;margin:0 0 20px 0;font-size:28px">🎁 -40% sur TOUT !</h3><p style="color:#92400e;margin:0">Code: <strong style="background-color:#fff;padding:10px 20px;border-radius:8px;display:inline-block">ANNIV40</strong></p></div><table cellpadding="0" cellspacing="0" style="margin:30px auto;width:100%"><tr><td align="center"><a href="#" style="display:inline-block;background:linear-gradient(135deg,{primary_color} 0%,{accent_color} 100%);padding:20px 50px;color:#fff;text-decoration:none;font-weight:700;font-size:18px;border-radius:12px">Profiter</a></td></tr></table></td></tr></table></td></tr></table>`)
  }
];
