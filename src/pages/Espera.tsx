import { Clock, LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Espera() {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo */}
        <img src="/logo3.png" alt="Annac Viajes" className="h-20 w-auto mx-auto" />

        {/* Icon + Message */}
        <div className="bg-card border border-border/40 rounded-2xl shadow-xl p-10 space-y-5">
          <div className="flex items-center justify-center mx-auto h-20 w-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <Clock className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Cuenta Pendiente de Aprobación
          </h1>

          <p className="text-muted-foreground leading-relaxed">
            Tu cuenta ha sido creada exitosamente, pero requiere la{" "}
            <span className="font-semibold text-foreground">aprobación de un administrador</span>{" "}
            para acceder al sistema.
            <br /><br />
            Te notificaremos cuando tu cuenta esté activa.
          </p>

          {user?.email && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-xl px-4 py-3">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          ¿Problemas? Escríbenos a{" "}
          <a
            href="mailto:annacviajesatumedida@gmail.com"
            className="text-primary hover:underline"
          >
            annacviajesatumedida@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
