import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard, Building2, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);

interface Vencimiento {
  id: string;
  destino: string;
  saldo_cliente: number;
  plazo_pago_cliente: string;
  clientes: { nombre_cliente: string } | null;
}

function getSemaforoColor(plazo: string) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(plazo + "T00:00:00");
  const diff = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "destructive" as const;
  if (diff <= 7) return "secondary" as const;
  return "default" as const;
}

function getSemaforoBg(plazo: string) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(plazo + "T00:00:00");
  const diff = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "bg-red-500/10 text-red-600 border-red-200";
  if (diff <= 7) return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
  return "bg-green-500/10 text-green-600 border-green-200";
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ventasTotal, setVentasTotal] = useState(0);
  const [utilidad, setUtilidad] = useState(0);
  const [porCobrar, setPorCobrar] = useState(0);
  const [porPagar, setPorPagar] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [vencimientos, setVencimientos] = useState<Vencimiento[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [ventasRes, cxpRes, vencRes] = await Promise.all([
        supabase.from("ventas").select("destino, valor_total_venta, costo_por_proveedor, ingreso_agencia, saldo_cliente, clientes(nombre_cliente)"),
        supabase.from("cuentas_por_pagar").select("monto_deuda, estado_pago").eq("estado_pago", "PENDIENTE"),
        supabase.from("ventas")
          .select("id, destino, saldo_cliente, plazo_pago_cliente, clientes(nombre_cliente)")
          .gt("saldo_cliente", 0)
          .order("plazo_pago_cliente", { ascending: true })
          .limit(5),
      ]);

      const ventas = ventasRes.data || [];
      const cxp = cxpRes.data || [];
      const venc = vencRes.data || [];

      setVentasTotal(ventas.reduce((s: number, v: any) => s + Number(v.valor_total_venta || 0), 0));
      setUtilidad(ventas.reduce((s: number, v: any) => s + Number(v.ingreso_agencia || 0), 0));
      setPorCobrar(ventas.reduce((s: number, v: any) => s + Number(v.saldo_cliente || 0), 0));
      setPorPagar(cxp.reduce((s: number, c: any) => s + Number(c.monto_deuda || 0), 0));

      // Chart: last 10 sales as bars
      const chartItems = ventas.slice(0, 10).map((v: any) => ({
        name: v.destino?.substring(0, 12) || "—",
        "Valor Venta": Number(v.valor_total_venta || 0),
        "Costo Proveedor": Number(v.costo_por_proveedor || 0),
        "Ingreso Agencia": Number(v.ingreso_agencia || 0),
      }));
      setChartData(chartItems);
      setVencimientos(venc as Vencimiento[]);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return <Navigate to="/admin/ventas" replace />;
  }

  const kpis = [
    { label: "Ventas Totales", value: formatCurrency(ventasTotal), icon: DollarSign, color: "text-primary" },
    { label: "Utilidad Bruta", value: formatCurrency(utilidad), icon: TrendingUp, color: "text-emerald-500" },
    { label: "Cuentas por Cobrar", value: formatCurrency(porCobrar), icon: CreditCard, color: "text-amber-500" },
    { label: "Cuentas por Pagar", value: formatCurrency(porPagar), icon: Building2, color: "text-red-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard Financiero</h1>
        <p className="text-muted-foreground text-sm">Resumen en tiempo real del estado financiero de la agencia.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{kpi.label}</CardTitle>
              <div className={`p-2.5 rounded-2xl bg-background shadow-sm border border-border/50 group-hover:scale-110 transition-transform ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-9 w-40 mt-2" />
              ) : (
                <p className="text-3xl font-extrabold tracking-tight text-foreground mt-2">{kpi.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Vencimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Card className="lg:col-span-2 border-none shadow-md bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Ingresos vs Costos por Viaje</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No hay ventas registradas aún.</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                    <XAxis dataKey="name" className="text-xs font-medium" axisLine={false} tickLine={false} dy={10} />
                    <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} className="text-xs font-medium" axisLine={false} tickLine={false} dx={-5} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--background))' }}
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '16px' }} />
                    <Bar dataKey="Valor Venta" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="Costo Proveedor" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="Ingreso Agencia" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos Vencimientos */}
        <Card className="border-none shadow-md bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg font-bold tracking-tight">Próximos Vencimientos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : vencimientos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">Sin vencimientos pendientes.</p>
            ) : (
              <div className="space-y-3">
                {vencimientos.map((v) => (
                  <div key={v.id} className={`p-3 rounded-lg border ${getSemaforoBg(v.plazo_pago_cliente)}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{v.clientes?.nombre_cliente || "—"}</p>
                        <p className="text-xs opacity-75 capitalize">{v.destino}</p>
                      </div>
                      <Badge variant={getSemaforoColor(v.plazo_pago_cliente)} className="text-[10px]">
                        {v.plazo_pago_cliente}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold mt-1">{formatCurrency(v.saldo_cliente)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
