import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Mail,
  Video,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Prospects", path: "/prospects" },
    { icon: Mail, label: "Campagnes", path: "/campaigns" },
    { icon: Video, label: "Webinaires", path: "/webinars" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar-bg border-r border-border transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="mb-8 px-2 pt-2">
            <h2 className="text-xl font-semibold text-foreground">
              CRM Pro
            </h2>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={`w-full justify-start text-sidebar-text hover:bg-muted ${
                  window.location.pathname === item.path
                    ? "bg-success/10 text-success hover:bg-success/15"
                    : ""
                }`}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>

          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-text hover:bg-muted"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 p-6 lg:p-8">{children}</main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
