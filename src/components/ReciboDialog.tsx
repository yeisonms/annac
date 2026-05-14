import { useRef, useState } from "react";
import { formatCurrency } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, MessageCircle, CheckCircle2, Plane, Receipt, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

export interface ReciboData {
  nombreCliente: string;
  celular: string | null;
  destino: string;
  valorAbono: number;
  valorTotal: number;
  saldoPendiente: number;
  fechaPago: string;
  tipoAbono?: string;
}

const buildReciboWhatsAppUrl = (recibo: ReciboData): string => {
  const numero = recibo.celular?.replace(/\D/g, "") || "";
  const tipo = recibo.tipoAbono || "Abono";
  const mensaje = `¡Hola, ${recibo.nombreCliente}! ✈️\nConfirmamos la recepción de tu pago para tu próximo viaje a ${recibo.destino}.\n\n*Detalle de tu pago:*\n💰 ${tipo}: ${formatCurrency(recibo.valorAbono)}\n📅 Fecha: ${recibo.fechaPago}\n\n*Estado de tu cuenta:*\n💵 Total del viaje: ${formatCurrency(recibo.valorTotal)}\n📉 Saldo pendiente: ${formatCurrency(recibo.saldoPendiente)}\n\n¡Gracias por confiar en nosotros para tus vacaciones! Si tienes dudas, escríbenos.`;

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
};

interface ReciboDialogProps {
  recibo: ReciboData | null;
  onClose: () => void;
}

export function ReciboDialog({ recibo, onClose }: ReciboDialogProps) {
  const reciboRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
        const link = document.createElement("a");
        link.download = "comprobante-pago.png";
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        toast.info("Tu navegador no soporta compartir archivos. La imagen se ha descargado.");
      }
    }, "image/png");
  };

  const tipoLabel = recibo?.tipoAbono || "Abono realizado";

  return (
    <Dialog open={!!recibo} onOpenChange={(open) => !open && onClose()}>
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
                  <span className="text-xs text-muted-foreground">{tipoLabel}</span>
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
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
