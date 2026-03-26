import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, User } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { role, setRole, isAdmin } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-muted/10">
          <header className="h-16 flex items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 shrink-0 sticky top-0 z-10 transition-all duration-200">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-accent/50 transition-colors" />
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  Sistema de Gestión Financiera
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  ANNAC — Agencia de Viajes
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-full border border-border/50 bg-background/50 backdrop-blur px-4 py-1.5 shadow-sm transition-all hover:shadow-md">
                <User className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="role-toggle" className="text-xs font-medium cursor-pointer select-none">Agente</Label>
                <Switch
                  id="role-toggle"
                  checked={isAdmin}
                  onCheckedChange={(checked) => setRole(checked ? "admin" : "agente")}
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="role-toggle" className="text-xs font-medium cursor-pointer select-none">Admin</Label>
                <Shield className={`h-4 w-4 transition-colors ${isAdmin ? "text-primary" : "text-muted-foreground"}`} />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
