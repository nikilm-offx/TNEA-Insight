import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ChatBot from "../ChatBot";

export default function ChatBotExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ChatBot />
      </LanguageProvider>
    </ThemeProvider>
  );
}