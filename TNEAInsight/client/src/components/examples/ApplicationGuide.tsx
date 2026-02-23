import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ApplicationGuide from "../ApplicationGuide";

export default function ApplicationGuideExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ApplicationGuide />
      </LanguageProvider>
    </ThemeProvider>
  );
}