import { useState, useEffect, useCallback, useRef } from "react";
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
import { Wallet, Loader2, MessageCircle, CheckCircle2, Plane, Receipt, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface VentaCartera {
  id: string;
  destino: string;
  valor_total_venta: number;
  saldo_cliente: number;
  plazo_pago_cliente: string | null;
  estado_pago_cliente: string | null;
  clientes: { nombre_cliente: string; celular: string | null } | null;
}

interface ReciboData {
  nombreCliente: string;
  celular: string | null;
  destino: string;
  valorAbono: number;
  valorTotal: number;
  saldoPendiente: number;
  fechaPago: string;
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

const buildReciboWhatsAppUrl = (recibo: ReciboData): string => {
  const numero = recibo.celular?.replace(/\D/g, "") || "";
  const mensaje = `¡Hola, ${recibo.nombreCliente}! ✈️\nConfirmamos la recepción de tu pago para tu próximo viaje a ${recibo.destino}.\n\n*Detalle de tu pago:*\n💰 Abono realizado: ${formatCurrency(recibo.valorAbono)}\n📅 Fecha: ${recibo.fechaPago}\n\n*Estado de tu cuenta:*\n💵 Total del viaje: ${formatCurrency(recibo.valorTotal)}\n📉 Saldo pendiente: ${formatCurrency(recibo.saldoPendiente)}\n\n¡Gracias por confiar en nosotros para tus vacaciones! Si tienes dudas, escríbenos.`;

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
};

export default function Cartera() {
  const [ventas, setVentas] = useState<VentaCartera[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenta, setSelectedVenta] = useState<VentaCartera | null>(null);
  const [abonoForm, setAbonoForm] = useState({ monto: 0, metodo: "Transferencia", fecha: "" });
  const [saving, setSaving] = useState(false);
  const [recibo, setRecibo] = useState<ReciboData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const reciboRef = useRef<HTMLDivElement>(null);

  const generateCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!reciboRef.current) return null;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reciboRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      return canvas;
    } catch (err) {
      console.error("Error al generar imagen:", err);
      toast.error("Error al generar la imagen del recibo.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    const canvas = await generateCanvas();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "comprobante-pago.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Imagen descargada correctamente");
  };

  const handleShare = async () => {
    const canvas = await generateCanvas();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) { toast.error("Error al generar la imagen."); return; }

      const file = new File([blob], "comprobante-pago.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: "Comprobante de Pago - Annac Viajes",
            text: "Aquí tienes tu comprobante de pago ✈️",
            files: [file],
          });
        } catch (err: any) {
          if (err.name !== "AbortError") {
            toast.error("Error al compartir.");
          }
        }
      } else {
        // Fallback: descargar la imagen
        const link = document.createElement("a");
        link.download = "comprobante-pago.png";
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        toast.info("Tu navegador no soporta compartir archivos. La imagen se ha descargado.");
      }
    }, "image/png");
  };

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ventas")
      .select("id, destino, valor_total_venta, saldo_cliente, plazo_pago_cliente, estado_pago_cliente, clientes(nombre_cliente, celular)")
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
    const fechaPago = abonoForm.fecha || new Date().toISOString().split("T")[0];

    // 1. INSERT pago
    const { error: errorPago } = await supabase.from("pagos_clientes").insert({
      venta_id: selectedVenta.id,
      monto_abonado: abonoForm.monto,
      fecha_pago: fechaPago,
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
      setSaving(false);
      return;
    }

    // 3. Generar recibo digital
    setRecibo({
      nombreCliente: selectedVenta.clientes?.nombre_cliente ?? "Cliente",
      celular: selectedVenta.clientes?.celular ?? null,
      destino: selectedVenta.destino,
      valorAbono: abonoForm.monto,
      valorTotal: selectedVenta.valor_total_venta,
      saldoPendiente: nuevoSaldo,
      fechaPago,
    });

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

      {/* Modal Registrar Abono */}
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

      {/* Modal Recibo Digital */}
      <Dialog open={!!recibo} onOpenChange={(open) => !open && setRecibo(null)}>
        <DialogContent className="max-w-md">
          {/* Contenedor capturado por html2canvas */}
          <div ref={reciboRef} className="bg-white rounded-xl p-5">
            <div className="flex flex-col items-center text-center pt-2">
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 mb-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-foreground">¡Pago Registrado con Éxito!</h2>
              <p className="text-sm text-muted-foreground mt-1">Annac Viajes a tu Medida</p>
            </div>

            {recibo && (
              <div className="mt-4 rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 space-y-4">
                {/* Header del recibo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Recibo de Pago</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{recibo.fechaPago}</span>
                </div>

                <div className="border-t border-border" />

                {/* Info del cliente */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Cliente</span>
                    <span className="text-sm font-semibold">{recibo.nombreCliente}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Destino</span>
                    <span className="text-sm font-semibold flex items-center gap-1">
                      <Plane className="h-3.5 w-3.5 text-muted-foreground" />
                      {recibo.destino}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Detalle financiero */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Abono realizado</span>
                    <span className="text-base font-bold text-emerald-600">
                      {formatCurrency(recibo.valorAbono)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total del viaje</span>
                    <span className="text-sm font-medium">{formatCurrency(recibo.valorTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Saldo pendiente</span>
                    <span className={`text-sm font-bold ${recibo.saldoPendiente === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                      {recibo.saldoPendiente === 0 ? "✅ PAGADO" : formatCurrency(recibo.saldoPendiente)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {recibo && (
            <div className="flex flex-col gap-2 mt-2">
              {/* Botones Descargar y Compartir */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleDownloadImage}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Descargar
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleShare}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                  Compartir
                </Button>
              </div>

              {/* WhatsApp */}
              {recibo.celular ? (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  asChild
                >
                  <a
                    href={buildReciboWhatsAppUrl(recibo)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar Recibo por WhatsApp
                  </a>
                </Button>
              ) : (
                <p className="text-xs text-center text-muted-foreground italic">
                  Este cliente no tiene celular registrado. Agréguelo en el módulo de Clientes para enviar recibos por WhatsApp.
                </p>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setRecibo(null)}
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
