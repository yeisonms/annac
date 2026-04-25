import { useState } from "react";
import { PlayCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface Video {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnail: string;
}

const videos: Video[] = [
  {
    id: "v1",
    youtubeId: "UAccpOZmmzQ",
    title: "Viaja a Guatemala con ANNAC",
    description: "Descubre los paisajes más impactantes de Guatemala. ¿Sueñas con los volcanes de Antigua, el amanecer en Tikal o los colores de Atitlán? ",
    thumbnail: "/volcan.png",
  },
  {
    id: "v2",
    youtubeId: "GGUIthx4Cjw",
    title: "Conoce el Amazonas con ANNAC",
    description: "¿Sueñas con visitar el Amazonas? Colombia y Perú te esperan con selvas vibrantes, ríos majestuosos y una biodiversidad que te dejará sin aliento. ",
    thumbnail: "/amazonas.webp",
  },
  {
    id: "v3",
    youtubeId: "B3F2UbMOPTQ",
    title: "Tu viaje perfecto a Palomino empieza con ANNAC",
    description: "Palomino tiene una magia única, y en ANNAC te ayudamos a descubrirla a tu ritmo.",
    thumbnail: "/palomino.png",
  },
];

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
}

function VideoCard({ video, onPlay }: VideoCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onPlay(video)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Reproducir video: ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover transition-transform duration-700 ${hovered ? "scale-110" : "scale-100"}`}
          loading="lazy"
        />

        {/* Dark overlay */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${hovered ? "opacity-60" : "opacity-30"}`} />

        {/* Play button */}
        <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${hovered ? "scale-110" : "scale-100"}`}>
          <div className="relative flex items-center justify-center">
            {/* Pulse ring */}
            <span className="absolute inline-flex h-20 w-20 rounded-full bg-white/30 animate-ping" />
            <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-white/90 shadow-2xl backdrop-blur-sm">
              <PlayCircle className="h-9 w-9 text-primary fill-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-left">
        <h3 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow">
          {video.title}
        </h3>
        <p className="text-white/80 text-sm line-clamp-2 leading-relaxed">
          {video.description}
        </p>
      </div>
    </button>
  );
}

export function VideoSection() {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const handlePlay = (video: Video) => setActiveVideo(video);
  const handleClose = () => setActiveVideo(null);

  // Only real YouTube IDs get iframes; placeholders keep the facade
  const isRealYouTubeId = (id: string) =>
    /^[a-zA-Z0-9_-]{11}$/.test(id);

  return (
    <section className="py-16 lg:py-24 bg-muted/30" id="experiencias">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-4">
            Experiencias reales
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            Vive la{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[hsl(197,71%,72%)]">
              Experiencia
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Mira cómo transformamos cada viaje en un recuerdo que dura toda la vida.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} onPlay={handlePlay} />
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden rounded-2xl bg-black border-none">
          <DialogTitle className="sr-only">
            {activeVideo?.title}
          </DialogTitle>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-50 flex items-center justify-center h-8 w-8 rounded-full bg-black/60 text-white hover:bg-white/20 transition-colors"
            aria-label="Cerrar video"
          >
            <X className="h-4 w-4" />
          </button>

          {/* iframe — only loads when modal opens */}
          <div className="w-full aspect-video">
            {activeVideo && isRealYouTubeId(activeVideo.youtubeId) ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              // Placeholder for demo cards without a real YouTube ID
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 text-white/60 gap-3">
                <PlayCircle className="h-16 w-16 opacity-30" />
                <p className="text-sm">Reemplaza el ID de YouTube para activar el video</p>
                <code className="text-xs bg-white/10 px-3 py-1.5 rounded font-mono">{activeVideo?.youtubeId}</code>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
