import { useState } from "react";
import { cuentasPorPagar as initialCuentas, CuentaPorPagar, getProveedorName, getClienteName, ventas, formatCurrency, getSemaforoStatus } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const semaforoBadge = (status: "verde" | "amarillo" | "rojo", fecha: string) => {
  const variants: Record<string, string> = {
    verde: "bg-success text-success-foreground",
    amarillo: "bg-warning text-warning-foreground",
    rojo: "bg-danger text-danger-foreground",
  };
  return <Badge className={variants[status]}>{fecha}</Badge>;
};

const getDestinoByVenta = (ventaId: string) => ventas.find((v) => v.id === ventaId)?.destino ?? "";
const getClienteByVenta = (ventaId: string) => {
  const v = ventas.find((v) => v.id === ventaId);
  return v ? getClienteName(v.cliente_id) : "";
};

export default function ProveedoresPage() {
  const { isAdmin } = useAuth();
  const [cuentas, setCuentas] = useState<CuentaPorPagar[]>(initialCuentas);

  const pendientes = cuentas.filter((c) => c.estado_pago === "Pendiente");

  const handleDelete = (id: string) => {
    setCuentas((prev) => prev.filter((c) => c.id !== id));
    toast.success("Registro eliminado");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Proveedores — Cuentas por Pagar</h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Cliente (Venta)</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead className="text-right">Monto Deuda</TableHead>
                  <TableHead>Plazo de Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendientes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{getProveedorName(c.proveedor_id)}</TableCell>
                    <TableCell>{getClienteByVenta(c.venta_id)}</TableCell>
                    <TableCell>{getDestinoByVenta(c.venta_id)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(c.monto_deuda)}</TableCell>
                    <TableCell>{semaforoBadge(getSemaforoStatus(c.plazo_pago_proveedor), c.plazo_pago_proveedor)}</TableCell>
                    <TableCell><Badge variant="secondary">{c.estado_pago}</Badge></TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    )}
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
    </div>
  );
}
