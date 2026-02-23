import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

type ChatApiResponse = {
  response?: string;
  response_text?: string;
  intent?: string;
  confidence?: number;
  entities?: Record<string, unknown>;
  results?: Array<Record<string, any>>;
  error?: string;
};

function formatBotText(payload: ChatApiResponse, language: "en" | "ta"): string {
  const base = payload.response_text || payload.response || payload.error;
  const fallback =
    language === "ta"
      ? "மன்னிக்கவும்—தற்சமயம் பதில் வழங்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
      : "Sorry—I couldn’t generate a response right now. Please try again.";

  let text = base || fallback;

  if (Array.isArray(payload.results) && payload.results.length > 0) {
    const top = payload.results.slice(0, 5);
    const lines = top.map((r, idx) => {
      const college = r.college || r.name || "Unknown College";
      const probPct = r.probability_percent ?? (typeof r.probability === "number" ? Math.round(r.probability * 100) : null);
      const label = r.classification ? ` (${r.classification})` : "";
      const prob = probPct !== null ? ` - ${probPct}%` : "";
      return `${idx + 1}. ${college}${prob}${label}`;
    });
    text += `\n\nTop matches:\n${lines.join("\n")}`;
  }

  return text;
}

export default function ChatBot() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: language === "en" 
        ? "Hello! I'm your TNEA counseling assistant. How can I help you today?"
        : "வணக்கம்! நான் உங்கள் TNEA ஆலோசனை உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: userMessage.text, language }),
      });
      const payload = (await r.json()) as ChatApiResponse;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: formatBotText(payload, language),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          language === "ta"
            ? "சேவையை அணுக முடியவில்லை. சில நேரம் கழித்து முயற்சிக்கவும்."
            : "Unable to reach the chatbot service. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-chat-title">
            {t("nav.chat")}
          </h1>
          <p className="text-muted-foreground">
            Get instant help with TNEA counseling and college guidance
          </p>
        </div>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`message-${message.sender}-${message.id}`}
                >
                  {message.sender === "bot" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {message.sender === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder={language === "en" ? "Type your message..." : "உங்கள் செய்தியை தட்டச்சு செய்யுங்கள்..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                data-testid="input-chat-message"
                disabled={isTyping}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!inputText.trim() || isTyping}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}