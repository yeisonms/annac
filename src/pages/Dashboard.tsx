import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, Building2 } from "lucide-react";
import { ventas, cuentasPorPagar, formatCurrency } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const ventasMes = ventas.reduce((s, v) => s + v.valor_total_venta, 0);
const utilidadBruta = ventas.reduce((s, v) => s + v.ingreso_agencia, 0);
const cuentasCobrar = ventas.reduce((s, v) => s + v.saldo_cliente, 0);
const cuentasPagar = cuentasPorPagar.filter(c => c.estado_pago === "Pendiente").reduce((s, c) => s + c.monto_deuda, 0);

const chartData = [
  { mes: "Ene", ingresos: 3200000, costos: 2100000 },
  { mes: "Feb", ingresos: 4100000, costos: 2900000 },
  { mes: "Mar", ingresos: ventas.reduce((s, v) => s + v.ingreso_agencia, 0), costos: ventas.reduce((s, v) => s + v.costo_por_proveedor, 0) },
];

const kpis = [
  { label: "Ventas del Mes", value: formatCurrency(ventasMes), icon: DollarSign, color: "text-primary" },
  { label: "Utilidad Bruta", value: formatCurrency(utilidadBruta), icon: TrendingUp, color: "text-success" },
  { label: "Cuentas por Cobrar", value: formatCurrency(cuentasCobrar), icon: CreditCard, color: "text-warning" },
  { label: "Cuentas por Pagar", value: formatCurrency(cuentasPagar), icon: Building2, color: "text-danger" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard Financiero</h1>
        <p className="text-muted-foreground text-sm">Resumen de actividad y estado financiero de la agencia.</p>
      </div>
      
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
              <p className="text-3xl font-extrabold tracking-tight text-foreground mt-2">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="border-none shadow-md bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight">Ingresos vs Costos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                <XAxis dataKey="mes" className="text-xs font-medium" axisLine={false} tickLine={false} dy={10} />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} className="text-xs font-medium" axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)} 
                  contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--background))' }}
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="ingresos" name="Ingresos Agencia" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="costos" name="Costos Proveedores" fill="hsl(var(--primary) / 0.3)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
