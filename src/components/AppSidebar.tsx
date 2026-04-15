import { LayoutDashboard, Users, Plane, Wallet, Building2, History, FileText, Instagram, Star, Edit3 } from "lucide-react";
import logoAdmin from "/logo4.png";
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
    { title: "Cotizaciones", url: "/admin/cotizaciones", icon: FileText },
    ...(isAdmin ? [{ title: "Blog", url: "/admin/blog", icon: Edit3 }] : []),
    ...(isAdmin ? [{ title: "Redes (Reels)", url: "/admin/reels", icon: Instagram }] : []),
    ...(isAdmin ? [{ title: "Casos de Éxito", url: "/admin/casos-admin", icon: Star }] : []),
    ...(isAdmin ? [{ title: "Historial", url: "/admin/historial", icon: History }] : []),
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/50 px-4 py-4">
        {!collapsed && (
          <div className="flex items-center justify-center px-2">
            <img src={logoAdmin} alt="Annac Viajes" className="h-14 w-auto" />
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex items-center justify-center h-9 w-9">
            <img src={logoAdmin} alt="Annac" className="h-9 w-9 object-contain" />
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
