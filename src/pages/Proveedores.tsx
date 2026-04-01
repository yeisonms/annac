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
import { Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Types ---
interface ProveedorRow {
  id: string;
  nombre: string;
  tipo_servicio: string | null;
}

interface CuentaPorPagarRow {
  id: string;
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

export default function ProveedoresPage() {
  const { isAdmin } = useAuth();

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
      .select("id, nombre, tipo_servicio")
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

  const fetchCuentas = useCallback(async () => {
    setLoadingCuentas(true);
    const { data, error } = await supabase
      .from("cuentas_por_pagar")
      .select("id, venta_id, proveedor_id, monto_deuda, plazo_pago_proveedor, estado_pago, proveedores(nombre), ventas(destino, clientes(nombre_cliente))")
      .order("plazo_pago_proveedor", { ascending: true });
    if (error) toast.error("Error cargando cuentas: " + error.message);
    else setCuentas((data as unknown as CuentaPorPagarRow[]) || []);
    setLoadingCuentas(false);
  }, []);

  useEffect(() => { fetchProveedores(); fetchCuentas(); }, [fetchProveedores, fetchCuentas]);

  const handleMarcarPagado = async (id: string) => {
    const { error } = await supabase
      .from("cuentas_por_pagar")
      .update({ estado_pago: "PAGADO" })
      .eq("id", id);
    if (error) toast.error("Error: " + error.message);
    else { toast.success("Cuenta marcada como pagada"); fetchCuentas(); }
  };

  const pendientes = cuentas.filter((c) => c.estado_pago !== "PAGADO" && c.estado_pago !== "Pagado");

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
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingCuentas ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : pendientes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No hay cuentas pendientes</TableCell>
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
                      <TableHead>Tipo de Servicio</TableHead>
                      {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingProv ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                          {isAdmin && <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>}
                        </TableRow>
                      ))
                    ) : proveedores.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 3 : 2} className="text-center text-muted-foreground py-8">No hay proveedores registrados</TableCell>
                      </TableRow>
                    ) : (
                      proveedores.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.nombre}</TableCell>
                          <TableCell>{p.tipo_servicio ?? "—"}</TableCell>
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
