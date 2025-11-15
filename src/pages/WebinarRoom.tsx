import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WebinarHostView from "@/components/webinars/WebinarHostView";
import WebinarViewerView from "@/components/webinars/WebinarViewerView";

const WebinarRoom = () => {
  const { id, mode } = useParams();
  const navigate = useNavigate();
  const [webinar, setWebinar] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isHost = mode === "host";

  useEffect(() => {
    loadWebinar();
    if (isHost) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [id, isHost]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    } else {
      setUser(session.user);
    }
  };

  const loadWebinar = async () => {
    let query;
    
    if (isHost) {
      // Pour l'hôte, on charge par ID
      query = supabase
        .from("webinars")
        .select("*")
        .eq("id", id)
        .single();
    } else {
      // Pour les viewers, on charge par viewer_link
      query = supabase
        .from("webinars")
        .select("*")
        .eq("viewer_link", id)
        .single();
    }

    const { data, error } = await query;

    if (error || !data) {
      toast({
        title: "Erreur",
        description: "Webinaire introuvable",
        variant: "destructive",
      });
      navigate("/");
    } else {
      setWebinar(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!webinar) {
    return null;
  }

  if (isHost && user) {
    return (
      <WebinarHostView
        webinar={webinar}
        userName={user.email}
        userEmail={user.email}
      />
    );
  }

  return <WebinarViewerView webinar={webinar} />;
};

export default WebinarRoom;
