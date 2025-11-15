import { Button } from "@/components/ui/button";
import { ArrowRight } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary" />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-white">
            Prêt à transformer votre gestion de prospects ?
          </h2>
          <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 text-white/90">
            Rejoignez des milliers d&apos;entreprises qui font confiance à CRM Pro
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 text-base md:text-lg px-6 md:px-8 w-full sm:w-auto"
            onClick={() => navigate("/auth")}
          >
            Commencer maintenant
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
