import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Ingresa tu correo electrónico");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/actualizar-password`,
    });
    
    if (error) {
      toast.error("Error al enviar el enlace: " + error.message);
    } else {
      toast.success("Te hemos enviado un enlace al correo para recuperar tu contraseña");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/40">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto">
            <img src="/logo3.png" alt="Annac Viajes" className="h-24 w-auto mx-auto" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Recuperar contraseña</h2>
            <p className="text-sm text-muted-foreground mt-1">Ingresa tu correo para recibir un enlace de recuperación</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar enlace
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              ¿Recordaste tu contraseña?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
