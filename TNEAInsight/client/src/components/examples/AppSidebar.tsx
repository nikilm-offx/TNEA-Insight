import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "../AppSidebar";

export default function AppSidebarExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <AppSidebar 
              userRole="student" 
              currentPath="/dashboard"
              onNavigate={(path) => console.log("Navigate to:", path)}
              onLogout={() => console.log("Logout clicked")}
            />
            <div className="flex-1 p-8">
              <h2 className="text-2xl font-bold">Main Content Area</h2>
              <p className="text-muted-foreground">This is where page content would appear</p>
            </div>
          </div>
        </SidebarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}