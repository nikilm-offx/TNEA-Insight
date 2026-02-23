/**
 * Main Navigation Header Component
 * Public navigation with login modal and language toggle
 * Uses AuthContext directly — no prop drilling needed.
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Menu, X, LogOut, Settings, Globe, LogIn, User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "./LoginModal";

interface NavbarProps {
  onLogout: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  const { isAuthenticated, user } = useAuth();
  const userRole = user?.role;
  const userName = user?.username || user?.email;
  const { language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onNavigate = (id: string) => {
    const routeMap: Record<string, string> = {
      home: "/",
      "how-it-works": "/how-it-works",
      predictor: "/college-predictor",
      cutoff: "/cutoff-analysis",
      guide: "/counselling-guide",
      about: "/about",
      contact: "/contact",
      "student-dashboard": "/dashboard",
      "admin-dashboard": "/admin",
    };
    if (routeMap[id]) setLocation(routeMap[id]);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: language === "en" ? "Home" : "முகப்பு", id: "home" },
    { label: language === "en" ? "How It Works" : "எப்படி செயல்படுகிறது", id: "how-it-works" },
    { label: language === "en" ? "College Predictor" : "கல்லூரி கணிப்பு", id: "predictor" },
    { label: language === "en" ? "Cutoff Analysis" : "வெட்டு பகுப்பாய்வு", id: "cutoff" },
    { label: language === "en" ? "Guide" : "வழிகாட்டி", id: "guide" },
    { label: language === "en" ? "About" : "பற்றி", id: "about" },
  ];

  return (
    <>
      <nav className={`bg-white sticky top-0 z-40 transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm border-b border-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")}>
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-blue-700 leading-none">TNEA</div>
                <div className="text-xs text-gray-500 leading-none">Insight</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="text-gray-700 hover:text-blue-600 transition font-medium text-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right Section: Language Toggle, Login, Profile */}
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <div className="relative group hidden sm:block">
                <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition">
                  <Globe className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">{language === "en" ? "EN" : "TA"}</span>
                </button>
                <div className="absolute right-0 w-24 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 top-full mt-2">
                  <button
                    onClick={() => setLanguage("en")}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 text-sm"
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage("ta")}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 text-sm border-t border-gray-200"
                  >
                    தமிழ்
                  </button>
                </div>
              </div>

              {/* Authentication Section */}
              {!isAuthenticated ? (
                <Button
                  onClick={() => setLoginModalOpen(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === "en" ? "Login" : "உள்நுழைக"}</span>
                </Button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {userName?.charAt(0) || "U"}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg top-full mt-2">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-600 capitalize">{userRole}</p>
                      </div>

                      <button
                        onClick={() => {
                          if (userRole === "admin") {
                            onNavigate("admin-dashboard");
                          } else {
                            onNavigate("student-dashboard");
                          }
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        {language === "en" ? "Dashboard" : "ড্যাশবোর্ড"}
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          // Navigate to settings
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm flex items-center gap-2 border-b border-gray-200"
                      >
                        <Settings className="w-4 h-4" />
                        {language === "en" ? "Settings" : "அமைப்புகள்"}
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        {language === "en" ? "Logout" : "வெளியேறு"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 rounded transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {loginModalOpen && <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />}
    </>
  );
}
