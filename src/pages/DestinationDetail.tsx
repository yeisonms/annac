import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Plane } from "lucide-react";
import { destinationCategories } from "@/data/destinationsData";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

const DestinationDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = destinationCategories.find((c) => c.slug === slug);

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-2xl font-bold text-foreground mb-4">Destino no encontrado</h1>
        <Link to="/#destinos" className="text-primary hover:underline">
          Volver a destinos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero banner */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        <img
          src={category.img}
          alt={category.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto">
          <Link
            to="/#destinos"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a destinos
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {category.name}
          </h1>
        </div>
      </div>

      {/* Destinations list */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-muted-foreground mb-8">
          Explora {category.destinations.length} destinos increíbles en {category.name}.
          ¡Cotiza tu viaje y vive la experiencia!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.destinations.map((dest) => (
            <a
              key={dest}
              href="/#cotizar"
              className="group flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {dest}
                </h3>
              </div>
              <Plane className="h-4 w-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/#cotizar"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            <Plane className="h-5 w-5" />
            Cotizar mi viaje
          </a>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default DestinationDetail;
