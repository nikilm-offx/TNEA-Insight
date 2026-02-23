import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import StudentDashboard from "../StudentDashboard";

export default function StudentDashboardExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <StudentDashboard />
      </LanguageProvider>
    </ThemeProvider>
  );
}