import { Layout, UsersThree, EnvelopeSimple, VideoCamera, Palette, Gear, FlowArrow, SignOut, User, Globe } from "@phosphor-icons/react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Layout },
  { title: "Landing Pages", url: "/landing-pages", icon: Globe },
  { title: "Prospects", url: "/prospects", icon: UsersThree },
  { title: "Branding", url: "/branding", icon: Palette },
  { title: "Templates Mail", url: "/mail", icon: Gear },
  { title: "Workflows", url: "/workflow", icon: FlowArrow },
  { title: "Campagnes", url: "/campaigns", icon: EnvelopeSimple },
  { title: "Webinaires", url: "/webinars", icon: VideoCamera },
];

export function AppSidebar() {
  const { open } = useSidebar();
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

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="px-3 py-4 flex items-center justify-between">
          <h2 className={`font-bold transition-all ${open ? "text-lg" : "text-xs"}`}>
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {open ? "CRM Pro" : "CP"}
            </span>
          </h2>
          {open && <SidebarTrigger className="-mr-1" />}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {open && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-1.5">
        {!open && <SidebarTrigger className="mb-2 self-center" />}
        <Button
          variant="ghost"
          size="sm"
          className={`w-full ${open ? 'justify-start px-3' : 'justify-center px-0'} text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent text-sm h-9`}
          onClick={handleLogout}
        >
          <SignOut className="h-4 w-4 flex-shrink-0" />
          {open && <span className="ml-2.5 text-sm">Déconnexion</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
