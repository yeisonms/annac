import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroBg from "@/assets/hero-bg.jpg";

const SLIDES = [
  { id: 1, image: heroBg, alt: "Playa paradisíaca" },
  { id: 2, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop", alt: "Destino de aventura en la montaña" },
  { id: 3, image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1920&auto=format&fit=crop", alt: "Ciudad histórica y cultural" }
];

export function HeroSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    
    // Obtener el slide inicial
    setCurrent(api.selectedScrollSnap());
    
    // Escuchar cambios de slide
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section
      id="inicio"
      className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Carrusel de fondo */}
      <Carousel
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
          }),
        ]}
        opts={{
          loop: true,
        }}
        className="absolute inset-0 w-full h-full"
      >
        <CarouselContent className="h-full ml-0">
          {SLIDES.map((slide) => (
            <CarouselItem key={slide.id} className="min-w-full h-screen pl-0 relative">
              <img
                src={slide.image}
                alt={slide.alt}
                className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-1000"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Capa oscura superpuesta a todo el carrusel para legibilidad constante */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none" />

        {/* Controles del Carrusel */}
        <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-8 pointer-events-none z-20">
          <CarouselPrevious className="pointer-events-auto relative left-0 translate-x-0 bg-black/20 text-white hover:bg-black/50 border-none w-12 h-12 hidden sm:flex" />
          <CarouselNext className="pointer-events-auto relative right-0 translate-x-0 bg-black/20 text-white hover:bg-black/50 border-none w-12 h-12 hidden sm:flex" />
        </div>
      </Carousel>

      {/* Contenido (Overlay estático centrado) */}
      <div className="relative z-30 text-center px-4 max-w-4xl mx-auto mt-16 pointer-events-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6 animate-in slide-in-from-bottom-6 duration-700">
          Descubre el mundo{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(197,71%,62%)] to-[hsl(197,71%,82%)]">
            a tu medida
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-150">
          Viajes personalizados, sin estrés y ajustados a tu presupuesto.
          <br className="hidden sm:block" />
          Más de 10 años haciendo sueños realidad.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 duration-700 delay-300">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-coral hover:bg-coral/90 text-coral-foreground text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            asChild
          >
            <a href="#cotizar">Cotizar con un agente</a>
          </Button>
          
          <Button
            size="lg"
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-sm text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            asChild
          >
            <a href="https://reservas.annacviajesatumedida.com/" target="_blank" rel="noopener noreferrer">Cotiza en línea</a>
          </Button>
        </div>
      </div>

      {/* Indicadores de viñetas (Dots) */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2.5 z-30 pointer-events-auto">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              current === index
                ? "bg-white scale-125 shadow-sm"
                : "bg-white/40 hover:bg-white/70"
            }`}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Ir a diapositiva ${index + 1}`}
          />
        ))}
      </div>

      {/* Indicador de Desplazamiento */}
      <a
        href="#servicios"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce z-30 pointer-events-auto"
      >
        <ChevronDown className="h-8 w-8" />
      </a>
    </section>
  );
}
