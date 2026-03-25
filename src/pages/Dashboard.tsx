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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard Financiero</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ingresos vs Costos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} className="text-xs" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="ingresos" name="Ingresos Agencia" fill="hsl(215, 80%, 48%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costos" name="Costos Proveedores" fill="hsl(215, 15%, 70%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
