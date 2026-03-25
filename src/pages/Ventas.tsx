import { useState } from "react";
import { ventas as initialVentas, Venta, clientes, getClienteName, formatCurrency } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  cliente_id: "", destino: "", fecha_venta: "", fecha_inicio_viaje: "", fecha_fin_viaje: "",
  codigo_reserva_aerea: "", codigo_reserva_hotel: "", receptivos_programa: "",
  valor_total_venta: 0, costo_por_proveedor: 0, plazo_pago_cliente: "",
};

export default function Ventas() {
  const { isAdmin } = useAuth();
  const [ventasList, setVentasList] = useState<Venta[]>(initialVentas);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const ingreso = form.valor_total_venta - form.costo_por_proveedor;

  const handleSave = () => {
    if (!form.cliente_id || !form.destino) { toast.error("Cliente y destino son obligatorios"); return; }
    const newVenta: Venta = {
      ...form, id: `v${Date.now()}`, ingreso_agencia: ingreso,
      saldo_cliente: form.valor_total_venta, estado_pago_cliente: "Pendiente",
    };
    setVentasList((prev) => [...prev, newVenta]);
    setForm(emptyForm);
    setOpen(false);
    toast.success("Venta registrada");
  };

  const handleDelete = (id: string) => {
    setVentasList((prev) => prev.filter((v) => v.id !== id));
    toast.success("Venta eliminada");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Reservas / Ventas</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Nueva Venta</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nueva Venta</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-2 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Cliente</Label>
                <Select value={form.cliente_id} onValueChange={(v) => setForm((p) => ({ ...p, cliente_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                  <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre_cliente}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Destino</Label><Input value={form.destino} onChange={(e) => setForm((p) => ({ ...p, destino: e.target.value }))} /></div>
              <div className="grid gap-1.5"><Label>Fecha de Venta</Label><Input type="date" value={form.fecha_venta} onChange={(e) => setForm((p) => ({ ...p, fecha_venta: e.target.value }))} /></div>
              <div className="grid gap-1.5"><Label>Inicio Viaje</Label><Input type="date" value={form.fecha_inicio_viaje} onChange={(e) => setForm((p) => ({ ...p, fecha_inicio_viaje: e.target.value }))} /></div>
              <div className="grid gap-1.5"><Label>Fin Viaje</Label><Input type="date" value={form.fecha_fin_viaje} onChange={(e) => setForm((p) => ({ ...p, fecha_fin_viaje: e.target.value }))} /></div>
              <div className="grid gap-1.5"><Label>Código Reserva Aérea</Label><Input value={form.codigo_reserva_aerea} onChange={(e) => setForm((p) => ({ ...p, codigo_reserva_aerea: e.target.value }))} /></div>
              <div className="grid gap-1.5"><Label>Código Reserva Hotel</Label><Input value={form.codigo_reserva_hotel} onChange={(e) => setForm((p) => ({ ...p, codigo_reserva_hotel: e.target.value }))} /></div>
              <div className="grid gap-1.5"><Label>Receptivos / Programa</Label><Input value={form.receptivos_programa} onChange={(e) => setForm((p) => ({ ...p, receptivos_programa: e.target.value }))} /></div>
              <div className="grid gap-1.5"><Label>Valor Total Venta</Label><Input type="number" value={form.valor_total_venta || ""} onChange={(e) => setForm((p) => ({ ...p, valor_total_venta: Number(e.target.value) }))} /></div>
              {isAdmin && (
                <>
                  <div className="grid gap-1.5"><Label>Costo Proveedor</Label><Input type="number" value={form.costo_por_proveedor || ""} onChange={(e) => setForm((p) => ({ ...p, costo_por_proveedor: Number(e.target.value) }))} /></div>
                  <div className="grid gap-1.5"><Label>Ingreso Agencia (auto)</Label><Input value={formatCurrency(ingreso >= 0 ? ingreso : 0)} readOnly className="bg-muted" /></div>
                </>
              )}
              <div className="grid gap-1.5"><Label>Plazo de Pago</Label><Input type="date" value={form.plazo_pago_cliente} onChange={(e) => setForm((p) => ({ ...p, plazo_pago_cliente: e.target.value }))} /></div>
            </div>
            <DialogFooter><Button onClick={handleSave}>Guardar Venta</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Fecha Venta</TableHead>
                  <TableHead>Reserva Aérea</TableHead>
                  <TableHead>Reserva Hotel</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  {isAdmin && <TableHead className="text-right">Costo Prov.</TableHead>}
                  {isAdmin && <TableHead className="text-right">Ingreso Agencia</TableHead>}
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Estado</TableHead>
                  {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventasList.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{getClienteName(v.cliente_id)}</TableCell>
                    <TableCell>{v.destino}</TableCell>
                    <TableCell>{v.fecha_venta}</TableCell>
                    <TableCell>{v.codigo_reserva_aerea}</TableCell>
                    <TableCell>{v.codigo_reserva_hotel}</TableCell>
                    <TableCell className="text-right">{formatCurrency(v.valor_total_venta)}</TableCell>
                    {isAdmin && <TableCell className="text-right">{formatCurrency(v.costo_por_proveedor)}</TableCell>}
                    {isAdmin && <TableCell className="text-right font-semibold text-success">{formatCurrency(v.ingreso_agencia)}</TableCell>}
                    <TableCell className="text-right">{formatCurrency(v.saldo_cliente)}</TableCell>
                    <TableCell>
                      <Badge variant={v.estado_pago_cliente === "Pagado" ? "default" : v.estado_pago_cliente === "Parcial" ? "secondary" : "destructive"}>
                        {v.estado_pago_cliente}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
