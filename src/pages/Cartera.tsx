import { useState } from "react";
import { ventas as initialVentas, Venta, getClienteName, formatCurrency, getSemaforoStatus, PagoCliente, pagosClientes } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";
import { toast } from "sonner";

const semaforoBadge = (status: "verde" | "amarillo" | "rojo", fecha: string) => {
  const variants: Record<string, string> = {
    verde: "bg-success text-success-foreground",
    amarillo: "bg-warning text-warning-foreground",
    rojo: "bg-danger text-danger-foreground",
  };
  return <Badge className={variants[status]}>{fecha}</Badge>;
};

export default function Cartera() {
  const { isAdmin } = useAuth();
  const [ventasList, setVentasList] = useState<Venta[]>(initialVentas);
  const [pagos, setPagos] = useState<PagoCliente[]>(pagosClientes);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [abonoForm, setAbonoForm] = useState({ monto: 0, metodo: "Transferencia", fecha: "" });

  const pendientes = ventasList.filter((v) => v.saldo_cliente > 0);

  const handleAbono = () => {
    if (!selectedVenta || abonoForm.monto <= 0) { toast.error("Ingrese un monto válido"); return; }
    if (abonoForm.monto > selectedVenta.saldo_cliente) { toast.error("El abono no puede superar el saldo"); return; }
    const nuevoSaldo = selectedVenta.saldo_cliente - abonoForm.monto;
    setVentasList((prev) =>
      prev.map((v) => v.id === selectedVenta.id ? { ...v, saldo_cliente: nuevoSaldo, estado_pago_cliente: nuevoSaldo === 0 ? "Pagado" : "Parcial" } : v)
    );
    setPagos((prev) => [...prev, { id: `pc${Date.now()}`, venta_id: selectedVenta.id, monto_abonado: abonoForm.monto, fecha_pago: abonoForm.fecha || new Date().toISOString().slice(0, 10), metodo_pago: abonoForm.metodo }]);
    toast.success(`Abono de ${formatCurrency(abonoForm.monto)} registrado. Nuevo saldo: ${formatCurrency(nuevoSaldo)}`);
    setSelectedVenta(null);
    setAbonoForm({ monto: 0, metodo: "Transferencia", fecha: "" });
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
                {pendientes.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{getClienteName(v.cliente_id)}</TableCell>
                    <TableCell>{v.destino}</TableCell>
                    <TableCell className="text-right">{formatCurrency(v.valor_total_venta)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(v.saldo_cliente)}</TableCell>
                    <TableCell>{semaforoBadge(getSemaforoStatus(v.plazo_pago_cliente), v.plazo_pago_cliente)}</TableCell>
                    <TableCell><Badge variant="secondary">{v.estado_pago_cliente}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedVenta(v); setAbonoForm({ monto: 0, metodo: "Transferencia", fecha: "" }); }}>
                        <Wallet className="h-4 w-4 mr-1" /> Registrar Abono
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pendientes.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No hay cuentas pendientes</TableCell></TableRow>
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
              <p className="text-sm text-muted-foreground">Cliente: <strong>{getClienteName(selectedVenta.cliente_id)}</strong></p>
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
          <DialogFooter><Button onClick={handleAbono}>Confirmar Abono</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
