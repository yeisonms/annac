import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const destinos = [
  "Colombia",
  "El Caribe",
  "Norteamérica",
  "Europa",
  "Asia",
  "Sudamérica",
  "Otro",
];

export function QuoteFormSection() {
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDestino, setSelectedDestino] = useState<string>("");

  useEffect(() => {
    const destino = searchParams.get("destino");
    if (destino) {
      // Check if it matches a known category, otherwise use "Otro"
      const match = destinos.find((d) => d.toLowerCase() === destino.toLowerCase());
      setSelectedDestino(match || "Otro");
      // Scroll to the form
      setTimeout(() => {
        document.getElementById("cotizar")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
      // Clean up the URL param
      searchParams.delete("destino");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    toast({
      title: "¡Solicitud enviada!",
      description: "Nos pondremos en contacto contigo muy pronto.",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section id="cotizar" className="py-20 lg:py-28 bg-muted/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-coral mb-3">
            Cotización gratuita
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Solicita tu viaje a medida
          </h2>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Datos de tu viaje</CardTitle>
            <CardDescription>Completa el formulario y te contactaremos en menos de 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre y apellido *</Label>
                  <Input id="nombre" placeholder="Juan Pérez" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="juan@email.com" required />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input id="telefono" type="tel" placeholder="+57 300 123 4567" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destino">Destino *</Label>
                  <Select value={selectedDestino} onValueChange={setSelectedDestino} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinos.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_ida">Fecha de ida *</Label>
                  <Input id="fecha_ida" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_regreso">Fecha de regreso *</Label>
                  <Input id="fecha_regreso" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personas">N° de personas *</Label>
                  <Input id="personas" type="number" min={1} placeholder="2" required />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-coral hover:bg-coral/90 text-coral-foreground rounded-xl py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Solicitar Cotización
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
