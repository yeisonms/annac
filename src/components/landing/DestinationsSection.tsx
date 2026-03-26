const destinations = [
  {
    name: "Colombia",
    img: "https://images.unsplash.com/photo-1583997052103-b4a1cb974ce5?w=600&h=400&fit=crop",
  },
  {
    name: "El Caribe",
    img: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&h=400&fit=crop",
  },
  {
    name: "Norteamérica",
    img: "https://images.unsplash.com/photo-1485738422979-f5c462d49f04?w=600&h=400&fit=crop",
  },
  {
    name: "Europa",
    img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&h=400&fit=crop",
  },
  {
    name: "Asia",
    img: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&h=400&fit=crop",
  },
  {
    name: "Sudamérica",
    img: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&h=400&fit=crop",
  },
];

export function DestinationsSection() {
  return (
    <section id="destinos" className="py-20 lg:py-28 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-coral mb-3">
            Destinos destacados
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            ¿A dónde quieres ir?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((d) => (
            <div
              key={d.name}
              className="group relative overflow-hidden rounded-xl aspect-[3/2] cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={d.img}
                alt={d.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-xl font-bold text-white">{d.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
