import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WebinarChat from "./WebinarChat";
import CommercialBanner from "./CommercialBanner";

interface WebinarHostViewProps {
  webinar: any;
  userName: string;
  userEmail: string;
}

const WebinarHostView = ({ webinar, userName, userEmail }: WebinarHostViewProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewerCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startStream = () => {
    console.log("Démarrage du stream - fonction appelée");
    
    navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true
    }).then((mediaStream) => {
      console.log("Stream obtenu:", mediaStream);
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log("srcObject assigné");
        
        videoRef.current.play().then(() => {
          console.log("play() réussi");
          setIsStreaming(true);
          setIsVideoEnabled(true);
          setIsAudioEnabled(true);
          
          toast({
            title: "Stream démarré",
            description: "Caméra et micro activés",
          });
        }).catch((err) => {
          console.error("Erreur play():", err);
        });
      }
    }).catch((err) => {
      console.error("Erreur getUserMedia:", err);
      let msg = "Erreur d'accès à la webcam. ";
      
      if (err.name === 'NotAllowedError') {
        msg += "Permission refusée. Autorisez l'accès à la webcam.";
      } else if (err.name === 'NotFoundError') {
        msg += "Aucune webcam détectée.";
      } else if (err.name === 'NotReadableError') {
        msg += "La webcam est utilisée par une autre application.";
      } else {
        msg += err.message;
      }
      
      toast({
        title: "Erreur",
        description: msg,
        variant: "destructive",
      });
    });
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
    console.log("Stream arrêté");
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log("Vidéo:", videoTrack.enabled ? "activée" : "désactivée");
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        console.log("Audio:", audioTrack.enabled ? "activé" : "désactivé");
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        console.log("Arrêt du partage d'écran");
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((track) => track.stop());
          screenStreamRef.current = null;
        }
        if (screenRef.current) {
          screenRef.current.srcObject = null;
        }
        setIsScreenSharing(false);
      } else {
        console.log("Démarrage du partage d'écran");
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        console.log("Stream écran obtenu:", screenStream.getVideoTracks());
        
        screenStreamRef.current = screenStream;
        if (screenRef.current) {
          screenRef.current.srcObject = screenStream;
          await screenRef.current.play();
          console.log("Partage d'écran en lecture");
        }
        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = () => {
          console.log("Partage d'écran arrêté par l'utilisateur");
          setIsScreenSharing(false);
          screenStreamRef.current = null;
          if (screenRef.current) {
            screenRef.current.srcObject = null;
          }
        };
      }
    } catch (error: any) {
      console.error("Erreur partage d'écran:", error);
      toast({
        title: "Erreur",
        description: `Impossible de partager l'écran: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen bg-background">
      <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* Main content area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header */}
          <Card className="p-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">{webinar.title}</h2>
              <p className="text-sm text-muted-foreground">Vue hôte</p>
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

          {/* Video streams */}
          <div className="space-y-4">
            {isScreenSharing && (
              <Card className="relative aspect-video bg-black overflow-hidden">
                <video
                  ref={screenRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full animate-pulse">
                  Partage d'écran actif
                </div>
              </Card>
            )}
            
            <Card className="relative aspect-video bg-black overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              
              {!isStreaming && (
                <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white">
                  <VideoOff className="h-24 w-24 mb-4 opacity-50" />
                  <p className="opacity-50">Cliquez sur Démarrer pour commencer</p>
                </div>
              )}
              
              {isStreaming && !isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <VideoOff className="h-24 w-24 text-white opacity-50" />
                </div>
              )}
              
              {isStreaming && (
                <>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    EN DIRECT
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    {isVideoEnabled && (
                      <div className="px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        Caméra
                      </div>
                    )}
                    {isAudioEnabled && (
                      <div className="px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                        <Mic className="h-3 w-3" />
                        Micro
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Controls */}
          <Card className="p-4">
            <div className="flex items-center justify-center gap-4">
              {!isStreaming ? (
                <Button
                  onClick={startStream}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Video className="h-5 w-5 mr-2" />
                  Démarrer
                </Button>
              ) : (
                <>
                  <Button
                    variant={isVideoEnabled ? "default" : "outline"}
                    size="lg"
                    onClick={toggleVideo}
                    className="w-16 h-16"
                  >
                    {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                  </Button>
                  <Button
                    variant={isAudioEnabled ? "default" : "outline"}
                    size="lg"
                    onClick={toggleAudio}
                    className="w-16 h-16"
                  >
                    {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                  </Button>
                  <Button
                    variant={isScreenSharing ? "default" : "outline"}
                    size="lg"
                    onClick={toggleScreenShare}
                    className="w-16 h-16"
                  >
                    {isScreenSharing ? <Monitor className="h-6 w-6" /> : <MonitorOff className="h-6 w-6" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={stopStream}
                  >
                    Arrêter
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Chat sidebar */}
        <div className="lg:col-span-1 h-full">
          <WebinarChat
            webinarId={webinar.id}
            senderName={userName}
            senderEmail={userEmail}
            isHost={true}
          />
        </div>
      </div>
    </div>
  );
};

export default WebinarHostView;
