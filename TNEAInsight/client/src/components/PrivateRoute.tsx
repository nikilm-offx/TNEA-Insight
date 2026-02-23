/**
 * Private Route Guard Component
 * Protects routes that require authentication
 */

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: "student" | "admin";
}

export default function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login
    setLocation("/");
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect if user doesn't have required role
    setLocation("/");
    return null;
  }

  return <>{children}</>;
}
