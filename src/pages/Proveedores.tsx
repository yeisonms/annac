import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, getSemaforoStatus } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Plus, Trash2, CheckCircle, Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Types ---
interface ProveedorRow {
  id: string;
  agente_id: string | null;
  nombre: string;
  tipo_servicio: string | null;
}

interface CuentaPorPagarRow {
  id: string;
  agente_id: string | null;
  venta_id: string;
  proveedor_id: string;
  monto_deuda: number;
  plazo_pago_proveedor: string | null;
  estado_pago: string | null;
  proveedores: { nombre: string } | null;
  ventas: { destino: string; clientes: { nombre_cliente: string } | null } | null;
}

const semaforoBadge = (fecha: string) => {
  const status = getSemaforoStatus(fecha);
  const variants: Record<string, string> = {
    verde: "bg-success text-success-foreground",
    amarillo: "bg-warning text-warning-foreground",
    rojo: "bg-danger text-danger-foreground",
  };
  return <Badge className={variants[status]}>{fecha}</Badge>;
};

interface PerfilOption {
  id: string;
  nombre_completo: string | null;
  email: string | null;
}

export default function ProveedoresPage() {
  const { isAdmin, user } = useAuth();
  const [perfiles, setPerfiles] = useState<PerfilOption[]>([]);

  const fetchPerfiles = useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await supabase.from("perfiles").select("id, nombre_completo, email").order("nombre_completo");
    if (data) setPerfiles(data);
  }, [isAdmin]);

  const getPerfilNombre = (id: string | null) => {
    if (!id) return "Sin asignar";
    const p = perfiles.find((p) => p.id === id);
    if (!p) return `Asesor (${id.substring(0, 4)})`;
    const name = p.nombre_completo || p.email || "Asesor";
    return name.split(" ")[0];
  };

  // --- Proveedores CRUD ---
  const [proveedores, setProveedores] = useState<ProveedorRow[]>([]);
  const [loadingProv, setLoadingProv] = useState(true);
  const [openProv, setOpenProv] = useState(false);
  const [savingProv, setSavingProv] = useState(false);
  const [provForm, setProvForm] = useState({ nombre: "", tipo_servicio: "" });

  const fetchProveedores = useCallback(async () => {
    setLoadingProv(true);
    const { data, error } = await supabase
      .from("proveedores")
      .select("id, agente_id, nombre, tipo_servicio")
      .order("nombre");
    if (error) toast.error("Error cargando proveedores: " + error.message);
    else setProveedores(data || []);
    setLoadingProv(false);
  }, []);

  const handleSaveProv = async () => {
    if (!provForm.nombre) { toast.error("Nombre es obligatorio"); return; }
    setSavingProv(true);
    const { error } = await supabase.from("proveedores").insert({
      nombre: provForm.nombre,
      tipo_servicio: provForm.tipo_servicio || null,
      agente_id: user?.id,
    });
    if (error) toast.error("Error: " + error.message);
    else { toast.success("Proveedor creado"); setProvForm({ nombre: "", tipo_servicio: "" }); setOpenProv(false); fetchProveedores(); }
    setSavingProv(false);
  };

  const handleDeleteProv = async (id: string) => {
    const { error } = await supabase.from("proveedores").delete().eq("id", id);
    if (error) toast.error("Error: " + error.message);
    else { toast.success("Proveedor eliminado"); fetchProveedores(); }
  };

  // --- Cuentas por Pagar ---
  const [cuentas, setCuentas] = useState<CuentaPorPagarRow[]>([]);
  const [loadingCuentas, setLoadingCuentas] = useState(true);

  // --- Nueva Cuenta por Pagar form ---
  const [openCuenta, setOpenCuenta] = useState(false);
  const [savingCuenta, setSavingCuenta] = useState(false);
  const [ventasOptions, setVentasOptions] = useState<{ id: string; label: string }[]>([]);
  const [cuentaForm, setCuentaForm] = useState({
    venta_id: "",
    proveedor_id: "",
    monto_deuda: "",
    plazo_pago_proveedor: undefined as Date | undefined,
  });

  const fetchCuentas = useCallback(async () => {
    setLoadingCuentas(true);
    const { data, error } = await supabase
      .from("cuentas_por_pagar")
      .select("id, agente_id, venta_id, proveedor_id, monto_deuda, plazo_pago_proveedor, estado_pago, proveedores(nombre), ventas(destino, clientes(nombre_cliente))")
      .order("plazo_pago_proveedor", { ascending: true });
    if (error) toast.error("Error cargando cuentas: " + error.message);
    else setCuentas((data as unknown as CuentaPorPagarRow[]) || []);
    setLoadingCuentas(false);
  }, []);

  const fetchVentasOptions = useCallback(async () => {
    const { data } = await supabase
      .from("ventas")
      .select("id, agente_id, destino, clientes(nombre_cliente)")
      .order("fecha_venta", { ascending: false });

    const filteredData = isAdmin 
      ? (data || [])
      : (data || []).filter((v: any) => v.agente_id === user?.id);

    setVentasOptions(
      filteredData.map((v: any) => ({
        id: v.id,
        label: `${v.clientes?.nombre_cliente || "Sin cliente"} — ${v.destino}`,
      }))
    );
  }, [isAdmin, user?.id]);

  useEffect(() => { fetchProveedores(); fetchCuentas(); fetchVentasOptions(); fetchPerfiles(); }, [fetchProveedores, fetchCuentas, fetchVentasOptions, fetchPerfiles]);

  const handleSaveCuenta = async () => {
    if (!cuentaForm.venta_id || !cuentaForm.proveedor_id || !cuentaForm.monto_deuda) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }
    setSavingCuenta(true);
    const { error } = await supabase.from("cuentas_por_pagar").insert({
      venta_id: cuentaForm.venta_id,
      proveedor_id: cuentaForm.proveedor_id,
      monto_deuda: parseFloat(cuentaForm.monto_deuda),
      plazo_pago_proveedor: cuentaForm.plazo_pago_proveedor
        ? format(cuentaForm.plazo_pago_proveedor, "yyyy-MM-dd")
        : null,
      estado_pago: "PENDIENTE",
      agente_id: user?.id,
    });
    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      toast.success("Cuenta por pagar registrada");
      setCuentaForm({ venta_id: "", proveedor_id: "", monto_deuda: "", plazo_pago_proveedor: undefined });
      setOpenCuenta(false);
      fetchCuentas();
    }
    setSavingCuenta(false);
  };

  const handleMarcarPagado = async (id: string) => {
    const { error } = await supabase
      .from("cuentas_por_pagar")
      .update({ estado_pago: "PAGADO" })
      .eq("id", id);
    if (error) toast.error("Error: " + error.message);
    else { toast.success("Cuenta marcada como pagada"); fetchCuentas(); }
  };

  const filteredCuentas = isAdmin
    ? cuentas
    : cuentas.filter((c) => c.agente_id === user?.id);

  const pendientes = filteredCuentas.filter((c) => c.estado_pago !== "PAGADO" && c.estado_pago !== "Pagado");

  const filteredProveedores = isAdmin
    ? proveedores
    : proveedores.filter((p) => p.agente_id === user?.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Proveedores y Cuentas por Pagar</h1>

      <Tabs defaultValue="cuentas" className="w-full">
        <TabsList>
          <TabsTrigger value="cuentas">Cuentas por Pagar</TabsTrigger>
          <TabsTrigger value="proveedores">Directorio de Proveedores</TabsTrigger>
        </TabsList>

        {/* ===== CUENTAS POR PAGAR ===== */}
        <TabsContent value="cuentas">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Cuentas por Pagar Pendientes</CardTitle>
              <Dialog open={openCuenta} onOpenChange={setOpenCuenta}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nueva Cuenta por Pagar</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nueva Cuenta por Pagar</DialogTitle></DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="grid gap-1.5">
                      <Label>Venta (Reserva) *</Label>
                      <Select value={cuentaForm.venta_id} onValueChange={(v) => setCuentaForm((p) => ({ ...p, venta_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecciona una venta" /></SelectTrigger>
                        <SelectContent>
                          {ventasOptions.map((v) => (
                            <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Proveedor *</Label>
                      <Select value={cuentaForm.proveedor_id} onValueChange={(v) => setCuentaForm((p) => ({ ...p, proveedor_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecciona un proveedor" /></SelectTrigger>
                        <SelectContent>
                          {proveedores.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Monto de la Deuda *</Label>
                      <Input type="number" placeholder="0" value={cuentaForm.monto_deuda} onChange={(e) => setCuentaForm((p) => ({ ...p, monto_deuda: e.target.value }))} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Plazo Máximo de Pago</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !cuentaForm.plazo_pago_proveedor && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {cuentaForm.plazo_pago_proveedor ? format(cuentaForm.plazo_pago_proveedor, "yyyy-MM-dd") : "Selecciona fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={cuentaForm.plazo_pago_proveedor} onSelect={(d) => setCuentaForm((p) => ({ ...p, plazo_pago_proveedor: d }))} initialFocus className={cn("p-3 pointer-events-auto")} />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveCuenta} disabled={savingCuenta}>
                      {savingCuenta && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                      Guardar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Destino (Venta)</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Monto Deuda</TableHead>
                      <TableHead>Plazo de Pago</TableHead>
                      <TableHead>Estado</TableHead>
                      {isAdmin && <TableHead>Agente</TableHead>}
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingCuentas ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: isAdmin ? 8 : 7 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : pendientes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8 text-muted-foreground">
                          No hay cuentas por pagar pendientes
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendientes.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.proveedores?.nombre ?? "—"}</TableCell>
                          <TableCell>{c.ventas?.destino ?? "—"}</TableCell>
                          <TableCell>{c.ventas?.clientes?.nombre_cliente ?? "—"}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(c.monto_deuda)}</TableCell>
                          <TableCell>{c.plazo_pago_proveedor ? semaforoBadge(c.plazo_pago_proveedor) : "—"}</TableCell>
                          <TableCell><Badge variant="secondary">{c.estado_pago ?? "Pendiente"}</Badge></TableCell>
                          {isAdmin && <TableCell className="text-sm text-muted-foreground">{getPerfilNombre(c.agente_id)}</TableCell>}
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => handleMarcarPagado(c.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Marcar Pagado
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== DIRECTORIO PROVEEDORES ===== */}
        <TabsContent value="proveedores">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Proveedores</CardTitle>
              <Dialog open={openProv} onOpenChange={setOpenProv}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo Proveedor</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Nuevo Proveedor</DialogTitle></DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="grid gap-1.5"><Label>Nombre *</Label><Input value={provForm.nombre} onChange={(e) => setProvForm((p) => ({ ...p, nombre: e.target.value }))} /></div>
                    <div className="grid gap-1.5"><Label>Tipo de Servicio</Label><Input placeholder="Ej: Aerolínea, Hotelería" value={provForm.tipo_servicio} onChange={(e) => setProvForm((p) => ({ ...p, tipo_servicio: e.target.value }))} /></div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveProv} disabled={savingProv}>
                      {savingProv && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                      Guardar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Servicio</TableHead>
                      {isAdmin && <TableHead>Creado por</TableHead>}
                      {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingProv ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                          {isAdmin && <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>}
                          {isAdmin && <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>}
                        </TableRow>
                      ))
                    ) : filteredProveedores.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 4 : 2} className="text-center py-8 text-muted-foreground">
                          No hay proveedores registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProveedores.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.nombre}</TableCell>
                          <TableCell>{p.tipo_servicio ?? "—"}</TableCell>
                          {isAdmin && <TableCell className="text-sm text-muted-foreground">{getPerfilNombre(p.agente_id)}</TableCell>}
                          {isAdmin && (
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteProv(p.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
