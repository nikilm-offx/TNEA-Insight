import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import AppSidebar from "@/components/AppSidebar";
import StudentDashboard from "@/components/StudentDashboard";
import CollegeSuggestionTool from "@/components/CollegeSuggestionTool";
import ChatBot from "@/components/ChatBot";
import ApplicationGuide from "@/components/ApplicationGuide";
import AdminDashboard from "@/components/AdminDashboard";
import ThemeToggle from "@/components/ThemeToggle";
import FloatingChatbot from "@/components/FloatingChatbot";
import LandingPage from "@/components/LandingPage";
import Navbar from "@/components/Navbar";
import StudentWorkflow from "@/components/StudentWorkflow";
import PrivateRoute from "@/components/PrivateRoute";
import HowItWorksPage from "@/components/HowItWorksPage";
import CollegePredictorPage from "@/components/CollegePredictorPage";
import CutoffAnalysisPage from "@/components/CutoffAnalysisPage";
import CounsellingGuidePage from "@/components/CounsellingGuidePage";
import AboutPage from "@/components/AboutPage";
import ContactPage from "@/components/ContactPage";
import { Loader2 } from "lucide-react";

function PublicRouter() {
  return (
    <Switch>
      <Route path="/" component={() => <LandingPage />} />
      <Route path="/how-it-works" component={() => <HowItWorksPage />} />
      <Route path="/college-predictor" component={() => <CollegePredictorPage />} />
      <Route path="/cutoff-analysis" component={() => <CutoffAnalysisPage />} />
      <Route path="/counselling-guide" component={() => <CounsellingGuidePage />} />
      <Route path="/about" component={() => <AboutPage />} />
      <Route path="/contact" component={() => <ContactPage />} />
      <Route component={NotFound} />
    </Switch>
  );
}


function PrivateRouter({ userRole }: { userRole: "student" | "admin" }) {
  return (
    <Switch>
      <Route path="/dashboard" component={() => (
        <PrivateRoute requiredRole="student">
          <StudentDashboard />
        </PrivateRoute>
      )} />
      <Route path="/workflow" component={() => (
        <PrivateRoute requiredRole="student">
          <StudentWorkflow />
        </PrivateRoute>
      )} />
      <Route path="/suggestions" component={() => (
        <PrivateRoute requiredRole="student">
          <CollegeSuggestionTool />
        </PrivateRoute>
      )} />
      <Route path="/cutoff" component={() => (
        <PrivateRoute requiredRole="student">
          <div className="p-6"><h1 className="text-3xl font-bold">Cutoff Prediction</h1><p className="text-muted-foreground">AI-powered cutoff prediction will be implemented here</p></div>
        </PrivateRoute>
      )} />
      <Route path="/guide" component={() => (
        <PrivateRoute requiredRole="student">
          <ApplicationGuide />
        </PrivateRoute>
      )} />
      <Route path="/chat" component={() => (
        <PrivateRoute requiredRole="student">
          <ChatBot />
        </PrivateRoute>
      )} />
      <Route path="/admin" component={() => (
        <PrivateRoute requiredRole="admin">
          <AdminDashboard />
        </PrivateRoute>
      )} />
      <Route path="/admin/ranks" component={() => (
        <PrivateRoute requiredRole="admin">
          <div className="p-6"><h1 className="text-3xl font-bold">Rank List Management</h1></div>
        </PrivateRoute>
      )} />
      <Route path="/admin/verification" component={() => (
        <PrivateRoute requiredRole="admin">
          <div className="p-6"><h1 className="text-3xl font-bold">Certificate Verification</h1></div>
        </PrivateRoute>
      )} />
      <Route path="/admin/allocation" component={() => (
        <PrivateRoute requiredRole="admin">
          <div className="p-6"><h1 className="text-3xl font-bold">Seat Allocation</h1></div>
        </PrivateRoute>
      )} />
      <Route path="/" component={() => <Redirect to="/dashboard" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Custom sidebar width for the application
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Public pages - show navbar with login option
  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar onLogout={logout} />
        <main className="flex-1">
          <PublicRouter />
        </main>
      </div>
    );
  }

  // Authenticated pages - show sidebar
  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          userRole={user.role}
          onLogout={logout}
        />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <PrivateRouter userRole={user.role} />
          </main>
        </div>
      </div>
      <FloatingChatbot currentStep="registration" />
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppContent />
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
