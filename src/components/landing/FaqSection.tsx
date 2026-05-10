import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    id: "faq-1",
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos tarjetas de crédito, transferencias bancarias y pagos en efectivo en nuestras oficinas. También ofrecemos planes de financiamiento o pagos por cuotas antes de la fecha de tu viaje.",
  },
  {
    id: "faq-2",
    question: "¿Los paquetes incluyen seguro de viaje?",
    answer:
      "La mayoría de nuestros paquetes internacionales incluyen asistencia médica básica. Sin embargo, siempre recomendamos a nuestros clientes adquirir una cobertura extendida que podemos cotizar junto con tu viaje. Sin embargo no es un requisito obligatorio en todos los países",
  },
  {
    id: "faq-3",
    question: "¿Ustedes me ayudan con el trámite de la visa?",
    answer:
      "No, no realizamos trámites de documentación.",
  },
  {
    id: "faq-4",
    question: "¿Puedo cancelar o modificar mi reserva?",
    answer:
      "Las políticas de cancelación varían dependiendo de la aerolínea y el hotel. Al momento de enviarte la cotización formal, incluiremos siempre las políticas específicas de tu paquete para que tengas total claridad.",
  },
];

export function FaqSection() {
  return (
    <section
      id="preguntas-frecuentes"
      className="py-16 lg:py-24 bg-muted/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Resolvemos{" "}
            <span className="text-primary">tus dudas</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Todo lo que necesitas saber antes de empacar tus maletas.
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-card border border-border/60 rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-300 data-[state=open]:border-primary/40 data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-primary hover:no-underline py-5 gap-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
