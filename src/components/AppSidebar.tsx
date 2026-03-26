import { LayoutDashboard, Users, Plane, Wallet, Building2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { isAdmin } = useAuth();

  const items = [
    ...(isAdmin ? [{ title: "Dashboard", url: "/admin", icon: LayoutDashboard }] : []),
    { title: "Clientes", url: "/admin/clientes", icon: Users },
    { title: "Ventas", url: "/admin/ventas", icon: Plane },
    { title: "Cartera", url: "/admin/cartera", icon: Wallet },
    { title: "Proveedores", url: "/admin/proveedores", icon: Building2 },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-sidebar-primary" />
            <span className="text-lg font-bold text-sidebar-foreground">TravelCRM</span>
          </div>
        )}
        {collapsed && <Plane className="h-6 w-6 text-sidebar-primary mx-auto" />}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
