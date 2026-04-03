import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ShieldX, ArrowDownCircle, ArrowUpCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export default function Historial() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
        <ShieldX className="h-16 w-16" />
        <h2 className="text-xl font-semibold">Acceso Denegado</h2>
        <p>Solo los administradores pueden ver el historial de movimientos.</p>
      </div>
    );
  }

  return <HistorialContent />;
}

function HistorialContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const presets = [
    { label: "Este mes", range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
    { label: "Mes pasado", range: { from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) } },
    { label: "Últimos 3 meses", range: { from: startOfMonth(subMonths(new Date(), 2)), to: endOfMonth(new Date()) } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Historial de Movimientos</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {presets.map((p) => (
            <Button
              key={p.label}
              size="sm"
              variant={dateRange?.from?.getTime() === p.range.from.getTime() ? "default" : "outline"}
              onClick={() => setDateRange(p.range)}
            >
              {p.label}
            </Button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? `${format(dateRange.from, "dd/MM/yy")} - ${format(dateRange.to, "dd/MM/yy")}` : format(dateRange.from, "dd/MM/yy")
                ) : "Rango personalizado"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={es}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs defaultValue="ingresos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ingresos" className="gap-2"><ArrowDownCircle className="h-4 w-4" />Ingresos</TabsTrigger>
          <TabsTrigger value="egresos" className="gap-2"><ArrowUpCircle className="h-4 w-4" />Egresos</TabsTrigger>
          <TabsTrigger value="cerradas" className="gap-2"><CheckCircle2 className="h-4 w-4" />Ventas Cerradas</TabsTrigger>
        </TabsList>

        <TabsContent value="ingresos">
          <TabIngresos dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="egresos">
          <TabEgresos dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="cerradas">
          <TabVentasCerradas dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── INGRESOS ───
function TabIngresos({ dateRange }: { dateRange: DateRange | undefined }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("pagos_clientes")
      .select("id, fecha_pago, monto_abonado, metodo_pago, ventas(destino, clientes(nombre_cliente))")
      .order("fecha_pago", { ascending: false });

    if (dateRange?.from) query = query.gte("fecha_pago", format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange?.to) query = query.lte("fecha_pago", format(dateRange.to, "yyyy-MM-dd"));

    const { data: rows } = await query;
    setData(rows || []);
    setLoading(false);
  }, [dateRange]);

  useEffect(() => { fetch(); }, [fetch]);

  const total = data.reduce((s, r) => s + (r.monto_abonado || 0), 0);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{data.length} registros</p>
          <p className="text-lg font-bold text-green-600">Total: {formatCurrency(total)}</p>
        </div>
        {loading ? <TableSkeleton /> : (
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Sin ingresos en este período</TableCell></TableRow>
                ) : data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.fecha_pago ? format(new Date(r.fecha_pago), "dd/MM/yyyy") : "—"}</TableCell>
                    <TableCell>{(r.ventas as any)?.clientes?.nombre_cliente || "—"}</TableCell>
                    <TableCell>{(r.ventas as any)?.destino || "—"}</TableCell>
                    <TableCell>{r.metodo_pago || "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(r.monto_abonado)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── EGRESOS ───
function TabEgresos({ dateRange }: { dateRange: DateRange | undefined }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("cuentas_por_pagar")
      .select("id, monto_deuda, plazo_pago_proveedor, estado_pago, proveedores(nombre), ventas(destino)")
      .eq("estado_pago", "PAGADO")
      .order("plazo_pago_proveedor", { ascending: false });

    if (dateRange?.from) query = query.gte("plazo_pago_proveedor", format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange?.to) query = query.lte("plazo_pago_proveedor", format(dateRange.to, "yyyy-MM-dd"));

    const { data: rows } = await query;
    setData(rows || []);
    setLoading(false);
  }, [dateRange]);

  useEffect(() => { fetch(); }, [fetch]);

  const total = data.reduce((s, r) => s + (r.monto_deuda || 0), 0);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{data.length} registros</p>
          <p className="text-lg font-bold text-red-600">Total: {formatCurrency(total)}</p>
        </div>
        {loading ? <TableSkeleton /> : (
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha Límite</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Viaje Asociado</TableHead>
                  <TableHead className="text-right">Monto Pagado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Sin egresos en este período</TableCell></TableRow>
                ) : data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.plazo_pago_proveedor ? format(new Date(r.plazo_pago_proveedor), "dd/MM/yyyy") : "—"}</TableCell>
                    <TableCell>{(r.proveedores as any)?.nombre || "—"}</TableCell>
                    <TableCell>{(r.ventas as any)?.destino || "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(r.monto_deuda)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── VENTAS CERRADAS ───
function TabVentasCerradas({ dateRange }: { dateRange: DateRange | undefined }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("ventas")
      .select("id, fecha_venta, destino, valor_total_venta, ingreso_agencia, clientes(nombre_cliente)")
      .eq("estado_pago_cliente", "COMPLETO")
      .order("fecha_venta", { ascending: false });

    if (dateRange?.from) query = query.gte("fecha_venta", format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange?.to) query = query.lte("fecha_venta", format(dateRange.to, "yyyy-MM-dd"));

    const { data: rows } = await query;
    setData(rows || []);
    setLoading(false);
  }, [dateRange]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalVentas = data.reduce((s, r) => s + (r.valor_total_venta || 0), 0);
  const totalUtilidad = data.reduce((s, r) => s + (r.ingreso_agencia || 0), 0);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <p className="text-sm text-muted-foreground">{data.length} ventas cerradas</p>
          <div className="flex gap-4">
            <p className="text-sm">Ventas: <span className="font-bold">{formatCurrency(totalVentas)}</span></p>
            <p className="text-sm">Utilidad: <span className="font-bold text-green-600">{formatCurrency(totalUtilidad)}</span></p>
          </div>
        </div>
        {loading ? <TableSkeleton /> : (
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha Venta</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Utilidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Sin ventas cerradas en este período</TableCell></TableRow>
                ) : data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.fecha_venta ? format(new Date(r.fecha_venta), "dd/MM/yyyy") : "—"}</TableCell>
                    <TableCell>{(r.clientes as any)?.nombre_cliente || "—"}</TableCell>
                    <TableCell>{r.destino || "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(r.valor_total_venta)}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">{formatCurrency(r.ingreso_agencia)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
