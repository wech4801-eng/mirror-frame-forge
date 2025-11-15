import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { VideoOff, Users } from "lucide-react";
import WebinarChat from "./WebinarChat";
import CommercialBanner from "./CommercialBanner";
import { supabase } from "@/integrations/supabase/client";

interface WebinarViewerViewProps {
  webinar: any;
}

const WebinarViewerView = ({ webinar }: WebinarViewerViewProps) => {
  const [viewerName, setViewerName] = useState("");
  const [viewerEmail, setViewerEmail] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [viewerCount] = useState(12);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingAudioRef = useRef(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (viewerName.trim() && viewerEmail.trim()) {
      setHasJoined(true);
    }
  };

  // Function to play audio chunks
  const playAudioChunk = async (base64Audio: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    try {
      // Decode base64 to array buffer
      const response = await fetch(base64Audio);
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Create audio source
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
      
      source.onended = () => {
        isPlayingAudioRef.current = false;
        // Play next chunk if available
        if (audioQueueRef.current.length > 0) {
          const nextChunk = audioQueueRef.current.shift();
          if (nextChunk) {
            isPlayingAudioRef.current = true;
            playAudioChunk(nextChunk);
          }
        }
      };
    } catch (error) {
      console.error("Error playing audio:", error);
      isPlayingAudioRef.current = false;
    }
  };

  // Subscribe to video and audio broadcast from host
  useEffect(() => {
    if (!hasJoined) return;

    console.log("Viewer: Subscribing to webinar", webinar.id);
    const channel = supabase.channel(`webinar-${webinar.id}`);

    channel
      .on("broadcast", { event: "video-frame" }, (payload) => {
        setCurrentFrame(payload.payload.frame);
      })
      .on("broadcast", { event: "audio-chunk" }, (payload) => {
        const audioData = payload.payload.audio;
        
        if (!isPlayingAudioRef.current) {
          isPlayingAudioRef.current = true;
          playAudioChunk(audioData);
        } else {
          // Queue audio chunk if already playing
          audioQueueRef.current.push(audioData);
        }
      })
      .subscribe((status) => {
        console.log("Viewer: Subscription status:", status);
      });

    return () => {
      console.log("Viewer: Unsubscribing");
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      audioQueueRef.current = [];
      isPlayingAudioRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [hasJoined, webinar.id]);

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">{webinar.title}</h1>
            <p className="text-muted-foreground">{webinar.description}</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Votre nom</Label>
              <Input
                id="name"
                value={viewerName}
                onChange={(e) => setViewerName(e.target.value)}
                placeholder="Jean Dupont"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Votre email</Label>
              <Input
                id="email"
                type="email"
                value={viewerEmail}
                onChange={(e) => setViewerEmail(e.target.value)}
                placeholder="jean@exemple.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Rejoindre le webinaire
            </Button>
          </form>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{viewerCount} participants en ligne</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* Main content area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header */}
          <Card className="p-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">{webinar.title}</h2>
              <p className="text-sm text-muted-foreground">Webinaire en direct</p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{viewerCount} spectateurs</span>
            </div>
          </Card>

          {/* Commercial Banner */}
          {webinar.commercial_title && (
            <CommercialBanner
              title={webinar.commercial_title}
              description={webinar.commercial_description}
              ctaText={webinar.commercial_cta_text}
              ctaLink={webinar.commercial_cta_link}
            />
          )}

          {/* Video stream */}
          <Card className="relative aspect-video bg-black overflow-hidden">
            {currentFrame ? (
              <>
                <img
                  ref={imgRef}
                  src={currentFrame}
                  alt="Live stream"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full animate-pulse flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  EN DIRECT
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <VideoOff className="h-20 w-20 text-white/50 mx-auto" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white/80 font-medium">En attente du stream</p>
                    <p className="text-white/50 text-sm">L'hôte n'a pas encore démarré la diffusion</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Info message */}
          <Card className="p-4 bg-muted">
            <p className="text-sm text-muted-foreground text-center">
              En tant que participant, vous pouvez uniquement regarder le webinaire et échanger dans le chat. 
              Profitez de l&apos;expérience !
            </p>
          </Card>
        </div>

        {/* Chat sidebar */}
        <div className="lg:col-span-1 h-full">
          <WebinarChat
            webinarId={webinar.id}
            senderName={viewerName}
            senderEmail={viewerEmail}
            isHost={false}
          />
        </div>
      </div>
    </div>
  );
};

export default WebinarViewerView;
