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
import { Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VentaCartera {
  id: string;
  destino: string;
  valor_total_venta: number;
  saldo_cliente: number;
  plazo_pago_cliente: string | null;
  estado_pago_cliente: string | null;
  clientes: { nombre_cliente: string } | null;
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
  const [ventas, setVentas] = useState<VentaCartera[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenta, setSelectedVenta] = useState<VentaCartera | null>(null);
  const [abonoForm, setAbonoForm] = useState({ monto: 0, metodo: "Transferencia", fecha: "" });
  const [saving, setSaving] = useState(false);

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ventas")
      .select("id, destino, valor_total_venta, saldo_cliente, plazo_pago_cliente, estado_pago_cliente, clientes(nombre_cliente)")
      .or("estado_pago_cliente.eq.PENDIENTE,estado_pago_cliente.eq.PARCIAL,saldo_cliente.gt.0")
      .order("plazo_pago_cliente", { ascending: true });

    if (error) {
      toast.error("Error al cargar cartera: " + error.message);
    } else {
      setVentas((data as unknown as VentaCartera[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchVentas(); }, [fetchVentas]);

  const handleAbono = async () => {
    if (!selectedVenta || abonoForm.monto <= 0) { toast.error("Ingrese un monto válido"); return; }
    if (abonoForm.monto > selectedVenta.saldo_cliente) { toast.error("El abono no puede superar el saldo"); return; }

    setSaving(true);
    const nuevoSaldo = selectedVenta.saldo_cliente - abonoForm.monto;
    const nuevoEstado = nuevoSaldo === 0 ? "COMPLETO" : "PARCIAL";

    // 1. INSERT pago
    const { error: errorPago } = await supabase.from("pagos_clientes").insert({
      venta_id: selectedVenta.id,
      monto_abonado: abonoForm.monto,
      fecha_pago: abonoForm.fecha || new Date().toISOString().split("T")[0],
      metodo_pago: abonoForm.metodo,
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
    } else {
      toast.success(`Abono de ${formatCurrency(abonoForm.monto)} registrado. Nuevo saldo: ${formatCurrency(nuevoSaldo)}`);
    }

    setSelectedVenta(null);
    setAbonoForm({ monto: 0, metodo: "Transferencia", fecha: "" });
    setSaving(false);
    fetchVentas();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Control de Cartera — Cuentas por Cobrar</h1>
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
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : ventas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No hay cuentas pendientes</TableCell>
                  </TableRow>
                ) : (
                  ventas.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.clientes?.nombre_cliente ?? "Sin cliente"}</TableCell>
                      <TableCell>{v.destino}</TableCell>
                      <TableCell className="text-right">{formatCurrency(v.valor_total_venta)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(v.saldo_cliente)}</TableCell>
                      <TableCell>{v.plazo_pago_cliente ? semaforoBadge(v.plazo_pago_cliente) : "—"}</TableCell>
                      <TableCell><Badge variant="secondary">{v.estado_pago_cliente ?? "Pendiente"}</Badge></TableCell>
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
    </div>
  );
}
