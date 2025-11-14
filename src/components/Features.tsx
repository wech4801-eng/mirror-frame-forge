import { Card } from "@/components/ui/card";
import { Shield, Cloud, Brain, Lock } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Cloud,
      title: "Sécurisez votre cloud en temps réel",
      description: "Détection automatique des menaces dans tous vos environnements cloud avec une réponse instantanée"
    },
    {
      icon: Brain,
      title: "IA Auto-Apprenante",
      description: "L'IA qui apprend constamment les patterns uniques de votre entreprise pour une précision maximale"
    },
    {
      icon: Shield,
      title: "Protection Continue",
      description: "Surveillance 24/7 avec réponse autonome aux menaces émergentes et attaques zero-day"
    },
    {
      icon: Lock,
      title: "Forensics Automatisés",
      description: "Investigation et analyse automatique des incidents pour une résolution rapide"
    }
  ];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            Une IA responsable au service de l'innovation
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
            Darktrace utilise l'IA pour comprendre le comportement normal de votre organisation 
            et détecter les menaces qui passent inaperçues
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
