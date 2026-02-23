import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LoginForm from "../LoginForm";

export default function LoginFormExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <LoginForm onLogin={(data) => console.log("Login data:", data)} />
      </LanguageProvider>
    </ThemeProvider>
  );
}