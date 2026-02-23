import { Home, Search, BarChart3, BookOpen, Settings, LogOut, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

interface AppSidebarProps {
  userRole: "student" | "admin";
  onLogout: () => void;
}

export default function AppSidebar({ userRole, onLogout }: AppSidebarProps) {
  const { t } = useLanguage();
  const [location] = useLocation();

  const studentItems = [
    {
      title: t("nav.dashboard"),
      url: "/dashboard",
      icon: Home,
    },
    {
      title: t("nav.suggestions"),
      url: "/suggestions",
      icon: Search,
    },
    {
      title: t("nav.cutoff"),
      url: "/cutoff",
      icon: BarChart3,
    },
    {
      title: t("nav.guide"),
      url: "/guide",
      icon: BookOpen,
    },
  ];

  const adminItems = [
    {
      title: "Admin Dashboard",
      url: "/admin",
      icon: Shield,
    },
    {
      title: "Rank Lists",
      url: "/admin/ranks",
      icon: BarChart3,
    },
    {
      title: "Verification",
      url: "/admin/verification",
      icon: Settings,
    },
    {
      title: "Allocation",
      url: "/admin/allocation",
      icon: Home,
    },
  ];

  const items = userRole === "admin" ? adminItems : studentItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold">TNEA Insight</div>
            <div className="text-xs text-muted-foreground capitalize">{userRole}</div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {userRole === "admin" ? "Administration" : "Student Portal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.url.replace('/', '').replace('/', '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          
          <SidebarMenuButton 
            onClick={onLogout}
            data-testid="button-logout"
            className="w-full justify-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t("nav.logout")}
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}