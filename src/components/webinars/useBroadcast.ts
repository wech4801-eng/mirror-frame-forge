import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useBroadcast = (
  webinarId: string,
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  streamRef: React.RefObject<MediaStream | null>,
  isStreaming: boolean,
  isVideoEnabled: boolean,
  isAudioEnabled: boolean
) => {
  useEffect(() => {
    if (!isStreaming || !videoRef.current || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;

    // Set canvas size for better quality
    canvas.width = 854;
    canvas.height = 480;

    const channel = supabase.channel(`webinar-${webinarId}`);

    // Audio capture and broadcast
    let audioContext: AudioContext | null = null;
    let mediaRecorder: MediaRecorder | null = null;

    if (isAudioEnabled && streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const audioStream = new MediaStream([audioTracks[0]]);
        mediaRecorder = new MediaRecorder(audioStream, {
          mimeType: 'audio/webm;codecs=opus'
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Audio = reader.result as string;
              channel.send({
                type: "broadcast",
                event: "audio-chunk",
                payload: { audio: base64Audio }
              });
            };
            reader.readAsDataURL(event.data);
          }
        };

        // Send audio chunks every 100ms
        mediaRecorder.start(100);
        console.log("Audio broadcast started");
      }
    }

    // Broadcast video frames at ~25 FPS
    const broadcastInterval = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && isVideoEnabled) {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 with better quality (0.7 instead of 0.5)
        const frameData = canvas.toDataURL("image/jpeg", 0.7);
        
        // Broadcast via Supabase Realtime
        channel.send({
          type: "broadcast",
          event: "video-frame",
          payload: { frame: frameData }
        });
      }
    }, 40); // ~25 FPS

    channel.subscribe((status) => {
      console.log("Host: Broadcast channel status:", status);
    });

    return () => {
      clearInterval(broadcastInterval);
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      if (audioContext) {
        audioContext.close();
      }
      supabase.removeChannel(channel);
      console.log("Broadcast stopped");
    };
  }, [webinarId, isStreaming, isVideoEnabled, isAudioEnabled, videoRef, canvasRef, streamRef]);
};
