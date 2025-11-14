import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
const Hero = () => {
  const navigate = useNavigate();
  
  return <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-50 animate-zoom-slow" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />
      </div>

      {/* Gradient glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-glow opacity-30" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight px-4">
            Introducing the Industry's{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              First Truly Automated
            </span>{" "}
            Cloud Forensics Solution
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Détectez et répondez aux menaces en temps réel avec l'IA de pointe qui apprend votre entreprise
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12 px-4">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-base md:text-lg px-6 md:px-8 w-full sm:w-auto"
              onClick={() => navigate("/auth")}
            >
              Commencer Gratuitement
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base md:text-lg px-6 md:px-8 border-primary/50 hover:bg-primary/10 w-full sm:w-auto"
              onClick={() => navigate("/auth")}
            >
              Se Connecter
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-8 md:pt-12 border-t border-border/50 px-4">
            <div className="space-y-1 md:space-y-2">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                9,700
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Clients</div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                110
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Pays</div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                2,400
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Brevets</div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                200
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Employés IA</div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;