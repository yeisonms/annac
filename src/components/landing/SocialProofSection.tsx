import { Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const reviews = [
  {
    name: "María González",
    initials: "MG",
    avatar: "https://i.pravatar.cc/100?img=1",
    text: "Excelente servicio, el viaje a Cancún fue tal como lo soñamos. Todo perfectamente organizado, desde los vuelos hasta el hotel. ¡100% recomendados!",
    date: "Hace 2 semanas",
  },
  {
    name: "Carlos Ramírez",
    initials: "CR",
    avatar: "https://i.pravatar.cc/100?img=3",
    text: "Llevamos 3 viajes con Annac y nunca nos han fallado. El crucero por el Caribe fue una experiencia inolvidable para toda la familia.",
    date: "Hace 1 mes",
  },
  {
    name: "Laura Mendoza",
    initials: "LM",
    avatar: "https://i.pravatar.cc/100?img=5",
    text: "Increíble atención al cliente. Nos ayudaron a planificar nuestra luna de miel a Europa en tiempo récord y a un precio justo. ¡Gracias, Annac!",
    date: "Hace 3 semanas",
  },
  {
    name: "Andrés Patiño",
    initials: "AP",
    avatar: "https://i.pravatar.cc/100?img=8",
    text: "El tour por San Andrés superó todas nuestras expectativas. Muy profesionales y siempre pendientes de cada detalle del viaje.",
    date: "Hace 1 semana",
  },
  {
    name: "Valentina Ríos",
    initials: "VR",
    avatar: "https://i.pravatar.cc/100?img=9",
    text: "Mi familia y yo viajamos a Punta Cana gracias a Annac. El plan todo incluido fue espectacular. Ya estamos planeando el siguiente viaje.",
    date: "Hace 5 días",
  },
  {
    name: "Jorge Herrera",
    initials: "JH",
    avatar: "https://i.pravatar.cc/100?img=12",
    text: "Gran experiencia comprando nuestro paquete a Norteamérica. Nos consiguieron excelentes tarifas y el soporte durante el viaje fue impecable.",
    date: "Hace 2 meses",
  },
];

interface CasoExito {
  id: string;
  nombre_cliente: string;
  url_captura: string;
  prioridad: number;
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.004 24.004 0 0 0 0 21.56l7.98-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function ReviewCard({ review }: { review: typeof reviews[0] }) {
  return (
    <div className="min-w-[300px] sm:min-w-0 bg-card rounded-xl border border-border/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.avatar} alt={review.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {review.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-foreground">{review.name}</p>
            <p className="text-xs text-muted-foreground">{review.date}</p>
          </div>
        </div>
        <GoogleLogo />
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
        "{review.text}"
      </p>
    </div>
  );
}

export function SocialProofSection() {
  const [casos, setCasos] = useState<CasoExito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("casos_exito")
      .select("id, nombre_cliente, url_captura, prioridad")
      .order("prioridad", { ascending: false })
      .then(({ data }) => {
        if (data) setCasos(data);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-background" id="testimonios">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Google Reviews */}
        <div className="mb-16 lg:mb-20">
          <div className="flex items-center gap-3 mb-2">
            <GoogleLogo />
            <span className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
              Google Reviews
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Nuestros viajeros <span className="text-primary">nos recomiendan</span>
          </h2>
          <div className="flex items-center gap-2 mb-8">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">4.9</span>
            <span className="text-sm text-muted-foreground">· 120+ reseñas</span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0">
            {reviews.map((review) => (
              <div key={review.name} className="snap-start shrink-0 w-[85vw] sm:w-auto">
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>

        {/* Success Cases */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Lo que nuestros viajeros <span className="text-primary">comparten con nosotros</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Capturas reales de experiencias inolvidables
          </p>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="snap-start shrink-0 w-[65vw] sm:w-auto">
                    <Skeleton className="w-full aspect-[9/16] rounded-2xl" />
                  </div>
                ))
              : casos.map((caso) => (
                  <div
                    key={caso.id}
                    className="snap-start shrink-0 w-[65vw] sm:w-auto group cursor-pointer"
                  >
                    <div className="overflow-hidden rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300">
                      <img
                        src={caso.url_captura}
                        alt={`Experiencia de ${caso.nombre_cliente}`}
                        loading="lazy"
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground text-center">
                      {caso.nombre_cliente}
                    </p>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
