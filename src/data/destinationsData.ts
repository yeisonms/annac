export interface DestinationCategory {
  slug: string;
  name: string;
  img: string;
  destinations: string[];
}

export const destinationCategories: DestinationCategory[] = [
  {
    slug: "colombia",
    name: "Colombia",
    img: "/destinos/colombia.webp",
    destinations: [
      "Cartagena", "Santa Marta", "San Andrés", "Eje Cafetero", "Huila",
      "Medellín", "Amazonas", "Coveñas", "Cali", "La Guajira", "Pacífico Colombiano",
    ],
  },
  {
    slug: "caribe",
    name: "Caribe",
    img: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&h=400&fit=crop",
    destinations: [
      "Punta Cana", "Santo Domingo", "Cancún", "Riviera Maya",
      "Tulum (México)", "Aruba", "Curazao", "Bocas del Toro",
      "Ciudad de Panamá", "Costa Rica", "Guatemala", "Honduras",
    ],
  },
  {
    slug: "centroamerica",
    name: "Centro América",
    img: "https://images.unsplash.com/photo-1518182170546-07661fd94144?w=600&h=400&fit=crop",
    destinations: [
      "Ciudad de Guatemala (Guatemala)", "San José & Puerto Viejo (Costa Rica)",
      "Managua & Corn Islands (Nicaragua)", "San Salvador (El Salvador)",
      "CDMX (México)", "Guadalajara (México)", "La Habana (Cuba)",
    ],
  },
  {
    slug: "sudamerica",
    name: "Sudamérica",
    img: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&h=400&fit=crop",
    destinations: [
      "Lima, Cusco & Machu Picchu (Perú)", "Quito & Galápagos (Ecuador)",
      "La Paz & Salar de Uyuni (Bolivia)", "Buenos Aires (Argentina)",
      "Santiago (Chile)", "Río de Janeiro (Brasil)",
      "Montevideo (Uruguay)", "Asunción (Paraguay)",
    ],
  },
  {
    slug: "norteamerica",
    name: "Norteamérica",
    img: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=400&fit=crop",
    destinations: [
      "Miami", "Orlando", "New York", "Los Ángeles",
      "Las Vegas (EE.UU.)", "Toronto", "Vancouver", "Quebec (Canadá)",
    ],
  },
  {
    slug: "europa-occidental",
    name: "Europa Occidental",
    img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&h=400&fit=crop",
    destinations: [
      "París (Francia)", "Barcelona & Madrid (España)",
      "Londres, Edimburgo (Reino Unido)", "Ámsterdam & Róterdam (Países Bajos)",
      "Lisboa (Portugal)",
    ],
  },
  {
    slug: "europa-central-oriental",
    name: "Europa Central y Oriental",
    img: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&h=400&fit=crop",
    destinations: [
      "Roma, Venecia & Toscana (Italia)", "Múnich & Castillo de Neuschwanstein (Alemania)",
      "Praga (República Checa)", "Budapest (Hungría)",
      "Atenas (Grecia)", "Dubrovnik (Croacia)",
    ],
  },
  {
    slug: "asia",
    name: "Asia",
    img: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&h=400&fit=crop",
    destinations: [
      "Tokio (Japón)", "Bangkok & Phuket (Tailandia)", "Bali (Indonesia)",
      "Singapur; Delhi & Agra (India)", "Dubái (EAU)",
      "Seúl (Corea del Sur)", "Hanoi (Vietnam)",
    ],
  },
  {
    slug: "oceania",
    name: "Oceanía",
    img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&h=400&fit=crop",
    destinations: [
      "Sídney & Gran Barrera de Coral (Australia)",
      "Fiyi; Bora Bora & Tahití (Polinesia Francesa)",
    ],
  },
];
