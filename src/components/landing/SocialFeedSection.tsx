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
              Síguenos en Instagram y TikTok
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
            Síguenos en Instagram y TikTok
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <a
              href="https://www.instagram.com/annac_viajesatumedida?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <Instagram className="h-5 w-5" />
              @annac_viajesatumedida
            </a>
            <a
              href="https://www.tiktok.com/@annac_viajesatumedida"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <svg 
                className="h-5 w-5 fill-current" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
              @annac_viajesatumedida
            </a>
          </div>
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
