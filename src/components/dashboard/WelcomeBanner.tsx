import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, X } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

const WelcomeBanner = () => {
  const [userName, setUserName] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name.split(" ")[0]);
        } else {
          setUserName(user.email?.split("@")[0] || "");
        }
      }
    };
    fetchUser();
  }, []);

  if (!showBanner) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-primary p-8 mb-8 animate-scale-in">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10"
        onClick={() => setShowBanner(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">
            Bienvenue, {userName} 👋
          </h2>
          <p className="text-white/90 text-sm max-w-md">
            Gérez vos prospects et campagnes email en toute simplicité
          </p>
        </div>
        
        <Button
          onClick={() => navigate("/prospects")}
          className="bg-white text-primary hover:bg-white/90 shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Prospect
        </Button>
      </div>
    </div>
  );
};

export default WelcomeBanner;
