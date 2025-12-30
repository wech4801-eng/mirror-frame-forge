const Footer = () => {
  const sections = [
    {
      title: "Produits",
      links: ["Darktrace PREVENT", "Darktrace DETECT", "Darktrace RESPOND", "Darktrace HEAL"]
    },
    {
      title: "Solutions",
      links: ["Cloud Security", "Network Security", "Email Security", "Endpoint Security"]
    },
    {
      title: "Ressources",
      links: ["Blog", "Webinaires", "Livres blancs", "Études de cas"]
    },
    {
      title: "Société",
      links: ["À propos", "Carrières", "Partenaires", "Contact"]
    }
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-3 md:mb-4 text-foreground text-sm md:text-base">{section.title}</h3>
              <ul className="space-y-2 md:space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-xs md:text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 md:pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/scendtrail-logo.png" alt="ScendTrail" className="h-8 w-auto" />
              <span className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">ScendTrail</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-primary transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-primary transition-colors">Cookies</a>
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">
              © 2025 ScendTrail. Tous droits réservés.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
