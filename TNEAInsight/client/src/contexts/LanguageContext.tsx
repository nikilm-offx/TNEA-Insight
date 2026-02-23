import { createContext, useContext, useState } from "react";

type Language = "en" | "ta";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Translation dictionary for bilingual support
const translations = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.suggestions": "College Suggestions",
    "nav.cutoff": "Cutoff Prediction",
    "nav.guide": "Application Guide",
    "nav.chat": "AI Assistant",
    "nav.admin": "Admin",
    "nav.logout": "Logout",
    
    // Common
    "common.login": "Login",
    "common.register": "Register",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.loading": "Loading...",
    
    // Authentication
    "auth.welcome": "Welcome to TNEA Insight",
    "auth.username": "Username",
    "auth.password": "Password",
    "auth.role": "Role",
    "auth.student": "Student",
    "auth.admin": "Admin",
    
    // Dashboard
    "dashboard.title": "Student Dashboard",
    "dashboard.overview": "Overview",
    "dashboard.placements": "Historical Placements",
    "dashboard.stats": "Statistics",
    
    // College Suggestions
    "suggestions.title": "College Suggestions",
    "suggestions.marks": "Your Marks",
    "suggestions.category": "Category",
    "suggestions.preferences": "Preferences",
    "suggestions.results": "Suggested Colleges",
    
    // Application Guide
    "guide.title": "TNEA Application Guide",
    "guide.step": "Step"
  },
  ta: {
    // Navigation (Tamil)
    "nav.dashboard": "முகப்பு",
    "nav.suggestions": "கல்லூரி பரிந்துரைகள்",
    "nav.cutoff": "கட்ஆஃப் கணிப்பு",
    "nav.guide": "விண்ணப்ப வழிகாட்டி",
    "nav.chat": "AI உதவியாளர்",
    "nav.admin": "நிர்வாகம்",
    "nav.logout": "வெளியேறு",
    
    // Common (Tamil)
    "common.login": "உள்நுழைய",
    "common.register": "பதிவு செய்ய",
    "common.submit": "சமர்ப்பிக்க",
    "common.cancel": "ரத்து செய்",
    "common.save": "சேமி",
    "common.edit": "திருத்து",
    "common.delete": "நீக்கு",
    "common.search": "தேடு",
    "common.filter": "வடிகட்டி",
    "common.loading": "ஏற்றுகிறது...",
    
    // Authentication (Tamil)
    "auth.welcome": "TNEA Insight-க்கு வரவேற்கிறோம்",
    "auth.username": "பயனர் பெயர்",
    "auth.password": "கடவுச்சொல்",
    "auth.role": "பணி",
    "auth.student": "மாணவர்",
    "auth.admin": "நிர்வாகி",
    
    // Dashboard (Tamil)
    "dashboard.title": "மாணவர் முகப்பு",
    "dashboard.overview": "மேலோட்டம்",
    "dashboard.placements": "வரலாற்று இடம்பெறல்",
    "dashboard.stats": "புள்ளிவிவரங்கள்",
    
    // College Suggestions (Tamil)
    "suggestions.title": "கல்லூரி பரிந்துரைகள்",
    "suggestions.marks": "உங்கள் மதிப்பெண்கள்",
    "suggestions.category": "வகை",
    "suggestions.preferences": "விருப்பத்தேர்வுகள்",
    "suggestions.results": "பரிந்துரைக்கப்பட்ட கல்லூரிகள்",
    
    // Application Guide (Tamil)
    "guide.title": "TNEA விண்ணப்ப வழிகாட்டி",
    "guide.step": "படி"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguageState(prev => prev === "en" ? "ta" : "en");
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}