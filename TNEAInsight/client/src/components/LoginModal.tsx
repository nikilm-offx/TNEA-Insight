/**
 * Login Modal Component
 * Popup modal for student and admin login
 */

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { language } = useLanguage();
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [userType, setUserType] = useState<"student" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Use the login function from AuthContext
      await login(email, password);

      // Close modal and redirect based on role
      onClose();

      // We don't have the user here yet as state updates are async, 
      // but we can try to redirect based on what we know or the selected userType
      if (userType === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(language === "en" ? "Invalid email or password" : "தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {language === "en" ? "Login" : "உள்நுழைக"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* User Type Selector */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setUserType("student");
                setEmail("student_demo");
                setPassword("student123");
              }}
              className={`p-4 rounded-lg border-2 transition font-medium text-center ${userType === "student"
                ? "border-blue-600 bg-blue-50 text-blue-600"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
            >
              {language === "en" ? "Student" : "மாணவர்"}
            </button>
            <button
              onClick={() => {
                setUserType("admin");
                setEmail("admin");
                setPassword("admin123");
              }}
              className={`p-4 rounded-lg border-2 transition font-medium text-center ${userType === "admin"
                ? "border-blue-600 bg-blue-50 text-blue-600"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
            >
              {language === "en" ? "Admin" : "நிர்வாகம்"}
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-6">
          {/* Email/Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "en" ? "Email or Username" : "மின்னஞ்சல் அல்லது பயனர் பெயர்"}
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={language === "en" ? "Enter username" : "பயனர் பெயரை உள்ளிடவும்"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "en" ? "Password" : "கடவுச்சொல்"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === "en" ? "Enter password" : "கடவுச்சொல்லை உள்ளிடவும்"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 border border-gray-300 rounded" />
              <span className="text-gray-700">{language === "en" ? "Remember me" : "என்னை நினைவுகொள்ளவும்"}</span>
            </label>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {language === "en" ? "Forgot?" : "மறந்தனவா?"}
            </button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            {isLoading ? (
              language === "en" ? "Logging in..." : "உள்நுழைகிறது..."
            ) : (
              language === "en" ? "Login" : "உள்நுழைக"
            )}
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            {language === "en" ? "Don't have an account?" : "கணக்கு இல்லையா?"}{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {language === "en" ? "Sign up" : "பதிவு செய்யவும்"}
            </button>
          </p>
        </form>

        {/* Demo Credentials */}
        <div className="p-6 bg-blue-50 border-t border-gray-200">
          <p className="text-xs font-medium text-blue-900 mb-2">
            {language === "en" ? "Demo Credentials:" : "டெமோ சான்றுகள்:"}
          </p>
          <p className="text-xs text-blue-800">
            {userType === "admin"
              ? (language === "en" ? "Admin User: admin / admin123" : "நிர்வாகி: admin / admin123")
              : (language === "en" ? "Student User: student_demo / student123" : "மாணவர்: student_demo / student123")}
          </p>
        </div>
      </div>
    </div>
  );
}
