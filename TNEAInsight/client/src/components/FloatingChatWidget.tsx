import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Bot, User, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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
      : "Sorry—I couldn't generate a response right now. Please try again.";

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

export default function FloatingChatWidget() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollElement) {
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }, 0);
      }
    }
  }, [messages]);

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
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-40"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 w-96 bg-background border rounded-lg shadow-2xl z-50 flex flex-col transition-all duration-300",
            isMinimized ? "h-14" : "h-[600px]"
          )}
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between cursor-grab">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold">
                {language === "en" ? "TNEA Assistant" : "TNEA உதவியாளர்"}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "bot" && (
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <Bot className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "max-w-[70%] p-3 rounded-lg text-sm",
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted rounded-tl-none"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {message.sender === "user" && (
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarFallback className="bg-primary/20">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-2 justify-start">
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-3 bg-background rounded-b-lg">
                <div className="flex gap-2">
                  <Input
                    placeholder={language === "en" ? "Type message..." : "செய்தி..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isTyping}
                    className="text-sm"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isTyping}
                    size="icon"
                    className="h-9 w-9"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
