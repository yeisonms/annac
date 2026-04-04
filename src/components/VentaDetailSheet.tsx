import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, MapPin, Calendar, DollarSign, Edit } from "lucide-react";
import { formatCurrency } from "@/data/mockData";

interface VentaRow {
  id: string;
  cliente_id: string;
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

interface Props {
  venta: VentaRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  onEdit?: (venta: VentaRow) => void;
}

function estadoBadgeVariant(estado: string | null) {
  if (estado === "COMPLETO" || estado === "Pagado") return "default" as const;
  if (estado === "PARCIAL") return "secondary" as const;
  return "destructive" as const;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d + "T12:00:00").toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function VentaDetailSheet({ venta, open, onOpenChange, isAdmin, onEdit }: Props) {
  if (!venta) return null;

  const clienteName = venta.clientes?.nombre_cliente ?? "Sin cliente";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="text-xl">{clienteName}</SheetTitle>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" /> {venta.destino}
              </p>
            </div>
            <Badge variant={estadoBadgeVariant(venta.estado_pago_cliente)} className="shrink-0 mt-1">
              {venta.estado_pago_cliente ?? "PENDIENTE"}
            </Badge>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Fechas del Viaje */}
        <section className="space-y-2 mb-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Fechas del Viaje
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoBlock label="Inicio" value={formatDate(venta.fecha_inicio_viaje)} />
            <InfoBlock label="Fin" value={formatDate(venta.fecha_fin_viaje)} />
          </div>
        </section>

        <Separator className="my-4" />

        {/* Información Operativa */}
        <section className="space-y-3 mb-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Plane className="h-4 w-4" /> Información Operativa
          </h3>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Plane className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Reserva de Vuelo</p>
                <p className="font-mono font-semibold text-base">
                  {venta.codigo_reserva_aerea || "No registrado"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Hotel className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Reserva de Hotel</p>
                <p className="font-mono font-semibold text-base">
                  {venta.codigo_reserva_hotel || "No registrado"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Tours / Traslados / Receptivos</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {venta.receptivos_programa || "No registrado"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-4" />

        {/* Resumen Financiero */}
        <section className="space-y-3 mb-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Resumen Financiero
          </h3>

          <div className="rounded-lg border p-4 space-y-2">
            <FinRow label="Valor Total de Venta" value={formatCurrency(venta.valor_total_venta)} />
            <FinRow label="Saldo Pendiente" value={formatCurrency(venta.saldo_cliente)} highlight={venta.saldo_cliente > 0} />

            {isAdmin && (
              <>
                <Separator className="my-2" />
                <FinRow label="Costo Proveedor" value={formatCurrency(venta.costo_por_proveedor)} />
                <FinRow
                  label="Ingreso Agencia"
                  value={formatCurrency(venta.ingreso_agencia)}
                  className="text-green-600 font-bold"
                />
              </>
            )}

            {venta.plazo_pago_cliente && (
              <>
                <Separator className="my-2" />
                <FinRow label="Plazo de Pago" value={formatDate(venta.plazo_pago_cliente)} />
              </>
            )}
          </div>
        </section>

        {/* Botón editar */}
        {onEdit && (
          <Button variant="outline" className="w-full" onClick={() => onEdit(venta)}>
            <Edit className="h-4 w-4 mr-2" /> Editar Reserva
          </Button>
        )}
      </SheetContent>
    </Sheet>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function FinRow({ label, value, highlight, className }: { label: string; value: string; highlight?: boolean; className?: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={className || (highlight ? "text-destructive font-semibold" : "font-medium")}>
        {value}
      </span>
    </div>
  );
}
