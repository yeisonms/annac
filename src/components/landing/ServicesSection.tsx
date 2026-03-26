import { Plane, Hotel, Map, Ship, Route, HeartPulse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Plane,
    title: "Vuelos",
    desc: "Las mejores tarifas en vuelos nacionales e internacionales con las aerolíneas más confiables.",
  },
  {
    icon: Hotel,
    title: "Hoteles",
    desc: "Alojamientos seleccionados para cada presupuesto: desde boutique hasta todo incluido.",
  },
  {
    icon: Map,
    title: "Tours",
    desc: "Experiencias guiadas únicas en los destinos más fascinantes del mundo.",
  },
  {
    icon: Ship,
    title: "Cruceros",
    desc: "Navega por el Caribe, el Mediterráneo o Alaska con las mejores navieras.",
  },
  {
    icon: Route,
    title: "Circuitos",
    desc: "Recorridos completos por múltiples ciudades con transporte y hospedaje incluido.",
  },
  {
    icon: HeartPulse,
    title: "Asistencia Médica",
    desc: "Viaja tranquilo con cobertura médica internacional para toda tu familia.",
  },
];

export function ServicesSection() {
  return (
    <section id="servicios" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-coral mb-3">
            Nuestros servicios
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Todo lo que necesitas para tu viaje
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Card
              key={s.title}
              className="group border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default"
            >
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <s.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
