import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      data-testid="button-language-toggle"
      className="h-9 px-3 font-medium"
    >
      <Languages className="h-4 w-4 mr-2" />
      {language === "en" ? "தமிழ்" : "English"}
    </Button>
  );
}