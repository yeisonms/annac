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
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                Sistema de Gestión Financiera — Agencia de Viajes
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5">
                <User className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="role-toggle" className="text-xs cursor-pointer select-none">Agente</Label>
                <Switch
                  id="role-toggle"
                  checked={isAdmin}
                  onCheckedChange={(checked) => setRole(checked ? "admin" : "agente")}
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="role-toggle" className="text-xs cursor-pointer select-none">Admin</Label>
                <Shield className={`h-4 w-4 ${isAdmin ? "text-primary" : "text-muted-foreground"}`} />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
