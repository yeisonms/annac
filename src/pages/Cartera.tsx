import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, getSemaforoStatus } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ReciboDialog, type ReciboData } from "@/components/ReciboDialog";

interface VentaCartera {
  id: string;
  agente_id: string | null;
  destino: string;
  valor_total_venta: number;
  saldo_cliente: number;
  plazo_pago_cliente: string | null;
  estado_pago_cliente: string | null;
  clientes: { nombre_cliente: string; celular: string | null } | null;
}

interface PerfilOption {
  id: string;
  nombre_completo: string | null;
  email: string | null;
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

export default function Cartera() {
  const { isAdmin, user } = useAuth();
  const [ventas, setVentas] = useState<VentaCartera[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenta, setSelectedVenta] = useState<VentaCartera | null>(null);
  const [abonoForm, setAbonoForm] = useState({ monto: 0, metodo: "Transferencia", fecha: "" });
  const [saving, setSaving] = useState(false);
  const [recibo, setRecibo] = useState<ReciboData | null>(null);
  const [filtroAgente, setFiltroAgente] = useState<string>("todos");

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ventas")
      .select("id, agente_id, destino, valor_total_venta, saldo_cliente, plazo_pago_cliente, estado_pago_cliente, clientes(nombre_cliente, celular)")
      .or("estado_pago_cliente.eq.PENDIENTE,estado_pago_cliente.eq.PARCIAL,saldo_cliente.gt.0")
      .order("plazo_pago_cliente", { ascending: true });

    if (error) {
      toast.error("Error al cargar cartera: " + error.message);
    } else {
      setVentas((data as unknown as VentaCartera[]) || []);
    }
    setLoading(false);
  }, []);

  const fetchPerfiles = useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await supabase.from("perfiles").select("id, nombre_completo, email").order("nombre_completo");
    if (data) setPerfiles(data);
  }, [isAdmin]);

  useEffect(() => { fetchVentas(); fetchPerfiles(); }, [fetchVentas, fetchPerfiles]);

  const getPerfilNombre = (id: string | null) => {
    if (!id) return "Sin asignar";
    const p = perfiles.find((p) => p.id === id);
    if (!p) return `Asesor (${id.substring(0, 4)})`;
    const name = p.nombre_completo || p.email || "Asesor";
    return name.split(" ")[0];
  };

  const handleAbono = async () => {
    if (!selectedVenta || abonoForm.monto <= 0) { toast.error("Ingrese un monto válido"); return; }
    if (abonoForm.monto > selectedVenta.saldo_cliente) { toast.error("El abono no puede superar el saldo"); return; }

    setSaving(true);
    const nuevoSaldo = selectedVenta.saldo_cliente - abonoForm.monto;
    const nuevoEstado = nuevoSaldo === 0 ? "COMPLETO" : "PARCIAL";
    const fechaPago = abonoForm.fecha || new Date().toISOString().split("T")[0];

    // 1. INSERT pago
    const { error: errorPago } = await supabase.from("pagos_clientes").insert({
      venta_id: selectedVenta.id,
      monto_abonado: abonoForm.monto,
      fecha_pago: fechaPago,
      metodo_pago: abonoForm.metodo,
      agente_id: user?.id,
    });

    if (errorPago) {
      toast.error("Error al registrar pago: " + errorPago.message);
      setSaving(false);
      return;
    }

    // 2. UPDATE saldo en ventas
    const { error: errorUpdate } = await supabase
      .from("ventas")
      .update({ saldo_cliente: nuevoSaldo, estado_pago_cliente: nuevoEstado })
      .eq("id", selectedVenta.id);

    if (errorUpdate) {
      toast.error("Error al actualizar saldo: " + errorUpdate.message);
      setSaving(false);
      return;
    }

    // 3. Generar recibo digital
    setRecibo({
      nombreCliente: selectedVenta.clientes?.nombre_cliente ?? "Cliente",
      celular: selectedVenta.clientes?.celular ?? null,
      destino: selectedVenta.destino,
      valorAbono: abonoForm.monto,
      valorTotal: selectedVenta.valor_total_venta,
      saldoPendiente: nuevoSaldo,
      fechaPago,
      tipoAbono: "Abono realizado",
    });

    setSelectedVenta(null);
    setAbonoForm({ monto: 0, metodo: "Transferencia", fecha: "" });
    setSaving(false);
    fetchVentas();
  };

  const filteredVentas = isAdmin
    ? ventas.filter((v) => filtroAgente === "todos" || v.agente_id === filtroAgente)
    : ventas.filter((v) => v.agente_id === user?.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Control de Cartera — Cuentas por Cobrar</h1>

      {isAdmin && (
        <div className="flex items-center gap-2 bg-card/60 p-3 rounded-xl border border-border/50">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filtroAgente} onValueChange={setFiltroAgente}>
            <SelectTrigger className="w-[220px] bg-background">
              <SelectValue placeholder="Filtrar por agente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los Agentes</SelectItem>
              {perfiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>{getPerfilNombre(p.id)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Saldo Pendiente</TableHead>
                  <TableHead>Plazo de Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  {isAdmin && <TableHead>Agente</TableHead>}
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: isAdmin ? 8 : 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredVentas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-muted-foreground py-8">No hay cuentas pendientes</TableCell>
                  </TableRow>
                ) : (
                  filteredVentas
                    .map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.clientes?.nombre_cliente ?? "Sin cliente"}</TableCell>
                      <TableCell>{v.destino}</TableCell>
                      <TableCell className="text-right">{formatCurrency(v.valor_total_venta)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(v.saldo_cliente)}</TableCell>
                      <TableCell>{v.plazo_pago_cliente ? semaforoBadge(v.plazo_pago_cliente) : "—"}</TableCell>
                      <TableCell><Badge variant="secondary">{v.estado_pago_cliente ?? "Pendiente"}</Badge></TableCell>
                      {isAdmin && <TableCell className="text-sm text-muted-foreground">{getPerfilNombre(v.agente_id)}</TableCell>}
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedVenta(v); setAbonoForm({ monto: 0, metodo: "Transferencia", fecha: "" }); }}>
                          <Wallet className="h-4 w-4 mr-1" /> Registrar Abono
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

      {/* Modal Registrar Abono */}
      <Dialog open={!!selectedVenta} onOpenChange={(open) => !open && setSelectedVenta(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Abono</DialogTitle></DialogHeader>
          {selectedVenta && (
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">Cliente: <strong>{selectedVenta.clientes?.nombre_cliente}</strong></p>
              <p className="text-sm text-muted-foreground">Saldo actual: <strong>{formatCurrency(selectedVenta.saldo_cliente)}</strong></p>
              <div className="grid gap-1.5"><Label>Monto del Abono</Label><Input type="number" value={abonoForm.monto || ""} onChange={(e) => setAbonoForm((p) => ({ ...p, monto: Number(e.target.value) }))} /></div>
              <div className="grid gap-1.5"><Label>Fecha de Pago</Label><Input type="date" value={abonoForm.fecha} onChange={(e) => setAbonoForm((p) => ({ ...p, fecha: e.target.value }))} /></div>
              <div className="grid gap-1.5">
                <Label>Método de Pago</Label>
                <Select value={abonoForm.metodo} onValueChange={(v) => setAbonoForm((p) => ({ ...p, metodo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {abonoForm.monto > 0 && (
                <p className="text-sm font-medium">Nuevo saldo: <span className="text-primary">{formatCurrency(selectedVenta.saldo_cliente - abonoForm.monto)}</span></p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleAbono} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Confirmar Abono
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Recibo Digital (componente reutilizable) */}
      <ReciboDialog recibo={recibo} onClose={() => setRecibo(null)} />
    </div>
  );
}
