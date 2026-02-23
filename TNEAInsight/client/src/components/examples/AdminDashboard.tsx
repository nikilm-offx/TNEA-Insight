import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AdminDashboard from "../AdminDashboard";

export default function AdminDashboardExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AdminDashboard />
      </LanguageProvider>
    </ThemeProvider>
  );
}