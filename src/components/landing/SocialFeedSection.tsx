import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Play, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Reel {
  id: number;
  portada_url: string;
  instagram_url: string;
  vistas: string;
}

export function SocialFeedSection() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      const { data, error } = await supabase
        .from("reels_destacados")
        .select("id, portada_url, instagram_url, vistas")
        .eq("activo", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReels(data);
      }
      setLoading(false);
    };
    fetchReels();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
              Síguenos en Instagram
            </h2>
            <Skeleton className="h-6 w-40 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[9/16] w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reels.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Síguenos en Instagram
          </h2>
          <a 
            href="https://www.instagram.com/annac_viajesatumedida?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <Instagram className="h-5 w-5" />
            @annac_viajesatumedida
          </a>
        </div>

        {/* Grid de Videos Dinámico */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reels.map((reel) => (
            <a 
              key={reel.id} 
              href={reel.instagram_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative block aspect-[9/16] overflow-hidden rounded-2xl bg-card shadow-sm hover:shadow-xl transition-all duration-500"
            >
              {/* Imagen de fondo cover vertical (Portada de Supabase) */}
              <img 
                src={reel.portada_url} 
                alt="Reel Destacado" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Overlays oscuros para contraste */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
              
              {/* Botón central Play */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                  <Play className="h-6 w-6 text-white group-hover:text-black ml-1 transition-colors" />
                </div>
              </div>

              {/* Estadísticas (Vistas Supabase) */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white drop-shadow-md">
                <div className="flex items-center gap-1.5 font-medium">
                  <Heart className="h-5 w-5 fill-white/20" />
                  <span className="text-sm">{reel.vistas || "0"}</span>
                </div>
                <Instagram className="h-5 w-5 opacity-70" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
