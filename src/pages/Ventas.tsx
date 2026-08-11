import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Loader2, Eye, Pencil, Filter, Search, Calendar as CalendarIcon, ArrowUpDown, ArrowDown, ArrowUp, TrendingUp, TrendingDown, MapPin, CreditCard, Wallet, X } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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

interface ProveedorOption {
  id: string;
  nombre: string;
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
  proveedor_id: "none",
  plazo_pago_proveedor: "",
  plazo_pago_cliente: "",
  agente_id: "",
};

export default function Ventas() {
  const { isAdmin, user } = useAuth();
  const queryClient = useQueryClient();
  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilOption[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingVentaId, setEditingVentaId] = useState<string | null>(null);
  const [detailVenta, setDetailVenta] = useState<VentaRow | null>(null);
  const [recibo, setRecibo] = useState<ReciboData | null>(null);
  const [filtroAgente, setFiltroAgente] = useState<string>("todos");
  
  // Dashboard states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filtroDestino, setFiltroDestino] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [sortField, setSortField] = useState<"fecha_inicio_viaje" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const isEditing = !!editingVentaId;

  const destinosUnicos = useMemo(() => {
    const destinos = ventas.map(v => v.destino);
    return Array.from(new Set(destinos)).filter(Boolean).sort();
  }, [ventas]);

  const kpis = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));
    const sevenDaysAgo = subDays(now, 7);

    let ventasMesActual = 0;
    let ventasMesAnterior = 0;
    let ventasSemana = 0;
    let totalPendiente = 0;
    const destinosCount: Record<string, number> = {};

    ventas.forEach((v) => {
      const fVenta = v.fecha_venta ? new Date(v.fecha_venta) : null;
      
      if (v.saldo_cliente > 0) {
        totalPendiente += v.saldo_cliente;
      }

      if (fVenta) {
        if (fVenta >= currentMonthStart && fVenta <= currentMonthEnd) {
          ventasMesActual += v.valor_total_venta;
          if (v.destino) {
            destinosCount[v.destino] = (destinosCount[v.destino] || 0) + 1;
          }
        }
        if (fVenta >= prevMonthStart && fVenta <= prevMonthEnd) {
          ventasMesAnterior += v.valor_total_venta;
        }
        if (fVenta >= sevenDaysAgo && fVenta <= now) {
          ventasSemana += v.valor_total_venta;
        }
      }
    });

    let destinoEstrella = "N/A";
    let maxCount = 0;
    Object.entries(destinosCount).forEach(([destino, count]) => {
      if (count > maxCount) {
        maxCount = count;
        destinoEstrella = destino;
      }
    });

    const crecimiento = ventasMesAnterior > 0 
      ? ((ventasMesActual - ventasMesAnterior) / ventasMesAnterior) * 100 
      : (ventasMesActual > 0 ? 100 : 0);

    return {
      ventasMesActual,
      ventasSemana,
      destinoEstrella,
      totalPendiente,
      crecimiento
    };
  }, [ventas]);

  const filteredVentas = useMemo(() => {
    let result = ventas;

    if (isAdmin && filtroAgente !== "todos") {
      result = result.filter(v => v.agente_id === filtroAgente);
    } else if (!isAdmin) {
      result = result.filter(v => v.agente_id === user?.id);
    }

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(v => 
        (v.clientes?.nombre_cliente || "").toLowerCase().includes(lowerSearch) ||
        (v.codigo_reserva_aerea || "").toLowerCase().includes(lowerSearch) ||
        (v.codigo_reserva_hotel || "").toLowerCase().includes(lowerSearch)
      );
    }

    if (filtroDestino !== "todos") {
      result = result.filter(v => v.destino === filtroDestino);
    }

    if (filtroEstado !== "todos") {
      result = result.filter(v => v.estado_pago_cliente === filtroEstado);
    }

    if (dateRange?.from) {
      result = result.filter(v => {
        if (!v.fecha_venta) return false;
        const fVenta = new Date(v.fecha_venta);
        fVenta.setHours(0,0,0,0);
        const from = new Date(dateRange.from!);
        from.setHours(0,0,0,0);
        
        if (dateRange.to) {
          const to = new Date(dateRange.to);
          to.setHours(23,59,59,999);
          return fVenta >= from && fVenta <= to;
        }
        return fVenta >= from;
      });
    }

    if (sortField === "fecha_inicio_viaje") {
      result.sort((a, b) => {
        const aDate = a.fecha_inicio_viaje ? new Date(a.fecha_inicio_viaje).getTime() : 0;
        const bDate = b.fecha_inicio_viaje ? new Date(b.fecha_inicio_viaje).getTime() : 0;
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      });
    }

    return result;
  }, [ventas, isAdmin, filtroAgente, user?.id, searchTerm, filtroDestino, filtroEstado, dateRange, sortField, sortDirection]);

  const totalFiltrado = useMemo(() => {
    return filteredVentas.reduce((sum, v) => sum + (v.valor_total_venta || 0), 0);
  }, [filteredVentas]);

  const toggleSort = () => {
    if (sortField === "fecha_inicio_viaje") {
      if (sortDirection === "asc") setSortDirection("desc");
      else {
        setSortField(null);
        setSortDirection("asc");
      }
    } else {
      setSortField("fecha_inicio_viaje");
      setSortDirection("asc");
    }
  };

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
      proveedor_id: "none",
      plazo_pago_proveedor: "",
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

  const fetchProveedores = useCallback(async () => {
    const { data } = await supabase
      .from("proveedores")
      .select("id, nombre")
      .order("nombre");
    if (data) setProveedores(data);
  }, []);

  useEffect(() => {
    fetchVentas();
    fetchClientes();
    fetchPerfiles();
    fetchProveedores();
  }, [fetchVentas, fetchClientes, fetchPerfiles, fetchProveedores]);

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

      let errorCxPMessage = null;
      if (form.proveedor_id && form.proveedor_id !== "none") {
        const { error: errorCxP } = await supabase
          .from("cuentas_por_pagar")
          .insert({
            venta_id: nuevaVenta.id,
            proveedor_id: form.proveedor_id,
            monto_deuda: form.costo_por_proveedor,
            plazo_pago_proveedor: form.plazo_pago_proveedor || null,
            agente_id: agenteIdFinal,
          });
        if (errorCxP) {
          errorCxPMessage = errorCxP.message;
        }
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
      } else if (!errorCxPMessage) {
        toast.success("Reserva y Cuenta por Pagar creadas exitosamente");
      }

      if (errorCxPMessage) {
        toast.warning("Reserva creada, pero falló la cuenta por pagar: " + errorCxPMessage);
      } else if (form.proveedor_id && form.proveedor_id !== "none" && form.anticipo > 0) {
        toast.success("Reserva y Cuenta por Pagar creadas exitosamente");
      }
    }

    setForm(emptyForm);
    setEditingVentaId(null);
    setOpen(false);
    fetchVentas();
    queryClient.invalidateQueries({ queryKey: ["cuentas_por_pagar"] });
    queryClient.invalidateQueries({ queryKey: ["ventas"] });
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
                  
                  {!isEditing && (
                    <>
                      <div className="grid gap-1.5 border-l-2 border-primary/50 pl-3">
                        <Label>Proveedor</Label>
                        <Select value={form.proveedor_id} onValueChange={(v) => setForm((p) => ({ ...p, proveedor_id: v }))}>
                          <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin asignar</SelectItem>
                            {proveedores.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1.5 border-l-2 border-primary/50 pl-3">
                        <Label>Plazo Máximo de Pago (Proveedor)</Label>
                        <Input type="date" value={form.plazo_pago_proveedor} onChange={(e) => setForm((p) => ({ ...p, plazo_pago_proveedor: e.target.value }))} />
                      </div>
                    </>
                  )}

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm font-medium">Ventas del Mes</span>
              <Wallet className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(kpis.ventasMesActual)}</div>
            <div className={`text-xs flex items-center mt-1 ${kpis.crecimiento >= 0 ? "text-green-600" : "text-red-600"}`}>
              {kpis.crecimiento >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(kpis.crecimiento).toFixed(1)}% vs mes anterior
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm font-medium">Ventas de la Semana</span>
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(kpis.ventasSemana)}</div>
            <div className="text-xs text-muted-foreground mt-1">Últimos 7 días</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm font-medium">Destino Estrella</span>
              <MapPin className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold capitalize">{kpis.destinoEstrella.toLowerCase()}</div>
            <div className="text-xs text-muted-foreground mt-1">En el mes actual</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm font-medium">Por Recaudar</span>
              <Wallet className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(kpis.totalPendiente)}</div>
            <div className="text-xs text-muted-foreground mt-1">Saldo pendiente global</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 bg-card p-4 rounded-xl shadow-sm border">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por cliente, vuelo, reserva..." 
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filtro Rango de Fechas */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={`justify-start text-left font-normal w-full lg:w-[240px] bg-background ${!dateRange && "text-muted-foreground"}`}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Filtrar por fecha de venta...</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex border-b">
              <div className="flex flex-col gap-1 p-3 border-r bg-muted/20 w-[140px]">
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })}>Este mes</Button>
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => setDateRange({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) })}>Mes pasado</Button>
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => setDateRange({ from: subDays(new Date(), 7), to: new Date() })}>Últimos 7 días</Button>
              </div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro Destino */}
        <Select value={filtroDestino} onValueChange={setFiltroDestino}>
          <SelectTrigger className="w-full lg:w-[180px] bg-background">
            <SelectValue placeholder="Destino" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los destinos</SelectItem>
            {destinosUnicos.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro Estado */}
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-full lg:w-[160px] bg-background">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="COMPLETO">Completos</SelectItem>
            <SelectItem value="PENDIENTE">Pendientes</SelectItem>
            <SelectItem value="PARCIAL">Abono Parcial</SelectItem>
          </SelectContent>
        </Select>

        {isAdmin && (
          <Select value={filtroAgente} onValueChange={setFiltroAgente}>
            <SelectTrigger className="w-full lg:w-[180px] bg-background">
              <SelectValue placeholder="Agente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los Agentes</SelectItem>
              {perfiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>{getPerfilNombre(p.id)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button variant="ghost" size="icon" title="Limpiar Filtros" onClick={() => {
          setSearchTerm("");
          setDateRange(undefined);
          setFiltroDestino("todos");
          setFiltroEstado("todos");
          setFiltroAgente("todos");
          setSortField(null);
          setSortDirection("asc");
        }}>
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={toggleSort}
                  >
                    <div className="flex items-center gap-1">
                      Fecha Viaje
                      {sortField === "fecha_inicio_viaje" ? (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-20" />
                      )}
                    </div>
                  </TableHead>
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
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold text-right text-muted-foreground">Total Filtrado:</TableCell>
                  <TableCell className="font-bold text-right">{formatCurrency(totalFiltrado)}</TableCell>
                  <TableCell colSpan={isAdmin ? 6 : 4}></TableCell>
                </TableRow>
              </TableFooter>
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
