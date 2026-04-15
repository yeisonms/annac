import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim() || !password) {
      toast.error("Completa todos los campos");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { nombre_completo: nombre.trim() },
      },
    });

    setLoading(false);

    if (error) {
      toast.error("Error al registrar: " + error.message);
    } else {
      setDone(true);
    }
  };

  // Success state
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <Card className="w-full max-w-md shadow-2xl border-border/40 text-center">
          <CardContent className="pt-10 pb-10 space-y-5">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-extrabold tracking-tight">¡Registro Exitoso!</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tu cuenta ha sido creada. Un administrador la activará pronto.
              <br />Te notificaremos cuando puedas acceder.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 text-sm font-medium text-primary hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/40">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto">
            <img src="/logo3.png" alt="Annac Viajes" className="h-24 w-auto mx-auto" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Crear Cuenta</h1>
            <p className="text-sm text-muted-foreground">Solicita acceso al sistema de gestión</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Ana García López"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Solicitar Acceso
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
