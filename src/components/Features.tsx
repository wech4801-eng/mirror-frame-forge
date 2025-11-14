import { Card } from "@/components/ui/card";
import { Users, Mail, Video, BarChart } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Gestion Intelligente des Prospects",
      description: "Organisez, suivez et convertissez vos prospects avec un système de gestion intuitif et des groupes personnalisables"
    },
    {
      icon: Mail,
      title: "Campagnes Email Automatisées",
      description: "Créez et planifiez des campagnes email personnalisées avec suivi des ouvertures et des clics en temps réel"
    },
    {
      icon: Video,
      title: "Webinaires Intégrés",
      description: "Gérez vos webinaires et capturez automatiquement les participants comme nouveaux prospects qualifiés"
    },
    {
      icon: BarChart,
      title: "Analytics & Rapports",
      description: "Visualisez vos performances avec des tableaux de bord détaillés et des statistiques en temps réel"
    }
  ];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            Tout ce dont vous avez besoin pour réussir
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
            CRM Pro vous offre tous les outils nécessaires pour gérer efficacement vos prospects 
            et maximiser vos conversions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-card hover:shadow-glow transition-all duration-300 group">
              <div className="flex items-start gap-4 md:gap-6">
                <div className="p-3 md:p-4 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <feature.icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
