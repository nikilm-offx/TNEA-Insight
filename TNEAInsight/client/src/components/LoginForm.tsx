import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserCheck, Loader2 } from "lucide-react";

export default function LoginForm() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(formData.username, formData.password);
      toast({
        title: t("auth.loginSuccess"),
        description: t("auth.welcomeBack"),
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: t("auth.loginError"),
        description: error instanceof Error ? error.message : t("auth.invalidCredentials"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <UserCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">TNEA Insight</CardTitle>
          <CardDescription className="text-center">
            {t("auth.welcome")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" data-testid="label-username">
                {t("auth.username")}
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                data-testid="input-username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" data-testid="label-password">
                {t("auth.password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                data-testid="input-password"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              data-testid="button-login"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4 mr-2" />
              )}
              {isLoading ? t("auth.loggingIn") : t("common.login")}
            </Button>
            
            {/* Demo credentials hint */}
            <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm">
              <p className="font-medium text-muted-foreground mb-1">{t("auth.demoCredentials")}:</p>
              <p className="text-xs">Admin: admin / admin123</p>
              <p className="text-xs">Student: student_demo / student123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}