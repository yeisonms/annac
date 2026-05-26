import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Loader2, Eye, Pencil, Filter } from "lucide-react";
import { toast } from "sonner";
import VentaDetailSheet from "@/components/VentaDetailSheet";
import { ReciboDialog, type ReciboData } from "@/components/ReciboDialog";

interface ClienteOption {
  id: string;
  nombre_cliente: string;
  celular: string | null;
}

interface PerfilOption {
  id: string;
  nombre_completo: string | null;
  email: string | null;
}

interface VentaRow {
  id: string;
  cliente_id: string;
  agente_id: string | null;
  destino: string;
  fecha_venta: string | null;
  fecha_inicio_viaje: string | null;
  fecha_fin_viaje: string | null;
  codigo_reserva_aerea: string | null;
  codigo_reserva_hotel: string | null;
  receptivos_programa: string | null;
  valor_total_venta: number;
  costo_por_proveedor: number;
  ingreso_agencia: number;
  saldo_cliente: number;
  estado_pago_cliente: string | null;
  plazo_pago_cliente: string | null;
  clientes: { nombre_cliente: string } | null;
}

const emptyForm = {
  cliente_id: "",
  destino: "",
  fecha_venta: new Date().toISOString().split("T")[0],
  fecha_inicio_viaje: "",
  fecha_fin_viaje: "",
  codigo_reserva_aerea: "",
  codigo_reserva_hotel: "",
  receptivos_programa: "",
  valor_total_venta: 0,
  anticipo: 0,
  metodo_pago_anticipo: "Transferencia",
  costo_por_proveedor: 0,
  plazo_pago_cliente: "",
  agente_id: "",
};

export default function Ventas() {
  const { isAdmin, user } = useAuth();
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingVentaId, setEditingVentaId] = useState<string | null>(null);
  const [detailVenta, setDetailVenta] = useState<VentaRow | null>(null);
  const [recibo, setRecibo] = useState<ReciboData | null>(null);
  const [filtroAgente, setFiltroAgente] = useState<string>("todos");

  const isEditing = !!editingVentaId;

  const openCreateDialog = () => {
    setEditingVentaId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEditDialog = (v: VentaRow) => {
    setEditingVentaId(v.id);
    setForm({
      cliente_id: v.cliente_id,
      destino: v.destino,
      fecha_venta: v.fecha_venta ?? "",
      fecha_inicio_viaje: v.fecha_inicio_viaje ?? "",
      fecha_fin_viaje: v.fecha_fin_viaje ?? "",
      codigo_reserva_aerea: v.codigo_reserva_aerea ?? "",
      codigo_reserva_hotel: v.codigo_reserva_hotel ?? "",
      receptivos_programa: v.receptivos_programa ?? "",
      valor_total_venta: v.valor_total_venta,
      anticipo: 0,
      metodo_pago_anticipo: "Transferencia",
      costo_por_proveedor: v.costo_por_proveedor,
      plazo_pago_cliente: v.plazo_pago_cliente ?? "",
    });
    setOpen(true);
  };

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingVentaId(null);
      setForm(emptyForm);
    }
  };

  const ingreso = form.valor_total_venta - form.costo_por_proveedor;

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ventas")
      .select("id, cliente_id, agente_id, destino, fecha_venta, fecha_inicio_viaje, fecha_fin_viaje, codigo_reserva_aerea, codigo_reserva_hotel, receptivos_programa, valor_total_venta, costo_por_proveedor, ingreso_agencia, saldo_cliente, estado_pago_cliente, plazo_pago_cliente, clientes(nombre_cliente)")
      .order("fecha_venta", { ascending: false });

    if (error) {
      toast.error("Error al cargar ventas: " + error.message);
    } else {
      setVentas((data as unknown as VentaRow[]) || []);
    }
    setLoading(false);
  }, []);

  const fetchClientes = useCallback(async () => {
    const { data } = await supabase
      .from("clientes")
      .select("id, nombre_cliente, celular")
      .order("nombre_cliente");
    if (data) setClientes(data);
  }, []);

  const fetchPerfiles = useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await supabase
      .from("perfiles")
      .select("id, nombre_completo, email")
      .order("nombre_completo");
    if (data) setPerfiles(data);
  }, [isAdmin]);

  useEffect(() => {
    fetchVentas();
    fetchClientes();
    fetchPerfiles();
  }, [fetchVentas, fetchClientes, fetchPerfiles]);

  const getPerfilNombre = (id: string | null) => {
    if (!id) return "Sin asignar";
    const p = perfiles.find((p) => p.id === id);
    if (!p) return `Asesor (${id.substring(0, 4)})`;
    const name = p.nombre_completo || p.email || "Asesor";
    return name.split(" ")[0]; // Devuelve solo el primer nombre
  };

  const handleSave = async () => {
    if (!form.cliente_id || !form.destino) {
      toast.error("Cliente y destino son obligatorios");
      return;
    }
    setSaving(true);

    const agenteIdFinal = isAdmin && form.agente_id ? form.agente_id : user?.id;

    const payloadVenta = {
      cliente_id: form.cliente_id,
      destino: form.destino,
      fecha_venta: form.fecha_venta || null,
      fecha_inicio_viaje: form.fecha_inicio_viaje || null,
      fecha_fin_viaje: form.fecha_fin_viaje || null,
      codigo_reserva_aerea: form.codigo_reserva_aerea || null,
      codigo_reserva_hotel: form.codigo_reserva_hotel || null,
      receptivos_programa: form.receptivos_programa || null,
      valor_total_venta: form.valor_total_venta,
      costo_por_proveedor: form.costo_por_proveedor,
      plazo_pago_cliente: form.plazo_pago_cliente || null,
      agente_id: agenteIdFinal,
    };

    if (isEditing) {
      // --- Modo Edición: UPDATE ---
      const { error } = await supabase
        .from("ventas")
        .update(payloadVenta)
        .eq("id", editingVentaId);

      if (error) {
        toast.error("Error al actualizar la reserva: " + error.message);
        setSaving(false);
        return;
      }

      toast.success("Reserva actualizada correctamente");
    } else {
      // --- Modo Creación: INSERT ---
      const saldoCalculado = form.valor_total_venta - form.anticipo;
      const estadoPago = saldoCalculado <= 0 ? "COMPLETO" : "PENDIENTE";

      const { data: nuevaVenta, error: errorVenta } = await supabase
        .from("ventas")
        .insert({
          ...payloadVenta,
          saldo_cliente: saldoCalculado,
          estado_pago_cliente: estadoPago,
        })
        .select("id")
        .single();

      if (errorVenta) {
        toast.error("Error al crear la venta: " + errorVenta.message);
        setSaving(false);
        return;
      }

      // Registrar el Anticipo en Cartera
      if (form.anticipo > 0) {
        const { error: errorPago } = await supabase
          .from("pagos_clientes")
          .insert({
            venta_id: nuevaVenta.id,
            monto_abonado: form.anticipo,
            metodo_pago: form.metodo_pago_anticipo,
            fecha_pago: new Date().toISOString().split("T")[0],
            agente_id: agenteIdFinal,
          });

        if (errorPago) {
          toast.error("Venta creada, pero error al registrar el anticipo: " + errorPago.message);
          setSaving(false);
          return;
        }

        // Generar recibo digital del abono inicial
        const clienteSeleccionado = clientes.find((c) => c.id === form.cliente_id);
        setRecibo({
          nombreCliente: clienteSeleccionado?.nombre_cliente ?? "Cliente",
          celular: clienteSeleccionado?.celular ?? null,
          destino: form.destino,
          valorAbono: form.anticipo,
          valorTotal: form.valor_total_venta,
          saldoPendiente: saldoCalculado,
          fechaPago: new Date().toISOString().split("T")[0],
          tipoAbono: "Abono Inicial",
        });
      } else {
        toast.success("Venta registrada exitosamente");
      }
    }

    setForm(emptyForm);
    setEditingVentaId(null);
    setOpen(false);
    fetchVentas();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("ventas").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar: " + error.message);
    } else {
      toast.success("Venta eliminada");
      fetchVentas();
    }
  };

  const getClienteName = (v: VentaRow) =>
    v.clientes?.nombre_cliente ?? "Sin cliente";

  const filteredVentas = isAdmin
    ? ventas.filter((v) => filtroAgente === "todos" || v.agente_id === filtroAgente)
    : ventas.filter((v) => v.agente_id === user?.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Reservas / Ventas</h1>
        <Dialog open={open} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}><Plus className="h-4 w-4 mr-1" /> Nueva Reserva</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{isEditing ? "Editar Reserva" : "Nueva Reserva"}</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-2 sm:grid-cols-2">
              {/* Cliente selector */}
              <div className="grid gap-1.5">
                <Label>Cliente *</Label>
                <Select value={form.cliente_id} onValueChange={(v) => setForm((p) => ({ ...p, cliente_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre_cliente}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Destino *</Label>
                <Input value={form.destino} onChange={(e) => setForm((p) => ({ ...p, destino: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Fecha de Venta</Label>
                <Input type="date" value={form.fecha_venta} onChange={(e) => setForm((p) => ({ ...p, fecha_venta: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Inicio Viaje</Label>
                <Input type="date" value={form.fecha_inicio_viaje} onChange={(e) => setForm((p) => ({ ...p, fecha_inicio_viaje: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Fin Viaje</Label>
                <Input type="date" value={form.fecha_fin_viaje} onChange={(e) => setForm((p) => ({ ...p, fecha_fin_viaje: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Código Reserva Aérea</Label>
                <Input value={form.codigo_reserva_aerea} onChange={(e) => setForm((p) => ({ ...p, codigo_reserva_aerea: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Código Reserva Hotel</Label>
                <Input value={form.codigo_reserva_hotel} onChange={(e) => setForm((p) => ({ ...p, codigo_reserva_hotel: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Receptivos / Programa</Label>
                <Input value={form.receptivos_programa} onChange={(e) => setForm((p) => ({ ...p, receptivos_programa: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Valor Total Venta</Label>
                <Input type="number" value={form.valor_total_venta || ""} onChange={(e) => setForm((p) => ({ ...p, valor_total_venta: Number(e.target.value) }))} />
              </div>
              {!isEditing && (
                <>
                  <div className="grid gap-1.5">
                    <Label>Anticipo (Primer Abono) *</Label>
                    <Input type="number" value={form.anticipo || ""} onChange={(e) => setForm((p) => ({ ...p, anticipo: Number(e.target.value) }))} min={0} required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Método de Pago del Anticipo</Label>
                    <Select value={form.metodo_pago_anticipo} onValueChange={(v) => setForm((p) => ({ ...p, metodo_pago_anticipo: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                        <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Saldo (Calculado)</Label>
                    <Input value={formatCurrency(Math.max(0, form.valor_total_venta - form.anticipo))} readOnly className="bg-muted font-semibold text-danger" />
                  </div>
                </>
              )}
              {isAdmin && (
                <>
                  <div className="grid gap-1.5">
                    <Label>Costo Proveedor</Label>
                    <Input type="number" value={form.costo_por_proveedor || ""} onChange={(e) => setForm((p) => ({ ...p, costo_por_proveedor: Number(e.target.value) }))} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Ingreso Agencia (proyectado)</Label>
                    <Input value={formatCurrency(ingreso >= 0 ? ingreso : 0)} readOnly className="bg-muted font-semibold text-success" />
                  </div>
                </>
              )}
              <div className="grid gap-1.5">
                <Label>Plazo Pago Cliente (para el saldo restante)</Label>
                <Input type="date" value={form.plazo_pago_cliente} onChange={(e) => setForm((p) => ({ ...p, plazo_pago_cliente: e.target.value }))} />
              </div>
              {isAdmin && (
                <div className="grid gap-1.5">
                  <Label>Asignar a Agente</Label>
                  <Select value={form.agente_id || "auto"} onValueChange={(v) => setForm((p) => ({ ...p, agente_id: v === "auto" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Auto (yo mismo)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (mi usuario)</SelectItem>
                      {perfiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{getPerfilNombre(p.id)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                {isEditing ? "Guardar Cambios" : "Guardar Reserva"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                  <TableHead>Fecha Viaje</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  {isAdmin && <TableHead className="text-right">Costo Prov.</TableHead>}
                  {isAdmin && <TableHead className="text-right">Ingreso Agencia</TableHead>}
                  <TableHead className="text-right">Saldo</TableHead>
                   <TableHead>Estado</TableHead>
                   {isAdmin && <TableHead>Agente</TableHead>}
                   <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: isAdmin ? 10 : 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredVentas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 10 : 7} className="text-center py-8 text-muted-foreground">
                      No hay reservas registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVentas
                    .map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{getClienteName(v)}</TableCell>
                      <TableCell>{v.destino}</TableCell>
                      <TableCell>{v.fecha_inicio_viaje ?? "—"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(v.valor_total_venta)}</TableCell>
                      {isAdmin && <TableCell className="text-right">{formatCurrency(v.costo_por_proveedor)}</TableCell>}
                      {isAdmin && <TableCell className="text-right font-semibold text-green-600">{formatCurrency(v.ingreso_agencia)}</TableCell>}
                      <TableCell className="text-right">{formatCurrency(v.saldo_cliente)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          v.estado_pago_cliente === "COMPLETO" || v.estado_pago_cliente === "Pagado"
                            ? "default"
                            : v.estado_pago_cliente === "PARCIAL"
                              ? "secondary"
                              : "destructive"
                        }>
                          {v.estado_pago_cliente ?? "Pendiente"}
                        </Badge>
                      </TableCell>
                      {isAdmin && <TableCell className="text-sm text-muted-foreground">{getPerfilNombre(v.agente_id)}</TableCell>}
                      <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setDetailVenta(v)} title="Ver detalles">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(v)} title="Editar reserva">
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            {isAdmin && (
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <VentaDetailSheet
        venta={detailVenta}
        open={!!detailVenta}
        onOpenChange={(o) => { if (!o) setDetailVenta(null); }}
        isAdmin={isAdmin}
      />

      {/* Modal Recibo Digital (abono inicial) */}
      <ReciboDialog recibo={recibo} onClose={() => setRecibo(null)} />
    </div>
  );
}
