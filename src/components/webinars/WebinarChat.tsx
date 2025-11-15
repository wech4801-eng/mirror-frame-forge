import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface WebinarChatProps {
  webinarId: string;
  senderName: string;
  senderEmail: string;
  isHost?: boolean;
}

const WebinarChat = ({ webinarId, senderName, senderEmail, isHost = false }: WebinarChatProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel("webinar-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "webinar_messages",
          filter: `webinar_id=eq.${webinarId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [webinarId]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("webinar_messages")
      .select("*")
      .eq("webinar_id", webinarId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    } else {
      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("webinar_messages").insert({
      webinar_id: webinarId,
      sender_name: senderName,
      sender_email: senderEmail,
      message: newMessage,
      is_host: isHost,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } else {
      setNewMessage("");
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-foreground">Chat en direct</h3>
        <p className="text-xs text-muted-foreground">{messages.length} messages</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col space-y-1 ${
                msg.is_host ? "bg-primary/10 p-3 rounded-lg" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">
                  {msg.sender_name}
                  {msg.is_host && (
                    <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                      Hôte
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(msg.created_at), "HH:mm")}
                </span>
              </div>
              <p className="text-sm text-foreground">{msg.message}</p>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez un message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <PaperPlaneTilt className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default WebinarChat;
