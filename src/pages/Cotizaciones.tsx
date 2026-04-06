import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, MessageCircle, Loader2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

interface Cotizacion {
  id: string;
  created_at: string;
  nombre: string;
  email: string;
  telefono: string;
  destino: string;
  fecha_ida: string | null;
  fecha_regreso: string | null;
  numero_personas: number | null;
  estado: string;
}

const estadoBadge = (estado: string) => {
  switch (estado) {
    case "nuevo":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Nuevo</Badge>;
    case "atendido":
    case "contactado":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Atendido</Badge>;
    case "vendido":
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">Vendido</Badge>;
    case "perdido":
      return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Perdido</Badge>;
    default:
      return <Badge variant="outline">{estado}</Badge>;
  }
};

const Cotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCotizaciones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cotizaciones")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar las cotizaciones.", variant: "destructive" });
    } else {
      setCotizaciones(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCotizaciones();
  }, []);

  const marcarAtendido = async (id: string) => {
    const { error } = await supabase
      .from("cotizaciones")
      .update({ estado: "atendido" })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
      return;
    }

    setCotizaciones((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado: "atendido" } : c))
    );
    toast({ title: "Actualizado", description: "Cotización marcada como atendida." });
  };

  const nuevasCount = cotizaciones.filter((c) => c.estado === "nuevo").length;

  const formatFecha = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  };

  const formatFechaCorta = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "dd/MM/yy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cotizaciones Recientes</h1>
          <p className="text-muted-foreground text-sm">Leads recibidos desde la landing page</p>
        </div>
        {nuevasCount > 0 && (
          <Badge className="bg-amber-500 text-white text-sm px-3 py-1 hover:bg-amber-500">
            {nuevasCount} nueva{nuevasCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Todas las cotizaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : cotizaciones.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              No hay cotizaciones aún.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Detalles del Viaje</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cotizaciones.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {formatFecha(c.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{c.nombre}</div>
                      <div className="text-sm text-muted-foreground">{c.email}</div>
                      <div className="text-sm text-muted-foreground">{c.telefono}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{c.destino}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFechaCorta(c.fecha_ida)} → {formatFechaCorta(c.fecha_regreso)}
                        {c.numero_personas && ` · ${c.numero_personas} pax`}
                      </div>
                    </TableCell>
                    <TableCell>{estadoBadge(c.estado)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.estado === "nuevo" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => marcarAtendido(c.id)}
                            className="gap-1.5"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Atendido
                          </Button>
                        )}
                        {c.telefono && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            asChild
                          >
                            <a
                              href={`https://wa.me/${c.telefono.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              WhatsApp
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Cotizaciones;
