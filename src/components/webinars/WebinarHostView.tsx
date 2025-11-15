import { useState, useEffect, useRef } from "react";
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
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewerCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      // Cleanup streams on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleVideo = async () => {
    try {
      if (isVideoOn) {
        console.log("Arrêt de la vidéo");
        if (streamRef.current) {
          streamRef.current.getVideoTracks().forEach((track) => {
            track.stop();
            streamRef.current?.removeTrack(track);
          });
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setIsVideoOn(false);
      } else {
        console.log("Démarrage de la vidéo");
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: false
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Stream vidéo obtenu:", stream.getVideoTracks());
        
        if (!streamRef.current) {
          streamRef.current = stream;
        } else {
          stream.getVideoTracks().forEach((track) => {
            streamRef.current?.addTrack(track);
          });
        }
        
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          await videoRef.current.play();
          console.log("Vidéo en lecture");
        }
        setIsVideoOn(true);
      }
    } catch (error: any) {
      console.error("Erreur caméra:", error);
      toast({
        title: "Erreur",
        description: `Impossible d'accéder à la caméra: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const toggleAudio = async () => {
    try {
      if (isAudioOn) {
        console.log("Arrêt du micro");
        if (streamRef.current) {
          streamRef.current.getAudioTracks().forEach((track) => {
            track.stop();
            streamRef.current?.removeTrack(track);
          });
        }
        setIsAudioOn(false);
      } else {
        console.log("Démarrage du micro");
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        console.log("Stream audio obtenu:", audioStream.getAudioTracks());
        
        if (!streamRef.current) {
          streamRef.current = audioStream;
          if (videoRef.current && isVideoOn) {
            videoRef.current.srcObject = streamRef.current;
          }
        } else {
          audioStream.getAudioTracks().forEach((track) => {
            streamRef.current?.addTrack(track);
          });
          if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
          }
        }
        setIsAudioOn(true);
      }
    } catch (error: any) {
      console.error("Erreur micro:", error);
      toast({
        title: "Erreur",
        description: `Impossible d'accéder au microphone: ${error.message}`,
        variant: "destructive",
      });
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

        // Stop screen sharing when user stops it from browser
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
              <p className="text-sm text-muted-foreground">Vue hôte - Vous êtes en direct</p>
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
            
            {isVideoOn && (
              <Card className="relative aspect-video bg-black overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={!isAudioOn}
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full animate-pulse flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  EN DIRECT
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {isVideoOn && (
                    <div className="px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      Caméra
                    </div>
                  )}
                  {isAudioOn && (
                    <div className="px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                      <Mic className="h-3 w-3" />
                      Micro
                    </div>
                  )}
                </div>
              </Card>
            )}

            {!isVideoOn && !isScreenSharing && (
              <Card className="aspect-video bg-muted flex items-center justify-center">
                <div className="text-center space-y-2">
                  <VideoOff className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Activez votre caméra ou partagez votre écran pour commencer</p>
                </div>
              </Card>
            )}
          </div>

          {/* Controls */}
          <Card className="p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isVideoOn ? "default" : "outline"}
                size="lg"
                onClick={toggleVideo}
                className="w-16 h-16"
              >
                {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
              <Button
                variant={isAudioOn ? "default" : "outline"}
                size="lg"
                onClick={toggleAudio}
                className="w-16 h-16"
              >
                {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>
              <Button
                variant={isScreenSharing ? "default" : "outline"}
                size="lg"
                onClick={toggleScreenShare}
                className="w-16 h-16"
              >
                {isScreenSharing ? <Monitor className="h-6 w-6" /> : <MonitorOff className="h-6 w-6" />}
              </Button>
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
