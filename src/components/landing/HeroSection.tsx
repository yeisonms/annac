import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <img
        src={heroBg}
        alt="Destino paradisíaco"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
          Descubre el mundo{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(197,71%,62%)] to-[hsl(197,71%,82%)]">
            a tu medida
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          Viajes personalizados, sin estrés y ajustados a tu presupuesto.
          <br className="hidden sm:block" />
          Más de 10 años haciendo sueños realidad.
        </p>
        <Button
          size="lg"
          className="bg-coral hover:bg-coral/90 text-coral-foreground text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          asChild
        >
          <a href="#cotizar">Cotizar mi viaje ahora</a>
        </Button>
      </div>

      {/* Scroll indicator */}
      <a
        href="#servicios"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
      >
        <ChevronDown className="h-8 w-8" />
      </a>
    </section>
  );
}
