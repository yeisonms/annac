import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MessageCircle, FileText, User, StickyNote, Plus } from "lucide-react";
import { formatPassengerBreakdown } from "@/lib/whatsapp";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  adultos: number | null;
  ninos: number | null;
  infantes: number | null;
  edades_menores: number[] | null;
  estado: string;
  asignado_a: string | null;
  notas: string | null;
}

const ESTADOS = [
  "Nueva",
  "Conversación Inicial",
  "Cotización Realizada",
  "Esperando Respuesta",
  "Finalizada",
  "Rechazada"
];

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "Nueva":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
    case "Conversación Inicial":
      return "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200";
    case "Cotización Realizada":
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200";
    case "Esperando Respuesta":
      return "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200";
    case "Finalizada":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200";
    case "Rechazada":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
  }
};

const Cotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAsignado, setFiltroAsignado] = useState<"todas" | "mis">("todas");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [notasOpen, setNotasOpen] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState<Cotizacion | null>(null);
  const [notasTemp, setNotasTemp] = useState("");
  const [savingNotas, setSavingNotas] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    destino: "",
    fecha_ida: "",
    fecha_regreso: "",
    numero_personas: "",
    estado: "Nueva",
    asignado_a: "unassigned",
    notas: "",
  });
  const [creating, setCreating] = useState(false);

  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  const openNotas = (c: Cotizacion) => {
    setSelectedCotizacion(c);
    setNotasTemp(c.notas || "");
    setNotasOpen(true);
  };

  const saveNotas = async () => {
    if (!selectedCotizacion) return;
    setSavingNotas(true);
    const { error } = await supabase
      .from("cotizaciones")
      .update({ notas: notasTemp })
      .eq("id", selectedCotizacion.id);
      
    if (error) {
      toast({ title: "Error", description: "No se pudieron guardar las notas.", variant: "destructive" });
    } else {
      setCotizaciones((prev) => prev.map((c) => (c.id === selectedCotizacion.id ? { ...c, notas: notasTemp } : c)));
      toast({ title: "Notas guardadas", description: "Se actualizaron los comentarios." });
      setNotasOpen(false);
    }
    setSavingNotas(false);
  };

  const handleCreate = async () => {
    if (!createForm.nombre || !createForm.destino) {
      toast({ title: "Campos requeridos", description: "Nombre y destino son obligatorios.", variant: "destructive" });
      return;
    }
    setCreating(true);
    const payload = {
      nombre: createForm.nombre,
      email: createForm.email || "No especificado",
      telefono: createForm.telefono || "",
      destino: createForm.destino,
      fecha_ida: createForm.fecha_ida || null,
      fecha_regreso: createForm.fecha_regreso || null,
      numero_personas: createForm.numero_personas ? Number(createForm.numero_personas) : null,
      estado: createForm.estado,
      asignado_a: isAdmin
        ? (createForm.asignado_a === "unassigned" ? null : createForm.asignado_a)
        : user?.id ?? null,
      notas: createForm.notas || null
    };

    const { error } = await supabase.from("cotizaciones").insert(payload);
    if (error) {
      toast({ title: "Error", description: "No se pudo registrar la cotización: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Cotización creada manualmente." });
      setCreateOpen(false);
      setCreateForm({ nombre: "", email: "", telefono: "", destino: "", fecha_ida: "", fecha_regreso: "", numero_personas: "", estado: "Nueva", asignado_a: "unassigned", notas: "" });
      fetchCotizacionesAndPerfiles();
    }
    setCreating(false);
  };

  const fetchPerfiles = async () => {
    const { data } = await supabase.from("perfiles").select("id, nombre_completo, email").order("nombre_completo");
    if (data) setPerfiles(data);
  };

  const fetchCotizacionesAndPerfiles = async () => {
    setLoading(true);
    const [resCot] = await Promise.all([
      supabase.from("cotizaciones").select("*").order("created_at", { ascending: false }),
      fetchPerfiles()
    ]);
    
    if (resCot.error) {
      toast({ title: "Error", description: "No se pudieron cargar las cotizaciones.", variant: "destructive" });
    } else {
      setCotizaciones(resCot.data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchCotizacionesAndPerfiles();
  }, []);

  const updateEstado = async (id: string, nuevoEstado: string) => {
    const { error } = await supabase.from("cotizaciones").update({ estado: nuevoEstado }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
    } else {
      setCotizaciones((prev) => prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c)));
      toast({ title: "Actualizado", description: "Estado modificado exitosamente." });
    }
  };

  const updateAsignado = async (id: string, nuevoAsignado: string) => {
    const val = nuevoAsignado === "unassigned" ? null : nuevoAsignado;
    const { error } = await supabase.from("cotizaciones").update({ asignado_a: val }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: "No se pudo reasignar.", variant: "destructive" });
    } else {
      setCotizaciones((prev) => prev.map((c) => (c.id === id ? { ...c, asignado_a: val } : c)));
      toast({ title: "Reasignado", description: "La cotización fue asignada." });
    }
  };

  const getPerfilNombre = (id: string | null) => {
    if (!id) return "Sin Asignar";
    const p = perfiles.find(x => x.id === id);
    if (!p) return `Asesor (${id.substring(0, 4)})`;
    const name = p.nombre_completo || p.email || "Asesor";
    return name.split(" ")[0];
  };

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

  const filteredCotizaciones = cotizaciones.filter((c) => {
    const isMis = filtroAsignado === "mis" || !isAdmin;
    const matchAsignado = isMis ? c.asignado_a === user?.id : true;
    const matchEstado = filtroEstado === "todos" ? true : c.estado === filtroEstado;
    return matchAsignado && matchEstado;
  });

  const nuevasCount = filteredCotizaciones.filter((c) => c.estado === "Nuevas" || c.estado === "nuevo").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">CRM de Cotizaciones</h1>
          <p className="text-muted-foreground text-sm">Gestiona y asigna los leads captados de la landing page y manualmente.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {nuevasCount > 0 && (
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-3 py-1.5 text-sm">
              {nuevasCount} Nueva{nuevasCount !== 1 ? "s" : ""}
            </Badge>
          )}
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" /> Nueva Cotización 
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-card/60 p-3 rounded-2xl border border-border/50 shadow-sm">
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Select value={filtroAsignado} onValueChange={(v: "todas" | "mis") => setFiltroAsignado(v)}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Filtrar asignación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las Cotizaciones</SelectItem>
                <SelectItem value="mis">Mis Cotizaciones</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los Estados</SelectItem>
              {ESTADOS.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-none shadow-md bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <FileText className="h-5 w-5 text-primary" />
            Registro de Leads
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredCotizaciones.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground flex flex-col items-center gap-2">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
              <p>No se encontraron cotizaciones con los filtros actuales.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Viaje</TableHead>
                    <TableHead>Estado</TableHead>
                    {isAdmin && <TableHead>Asignado A</TableHead>}
                    <TableHead className="text-right">Contacto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCotizaciones.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="whitespace-nowrap font-medium text-muted-foreground">
                        {formatFecha(c.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-foreground">{c.nombre}</div>
                        <div className="text-sm text-muted-foreground">{c.email}</div>
                        <div className="text-sm text-muted-foreground">{c.telefono}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{c.destino}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatFechaCorta(c.fecha_ida)} → {formatFechaCorta(c.fecha_regreso)}
                        </div>
                        {(c.adultos != null || c.ninos != null) ? (
                          <Badge variant="secondary" className="mt-1 text-[10px]">
                            {formatPassengerBreakdown(c.adultos ?? 0, (c.ninos ?? 0) + (c.infantes ?? 0), c.edades_menores)}
                          </Badge>
                        ) : c.numero_personas ? (
                          <Badge variant="secondary" className="mt-1 text-[10px]">
                            {c.numero_personas} Pax
                          </Badge>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Select value={ESTADOS.includes(c.estado) ? c.estado : (c.estado === 'nuevo' || c.estado === 'Nuevo' ? "Nueva" : "Conversación Inicial")} onValueChange={(val) => updateEstado(c.id, val)}>
                          <SelectTrigger className={`h-8 w-[190px] rounded-full font-semibold border transition-colors ${getEstadoColor(c.estado === 'nuevo' || c.estado === 'Nuevo' ? 'Nueva' : c.estado)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ESTADOS.map((e) => (
                              <SelectItem key={e} value={e}>
                                <div className="flex items-center gap-2">
                                  <div className={`h-2 w-2 rounded-full ${getEstadoColor(e).split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500')}`} />
                                  {e}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      {isAdmin && (
                      <TableCell>
                        <Select value={c.asignado_a || "unassigned"} onValueChange={(val) => updateAsignado(c.id, val)}>
                          <SelectTrigger className="h-8 w-[180px] bg-background [&>span]:truncate [&>span]:max-w-[150px] [&>span]:block [&>span]:text-left">
                            <SelectValue placeholder="Sin Asignar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned" className="text-muted-foreground italic">Sin Asignar</SelectItem>
                            {perfiles.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  {getPerfilNombre(p.id)}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100 rounded-full bg-amber-50 shadow-sm"
                            onClick={() => openNotas(c)}
                            title="Ver / Editar Notas"
                          >
                            <StickyNote className="h-4 w-4" />
                          </Button>
                          {c.telefono && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-full bg-emerald-50 shadow-sm"
                            asChild
                          >
                            <a
                              href={`https://wa.me/${c.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${c.nombre}, soy de Annac Viajes. Recibimos tu solicitud de viaje a ${c.destino}${(c.adultos != null || c.ninos != null) ? ` (${formatPassengerBreakdown(c.adultos ?? 0, (c.ninos ?? 0) + (c.infantes ?? 0), c.edades_menores)})` : c.numero_personas ? ` para ${c.numero_personas} personas` : ""}. ¡Estamos preparando tu cotización!`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Mensaje por WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={notasOpen} onOpenChange={setNotasOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-amber-600" />
              Notas / Comentarios
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {selectedCotizacion && (
              <div className="text-sm bg-muted/60 p-3 rounded-lg border border-border/50 shadow-inner">
                <p><span className="font-semibold text-foreground">Cliente:</span> {selectedCotizacion.nombre}</p>
                <p className="mt-1"><span className="font-semibold text-foreground">Viaje:</span> {selectedCotizacion.destino}</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Textarea
                value={notasTemp}
                onChange={(e) => setNotasTemp(e.target.value)}
                placeholder="No hay comentarios registrados..."
                className="min-h-[150px] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNotasOpen(false)}>Cancelar</Button>
            <Button onClick={saveNotas} disabled={savingNotas} className="bg-amber-600 hover:bg-amber-700 text-white">
              Guardar Notas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nueva Cotización</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="grid gap-1.5 md:col-span-2">
              <Label>Nombre del Cliente *</Label>
              <Input value={createForm.nombre} onChange={e => setCreateForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej. Juan Pérez" />
            </div>
            <div className="grid gap-1.5 md:col-span-2">
              <Label>Destino de Interés *</Label>
              <Input value={createForm.destino} onChange={e => setCreateForm(p => ({ ...p, destino: e.target.value }))} placeholder="Ej. Cancún, México" />
            </div>
            <div className="grid gap-1.5">
              <Label>Teléfono / WhatsApp</Label>
              <Input value={createForm.telefono} onChange={e => setCreateForm(p => ({ ...p, telefono: e.target.value }))} placeholder="+57 300 000 0000" />
            </div>
            <div className="grid gap-1.5">
              <Label>Correo Electrónico</Label>
              <Input value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} placeholder="correo@ejemplo.com" />
            </div>
            <div className="grid gap-1.5">
              <Label>Fecha Ida</Label>
              <Input type="date" value={createForm.fecha_ida} onChange={e => setCreateForm(p => ({ ...p, fecha_ida: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label>Fecha Regreso</Label>
              <Input type="date" value={createForm.fecha_regreso} onChange={e => setCreateForm(p => ({ ...p, fecha_regreso: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label>Cant. Personas</Label>
              <Input type="number" min="1" value={createForm.numero_personas} onChange={e => setCreateForm(p => ({ ...p, numero_personas: e.target.value }))} placeholder="Ej. 2" />
            </div>
            {isAdmin && (
            <div className="grid gap-1.5">
              <Label>Asignar A</Label>
              <Select value={createForm.asignado_a} onValueChange={(v) => setCreateForm(p => ({ ...p, asignado_a: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sin Asignar</SelectItem>
                  {perfiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>{getPerfilNombre(p.id)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            )}
            <div className="grid gap-1.5 md:col-span-2">
              <Label>Notas Iniciales</Label>
              <Textarea value={createForm.notas} onChange={e => setCreateForm(p => ({ ...p, notas: e.target.value }))} placeholder="Ej. Contactó por Facebook, quiere algo de lujo..." className="resize-none h-20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={creating} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {creating ? "Guardando..." : "Crear Registro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cotizaciones;
