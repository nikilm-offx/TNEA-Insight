import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import CollegeSuggestionTool from "../CollegeSuggestionTool";

export default function CollegeSuggestionToolExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CollegeSuggestionTool />
      </LanguageProvider>
    </ThemeProvider>
  );
}