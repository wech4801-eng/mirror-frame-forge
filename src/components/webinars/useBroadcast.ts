import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useBroadcast = (
  webinarId: string,
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isStreaming: boolean,
  isVideoEnabled: boolean
) => {
  useEffect(() => {
    if (!isStreaming || !isVideoEnabled || !videoRef.current || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;

    // Set canvas size
    canvas.width = 640;
    canvas.height = 360;

    const channel = supabase.channel(`webinar-${webinarId}`);

    // Broadcast video frames
    const broadcastInterval = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && isVideoEnabled) {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 (lower quality for performance)
        const frameData = canvas.toDataURL("image/jpeg", 0.5);
        
        // Broadcast via Supabase Realtime
        channel.send({
          type: "broadcast",
          event: "video-frame",
          payload: { frame: frameData }
        });
      }
    }, 100); // ~10 FPS

    channel.subscribe();

    return () => {
      clearInterval(broadcastInterval);
      supabase.removeChannel(channel);
    };
  }, [webinarId, isStreaming, isVideoEnabled, videoRef, canvasRef]);
};
