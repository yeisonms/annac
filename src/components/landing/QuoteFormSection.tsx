import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Loader2, User, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  QUOTE_REDIRECT_PATH,
  buildInternalUrl,
  buildQuoteWhatsAppMessage,
  buildWhatsAppUrl,
  isInsideIframe,
  navigateTopLevel,
  openExternalLink,
  saveQuoteRedirectPayload,
} from "@/lib/whatsapp";

const destinos = [
  "San andres",
  "Cartagena",
  "Cancun",
  "Santa marta",
  "Panama",
  "Punta cana",
  "Peru",
  "Brasil",
  "Europa",
  "Otro",
];

const codigosPais = [
  { code: "+57", flag: "🇨🇴", label: "CO" },
  { code: "+52", flag: "🇲🇽", label: "MX" },
  { code: "+1", flag: "🇺🇸", label: "US" },
  { code: "+34", flag: "🇪🇸", label: "ES" },
  { code: "+54", flag: "🇦🇷", label: "AR" },
  { code: "+56", flag: "🇨🇱", label: "CL" },
  { code: "+51", flag: "🇵🇪", label: "PE" },
  { code: "+593", flag: "🇪🇨", label: "EC" },
  { code: "+55", flag: "🇧🇷", label: "BR" },
  { code: "+507", flag: "🇵🇦", label: "PA" },
];

const edadOptions = Array.from({ length: 18 }, (_, i) => ({
  value: String(i),
  label: i === 0 ? "Menor de 1 año" : `${i} año${i > 1 ? "s" : ""}`,
}));

interface PassengerRowProps {
  label: string;
  subtitle: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}

function PassengerRow({ label, subtitle, value, min, onChange }: PassengerRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-bold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function QuoteFormSection() {
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDestino, setSelectedDestino] = useState<string>("");
  const [customDestino, setCustomDestino] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [codigoPais, setCodigoPais] = useState("+57");
  const [telefono, setTelefono] = useState("");
  const [fechaIda, setFechaIda] = useState("");
  const [fechaRegreso, setFechaRegreso] = useState("");

  const [adultos, setAdultos] = useState(1);
  const [menores, setMenores] = useState(0);
  const [edadesMenores, setEdadesMenores] = useState<number[]>([]);
  const [pasajerosOpen, setPasajerosOpen] = useState(false);

  const totalPasajeros = adultos + menores;

  // Keep edadesMenores array in sync with menores count
  const handleMenoresChange = (newCount: number) => {
    setMenores(newCount);
    setEdadesMenores((prev) => {
      if (newCount > prev.length) {
        // Add new entries with default age 0
        return [...prev, ...Array(newCount - prev.length).fill(0)];
      }
      // Trim excess entries
      return prev.slice(0, newCount);
    });
  };

  const updateEdadMenor = (index: number, edad: number) => {
    setEdadesMenores((prev) => {
      const updated = [...prev];
      updated[index] = edad;
      return updated;
    });
  };

  useEffect(() => {
    const destino = searchParams.get("destino");
    if (destino) {
      const match = destinos.find((d) => d.toLowerCase() === destino.toLowerCase());
      setSelectedDestino(match || "Otro");
      setTimeout(() => {
        document.getElementById("cotizar")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
      searchParams.delete("destino");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedDestino) {
      toast.error("Por favor selecciona un destino.");
      return;
    }

    const telefonoCompleto = `${codigoPais}${telefono.trim().replace(/^0+/, "")}`;

    const payload = {
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefonoCompleto,
      destino: selectedDestino === "Otro" ? customDestino.trim() : selectedDestino,
      fechaIda,
      fechaRegreso,
      numeroPersonas: totalPasajeros,
      adultos,
      menores,
      edadesMenores,
    };

    if (selectedDestino === "Otro" && !payload.destino) {
      toast.error("Por favor escribe el destino deseado.");
      return;
    }

    if (isInsideIframe()) {
      saveQuoteRedirectPayload(payload);
      navigateTopLevel(buildInternalUrl(QUOTE_REDIRECT_PATH));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("cotizaciones").insert({
        nombre: payload.nombre,
        email: payload.email,
        telefono: payload.telefono,
        destino: payload.destino,
        fecha_ida: payload.fechaIda,
        fecha_regreso: payload.fechaRegreso,
        numero_personas: payload.numeroPersonas,
        adultos: payload.adultos,
        ninos: payload.menores,
        infantes: 0,
        edades_menores: payload.edadesMenores.length > 0 ? payload.edadesMenores : null,
      });

      if (error) throw error;

      const waUrl = buildWhatsAppUrl(buildQuoteWhatsAppMessage(payload));

      toast.success("¡Solicitud enviada! Redirigiendo a WhatsApp...");

      setNombre("");
      setEmail("");
      setCodigoPais("+57");
      setTelefono("");
      setSelectedDestino("");
      setCustomDestino("");
      setFechaIda("");
      setFechaRegreso("");
      setAdultos(1);
      setMenores(0);
      setEdadesMenores([]);

      openExternalLink(waUrl);
    } catch (err: any) {
      console.error("Error al enviar cotización:", err);
      toast.error("Error al enviar la solicitud. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
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
                  <Input id="nombre" placeholder="Juan Pérez" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="juan@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <div className="flex gap-0">
                    <Select value={codigoPais} onValueChange={setCodigoPais}>
                      <SelectTrigger className="w-[100px] rounded-r-none border-r-0 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {codigosPais.map((cp) => (
                          <SelectItem key={cp.code} value={cp.code}>
                            <span className="flex items-center gap-1.5">
                              <span>{cp.flag}</span>
                              <span className="text-xs">{cp.code}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="telefono"
                      type="tel"
                      placeholder="300 123 4567"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="rounded-l-none"
                    />
                  </div>
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
                  {selectedDestino === "Otro" && (
                    <Input
                      id="customDestino"
                      placeholder="Escribe aquí el lugar de tus sueños..."
                      required
                      value={customDestino}
                      onChange={(e) => setCustomDestino(e.target.value)}
                      className="mt-2 animate-in fade-in"
                    />
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_ida">Fecha de ida *</Label>
                  <Input id="fecha_ida" type="date" required value={fechaIda} onChange={(e) => setFechaIda(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_regreso">Fecha de regreso *</Label>
                  <Input id="fecha_regreso" type="date" required value={fechaRegreso} onChange={(e) => setFechaRegreso(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Pasajeros *</Label>
                  <Popover open={pasajerosOpen} onOpenChange={setPasajerosOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className="w-full justify-start gap-2 font-normal h-10"
                      >
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>
                          {totalPasajeros} pasajero{totalPasajeros !== 1 ? "s" : ""}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="start">
                      <PassengerRow
                        label="Adultos"
                        subtitle="Desde 18 años"
                        value={adultos}
                        min={1}
                        onChange={setAdultos}
                      />
                      <div className="border-t border-border" />
                      <PassengerRow
                        label="Menores"
                        subtitle="Hasta 17 años"
                        value={menores}
                        min={0}
                        onChange={handleMenoresChange}
                      />

                      {menores > 0 && (
                        <div className="mt-2 pt-3 border-t border-border space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Edad de cada menor
                          </p>
                          {edadesMenores.map((edad, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground w-24 shrink-0">
                                Menor {idx + 1}
                              </Label>
                              <Select
                                value={String(edad)}
                                onValueChange={(v) => updateEdadMenor(idx, Number(v))}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {edadOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        type="button"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => setPasajerosOpen(false)}
                      >
                        Listo
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                aria-label="Solicitar Cotización por WhatsApp"
                className="w-full bg-coral hover:bg-coral/90 text-coral-foreground rounded-xl py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Enviando...
                  </>
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
