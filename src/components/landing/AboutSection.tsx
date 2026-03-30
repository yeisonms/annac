import { Shield, Award, Users } from "lucide-react";

export function AboutSection() {
  return (
    <section id="nosotros" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"
              alt="Vista desde las nubes"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--deep))]/40 to-transparent" />
            <div className="absolute bottom-6 left-6 bg-card/90 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg">
              <p className="text-xs text-muted-foreground">Registro Nacional de Turismo</p>
              <p className="text-lg font-bold text-primary">RNT 228975</p>
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-coral mb-3">
              Sobre nosotros
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Más de 10 años creando experiencias inolvidables
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              En <strong className="text-foreground">Annac Viajes a tu medida</strong>, adaptamos
              cada detalle al presupuesto, tiempos y preferencias del viajero. Nuestra misión es
              hacer que cada aventura sea única, accesible y libre de estrés.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Shield, label: "Confianza", val: "+10 años" },
                { icon: Users, label: "Viajeros felices", val: "+5,000" },
                { icon: Award, label: "Destinos", val: "+50 países" },
              ].map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <stat.icon className="h-8 w-8 text-primary mx-auto sm:mx-0 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stat.val}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
