import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  buildQuoteWhatsAppMessage,
  buildWhatsAppUrl,
  clearQuoteRedirectPayload,
  getQuoteRedirectPayload,
} from "@/lib/whatsapp";

type RedirectStatus = "loading" | "error";

const QuoteRedirect = () => {
  const [status, setStatus] = useState<RedirectStatus>("loading");
  const payload = useMemo(() => getQuoteRedirectPayload(), []);

  useEffect(() => {
    const submitAndRedirect = async () => {
      if (!payload) {
        setStatus("error");
        return;
      }

      try {
        const { error } = await supabase.from("cotizaciones").insert({
          nombre: payload.nombre,
          email: payload.email,
          telefono: payload.telefono,
          destino: payload.destino,
          fecha_ida: payload.fechaIda,
          fecha_regreso: payload.fechaRegreso,
          numero_personas: payload.numeroPersonas,
          adultos: payload.adultos,
          ninos: payload.ninos,
          infantes: payload.infantes,
        });

        if (error) throw error;

        const whatsappUrl = buildWhatsAppUrl(buildQuoteWhatsAppMessage(payload));
        clearQuoteRedirectPayload();
        window.location.replace(whatsappUrl);
      } catch (error) {
        console.error("Error al redirigir cotización a WhatsApp:", error);
        setStatus("error");
      }
    };

    submitAndRedirect();
  }, [payload]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <Card className="w-full border-border/60 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageCircle className="h-7 w-7" />
              </div>
              <CardTitle>Conectando con WhatsApp</CardTitle>
              <CardDescription>Estamos guardando tu cotización y abriendo el chat de Annac Viajes.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
        <Card className="w-full border-border/60 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <RefreshCw className="h-7 w-7" />
            </div>
            <CardTitle>No pudimos abrir WhatsApp</CardTitle>
            <CardDescription>
              Intenta nuevamente desde la landing. Si el problema persiste, abre la app en una pestaña completa y repite el envío.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button asChild>
              <a href="/">Volver al inicio</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default QuoteRedirect;