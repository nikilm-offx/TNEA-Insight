import { useState, useRef, useEffect } from "react";
import { X, Send, ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface FloatingChatbotProps {
  currentStep?: string;
}

export default function FloatingChatbot({ currentStep }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "TNEA Assistant",
      placeholder: "Ask a question...",
      sendButton: "Send",
      faqTitle: "Frequently Asked Questions",
      faq: [
        { q: "What is TNEA?", a: "TNEA stands for Tamil Nadu Engineering Admissions. It's the centralized selection process for engineering colleges in Tamil Nadu." },
        { q: "When is the deadline?", a: "The deadline for registration is usually in May. Check the official website for exact dates." },
        { q: "How many colleges can I choose?", a: "You can select and order up to 20 engineering colleges based on your preferences." },
        { q: "What documents are needed?", a: "You need 10th certificate, 12th certificate, community certificate, and other identity proofs." }
      ],
      registrationHelp: "For registration help, upload your documents clearly and ensure all fields are filled accurately.",
      verificationHelp: "Your documents are being verified. This usually takes 3-5 working days.",
      rankAnalysisHelp: "Your rank has been calculated based on your marks. Use our analytics tools to see suitable colleges.",
      choiceFillingHelp: "Select and order your preferences wisely. Colleges are allotted based on merit and preference order.",
      allotmentHelp: "Your seat allotment result is ready. Review carefully and proceed to confirmation.",
      confirmationHelp: "Please confirm your acceptance to secure your seat within the specified deadline.",
      admissionHelp: "Congratulations! Your admission is confirmed. Visit the college for final registration."
    },
    ta: {
      title: "TNEA உதவியாளர்",
      placeholder: "கேள்வி கேளுங்கள்...",
      sendButton: "அனுப்பவும்",
      faqTitle: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
      faq: [
        { q: "TNEA என்றால் என்ன?", a: "TNEA என்பது தமிழ்நாடு பொறியியல் சேர்க்கை. இது தமிழ்நாட்டில் பொறியியல் கல்லூரிகளுக்கான மையப்படுத்தப்பட்ட தேர்வு செயல்முறை." },
        { q: "கடைசி தேதி என்ன?", a: "பதிவுக்கான கடைசி தேதி பொதுவாக மே மாதமாக இருக்கும். சரியான தேதிக்கு உத்தியோக பூர்வ இணையதளத்தை சரிபார்க்கவும்." },
        { q: "எத்தனை கல்லூரிகளை தேர்ந்தெடுக்கலாம்?", a: "உங்கள் விருப்பத்தின் அடிப்படையில் 20 பொறியியல் கல்லூரிகளை வரிசைப்படுத்தி தேர்வு செய்யலாம்." },
        { q: "என்ன ஆவணங்கள் தேவை?", a: "10வது சான்றிதழ், 12வது சான்றிதழ், சமூக சான்றிதழ் மற்றும் பிற அடையாள சான்றுகள் தேவை." }
      ],
      registrationHelp: "பதிவுக்கு உதவி பெற, உங்கள் ஆவணங்களை தெளிவாக பதிவேற்றவும் மற்றும் அனைத்து புலங்களை சரியாக நிரப்பவும்.",
      verificationHelp: "உங்கள் ஆவணங்கள் சரிபார்க்கப்படுகின்றன. இது பொதுவாக 3-5 வேலை நாட்களை எடுக்கும்.",
      rankAnalysisHelp: "உங்கள் தரவரிசை உங்கள் மதிப்பீடுகளின் அடிப்படையில் கணக்கிடப்பட்டுள்ளது. பொருத்தமான கல்லூரிகளைக் காண எங்களின் பகுப்பாய்வு கருவிகளைப் பயன்படுத்தவும்.",
      choiceFillingHelp: "உங்கள் விருப்பங்களைச் சwirelyாதியாக தேர்வு செய்து வரிசைப்படுத்தவும். கல்லூரிகள் தகுதி மற்றும் விருப்ப வரிசையின் அடிப்படையில் ஒதுக்கப்படுகின்றன.",
      allotmentHelp: "உங்கள் இருக்கை ஒதுக்கீட்டு முடிவு தயாரிக்கப்பட்டுள்ளது. கவனமாক மதிப்பாய்வு செய்து உறுதிப்படுத்தலுக்கு செல்லவும்.",
      confirmationHelp: "உங்கள் ஒப்புதலை உறுதிப்படுத்தவும் குறிப்பிட்ட காலக்கெடுவில் உங்கள் இருக்கையை பாதுகாக்கவும்.",
      admissionHelp: "வாழ்த்துக்கள்! உங்கள் சேர்க்கை உறுதিப்படுத்தப்பட்டுள்ளது. இறுதி பதிவুக்கு கல்லூரிக்கு நன்று."
    }
  };

  const t = translations[language as keyof typeof translations];

  const getStepContextMessage = (): string => {
    switch (currentStep) {
      case "registration":
        return t.registrationHelp;
      case "verification":
        return t.verificationHelp;
      case "rank-analysis":
        return t.rankAnalysisHelp;
      case "choice-filling":
        return t.choiceFillingHelp;
      case "allotment":
        return t.allotmentHelp;
      case "confirmation":
        return t.confirmationHelp;
      case "admission":
        return t.admissionHelp;
      default:
        return "Hello! I'm the TNEA Assistant. How can I help you today?";
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInitialMessage = () => {
    if (messages.length === 0) {
      const initialMessage: Message = {
        id: "1",
        text: getStepContextMessage(),
        sender: "bot",
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    handleInitialMessage();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "";
      const lowerInput = inputValue.toLowerCase();

      // Check if question matches FAQ
      const faqMatch = t.faq.find(item => 
        item.q.toLowerCase().includes(lowerInput) || 
        lowerInput.includes(item.q.toLowerCase().split(" ")[0])
      );

      if (faqMatch) {
        botResponse = faqMatch.a;
      } else if (lowerInput.includes("help") || lowerInput.includes("assistance")) {
        botResponse = getStepContextMessage();
      } else if (lowerInput.includes("deadline") || lowerInput.includes("date")) {
        botResponse = "Please check the official TNEA website for the latest deadlines and important dates.";
      } else if (lowerInput.includes("document")) {
        botResponse = "Important documents: 10th certificate, 12th certificate, community certificate, and valid ID proof.";
      } else {
        botResponse = "Thank you for your question! For more detailed information, please visit the official TNEA website or contact your school counselor.";
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 500);
  };

  const handleFAQClick = (answer: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: "Thank you for the information!",
      sender: "user",
      timestamp: new Date()
    };

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: answer,
      sender: "bot",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] rounded-2xl shadow-2xl bg-white flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{t.title}</h3>
              <p className="text-blue-100 text-sm">Always here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isLoading ? (
              <div className="flex flex-col gap-3 h-full justify-start pt-6">
                <div className="space-y-2">
                  <p className="font-semibold text-gray-800">{t.faqTitle}</p>
                  {t.faq.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleFAQClick(item.a)}
                      className="w-full text-left text-sm p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-800 hover:text-gray-900"
                    >
                      {item.q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 rounded-lg rounded-bl-none p-3">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Section */}
          <form onSubmit={handleSendMessage} className="border-t p-4 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="rounded-full p-2 h-auto bg-blue-500 hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
