import { Link } from "react-router-dom";
import { destinationCategories } from "@/data/destinationsData";

export function DestinationsSection() {
  return (
    <section id="destinos" className="py-20 lg:py-28 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-coral mb-3">
            Destinos destacados
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Destinos Destacados
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinationCategories.map((d) => (
            <Link
              key={d.slug}
              to={`/destinos/${d.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-[3/2] cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={d.img}
                alt={`Paquetes y viajes a ${d.name} - Annac Viajes`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-xl font-bold text-white">{d.name}</h3>
                <p className="text-sm text-white/70 mt-1">
                  {d.destinations.length} destinos
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
