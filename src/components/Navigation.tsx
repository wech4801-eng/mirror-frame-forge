import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-8 md:gap-12">
            <div className="text-lg md:text-2xl font-bold tracking-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">CRM Pro</span>
            </div>
            
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Tarifs</a>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Témoignages</a>
              <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</a>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="ghost" 
              className="hidden md:flex text-sm"
              onClick={() => navigate("/auth")}
            >
              Connexion
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-sm md:text-base px-4 md:px-6"
              onClick={() => navigate("/auth")}
            >
              Essai gratuit
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
