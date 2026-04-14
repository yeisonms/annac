import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface CasoExito {
  id: string;
  cliente_nombre: string;
  destino: string;
  tipo: "foto" | "video";
  imagen_url: string;
  video_url: string;
  testimonio: string;
}

export default function CasosExito() {
  const [galleryImages, setGalleryImages] = useState<CasoExito[]>([]);
  const [testimonialVideos, setTestimonialVideos] = useState<CasoExito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("casos_exito_imagenes")
      .select("*")
      .eq("activo", true)
      .order("created_at", { ascending: false });

    if (data) {
      setGalleryImages(data.filter(i => i.tipo === 'foto'));
      setTestimonialVideos(data.filter(i => i.tipo === 'video'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      
      {/* A. Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-6 animate-in slide-in-from-bottom-4 duration-700">
            Viajes Inolvidables, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(197,71%,62%)] to-[hsl(197,71%,40%)]">Clientes Felices</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground animate-in slide-in-from-bottom-6 duration-700 delay-150">
            Descubre las experiencias reales de nuestros viajeros por el mundo.
          </p>
        </div>
      </section>

      {/* B. Sección de Galería Fotográfica (Estilo Mosaico) */}
      <section className="pb-24 px-4 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className={`break-inside-avoid w-full rounded-xl ${i % 2 === 0 ? 'h-64' : 'h-80'}`} />
            ))}
          </div>
        ) : galleryImages.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Más fotos de viajes increíbles irán apareciendo aquí pronto.</p>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {galleryImages.map((caso) => (
              <div key={caso.id} className="break-inside-avoid overflow-hidden rounded-xl bg-muted/20 relative group">
                <img 
                  src={caso.imagen_url} 
                  alt={`Experiencia viajera en ${caso.destino}`} 
                  className="w-full h-auto object-cover rounded-xl hover:scale-105 transition-transform duration-500 cursor-pointer shadow-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 rounded-xl pointer-events-none">
                  <p className="text-white font-bold text-sm sm:text-base">{caso.cliente_nombre}</p>
                  <p className="text-white/80 text-xs sm:text-sm">{caso.destino}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* C. Sección de Video-Testimonios */}
      <section className="py-24 px-4 bg-muted/30 border-t border-border flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Lo que dicen nuestros viajeros</h2>
            <div className="w-20 h-1.5 bg-primary mx-auto mt-6 rounded-full" />
          </div>
          
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex flex-col rounded-2xl overflow-hidden border">
                    <Skeleton className="aspect-video w-full rounded-none" />
                    <div className="p-8 space-y-4 flex-grow bg-card">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[80%]" />
                      <Skeleton className="h-4 w-32 mt-6 mx-auto" />
                    </div>
                  </div>
               ))}
             </div>
          ) : testimonialVideos.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Más historias inolvidables en forma de vídeo llegarán pronto.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonialVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="group flex flex-col bg-card rounded-2xl overflow-hidden hover:-translate-y-2 shadow-sm hover:shadow-xl transition-all duration-300 border border-border"
                  onClick={() => video.video_url && window.open(video.video_url, '_blank')}
                >
                  {/* Thumbnail 16:9 con Play */}
                  <div className="relative aspect-video w-full overflow-hidden cursor-pointer bg-muted">
                    <img 
                      src={video.imagen_url} 
                      alt={`Testimonio de ${video.cliente_nombre}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Overlay interactivo */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-xl group-hover:bg-white group-hover:text-primary transition-all duration-300 group-hover:scale-110">
                        <Play className="h-6 w-6 ml-1 fill-current" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Cuerpo de la Tarjeta */}
                  <div className={`p-8 flex flex-col flex-grow text-center ${video.video_url ? "cursor-pointer" : ""}`}>
                    <p className="text-muted-foreground italic mb-6 flex-grow leading-relaxed">
                      "{video.testimonio}"
                    </p>
                    <p className="text-foreground">
                      <span className="font-bold">{video.cliente_nombre}</span>
                      <br />
                      <span className="text-sm text-primary font-medium">{video.destino}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mantenemos el Footer global al final */}
      <LandingFooter />
    </div>
  );
}
