import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-accent" />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-accent-foreground">
            Essayez Darktrace dans votre propre environnement numérique
          </h2>
          <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 text-accent-foreground/90">
            Découvrez comment l'IA peut transformer votre sécurité
          </p>
          <Button 
            size="lg" 
            className="bg-background text-foreground hover:bg-background/90 text-base md:text-lg px-6 md:px-8 w-full sm:w-auto"
          >
            Demander une démo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
