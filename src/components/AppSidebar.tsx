import { LayoutDashboard, Users, Plane, Wallet, Building2, History, FileText } from "lucide-react";
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
    ...(isAdmin ? [{ title: "Historial", url: "/admin/historial", icon: History }] : []),
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/50 px-4 py-5">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Plane className="h-4 w-4" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-sidebar-foreground">ANNAC</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Plane className="h-4 w-4" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="px-2 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-sidebar-foreground/40 uppercase ml-2 mb-2">Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200" activeClassName="bg-sidebar-primary/10 text-sidebar-primary font-semibold shadow-sm">
                      <item.icon className="mr-3 h-4 w-4" />
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
