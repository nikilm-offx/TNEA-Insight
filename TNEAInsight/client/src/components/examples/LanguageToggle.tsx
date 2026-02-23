import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageToggle from "../LanguageToggle";

export default function LanguageToggleExample() {
  return (
    <LanguageProvider>
      <div className="p-4">
        <LanguageToggle />
      </div>
    </LanguageProvider>
  );
}