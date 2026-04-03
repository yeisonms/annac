import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { role, isAdmin, user, signOut } = useAuth();

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
              <div className="flex items-center gap-2 rounded-full border border-border/50 bg-background/50 backdrop-blur px-4 py-1.5 shadow-sm">
                {isAdmin ? (
                  <Shield className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs font-medium capitalize">{role}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  — {user?.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
