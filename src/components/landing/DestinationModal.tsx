import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";

const destinationImages: Record<string, string> = {
  // Colombia
  "Cartagena": "/cartagena.webp",
  "Santa Marta": "/santamarta.webp",
  "San Andrés": "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&h=400&fit=crop",
  "Eje Cafetero": "/ejecafetero.webp",
  "Huila": "/huila.webp",
  "Medellín": "/medellin.webp",
  "Amazonas": "/amazonas.webp",
  "Coveñas": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop",
  "Cali": "/cali.webp",
  "La Guajira": "/guajira.webp",
  "Pacífico Colombiano": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=400&fit=crop",
  
  // Caribe & Otros
  "Punta Cana": "/puntacana.webp",
  "Santo Domingo": "/santodomingo.webp",
  "Tulum (México)": "/tulum.webp",
  "Riviera Maya": "/rivieramaya.webp",
  "Aruba": "/aruba.webp",
  "Curazao": "/curazao.webp",
  "Bocas del Toro": "/bocasdeltoro.webp",
  "Ciudad de Panamá": "/Panama.webp",
  "Costa Rica": "/costarica.webp",
  "Guatemala": "/guatemala.webp",
  "Honduras": "/honduras.webp",
  "Cancún": "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&h=400&fit=crop",
  "París": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=400&fit=crop",
  "Roma": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=400&fit=crop",
  "Tokio": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=400&fit=crop",

  // Centro América y México
  "Ciudad de Guatemala (Guatemala)": "/guatemala.webp", 
  "San José & Puerto Viejo (Costa Rica)": "/costarica.webp", 
  "Managua & Corn Islands (Nicaragua)": "/nicaragua.webp", 
  "San Salvador (El Salvador)": "/salvador.webp", 
  "CDMX (México)": "/mexico.webp", 
  "Guadalajara (México)": "/guadalajara.webp", 
  "La Habana (Cuba)": "/cuba.webp", 

  // Sudamérica
  "Lima, Cusco & Machu Picchu (Perú)": "https://images.pexels.com/photos/1570610/pexels-photo-1570610.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Machu Picchu
  "Quito & Galápagos (Ecuador)": "/Galapagos.webp", // Tortuga Galápagos
  "La Paz & Salar de Uyuni (Bolivia)": "/salar.webp", // Salar de Uyuni
  "Buenos Aires (Argentina)": "/buenosaires.webp", // Caminito, La Boca
  "Santiago (Chile)": "/santiago.webp", // Skyline Santiago y Los Andes
  "Río de Janeiro (Brasil)": "https://images.pexels.com/photos/2868242/pexels-photo-2868242.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Cristo Redentor
  "Montevideo (Uruguay)": "/montevideo.webp", // Palacio Salvo Montevideo
  "Asunción (Paraguay)": "/asuncion.webp", // Panteón de los Héroes

  // Norteamérica
  "Miami": "/miami.webp", // Miami Beach y skyline
  "Orlando": "/orlando.webp", // Orlando Skyline 
  "New York": "https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // New York Skyline
  "Los Ángeles": "/angeles.webp", // Palmeras en LA
  "Las Vegas (EE.UU.)": "https://images.pexels.com/photos/415999/pexels-photo-415999.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Letrero Welcome y Strip
  "Toronto": "https://images.pexels.com/photos/1519088/pexels-photo-1519088.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // CN Tower
  "Vancouver": "https://images.pexels.com/photos/2088206/pexels-photo-2088206.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Burrard Inlet / Downtown 
  "Quebec (Canadá)": "https://images.pexels.com/photos/5431614/pexels-photo-5431614.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Fairmont Le Château

  // Europa Occidental
  "París (Francia)": "https://images.pexels.com/photos/161853/eiffel-tower-paris-france-tower-161853.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Torre Eiffel
  "Barcelona & Madrid (España)": "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Park Güell
  "Londres, Edimburgo (Reino Unido)": "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Big Ben, London
  "Ámsterdam & Róterdam (Países Bajos)": "/holanda.webp", // Canales de Amsterdam
  "Lisboa (Portugal)": "/lisboa.webp", // Tranvía de Lisboa

  // Europa Central y Oriental
  "Roma, Venecia & Toscana (Italia)": "https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Coliseo Romano
  "Múnich & Castillo de Neuschwanstein (Alemania)": "/castillo.webp", // Castillo Neuschwanstein
  "Praga (República Checa)": "/praga.webp", // Puente de Carlos, Praga
  "Budapest (Hungría)": "https://images.pexels.com/photos/8993208/pexels-photo-8993208.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Parlamento de Budapest
  "Atenas (Grecia)": "/atenas.webp", // Acrópolis
  "Dubrovnik (Croacia)": "https://images.pexels.com/photos/3847703/pexels-photo-3847703.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Dubrovnik old town

  // Asia
  "Tokio (Japón)": "/tokio.webp", // Calle neón en Tokio
  "Bangkok & Phuket (Tailandia)": "https://images.pexels.com/photos/1682748/pexels-photo-1682748.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Templo Tailandés
  "Bali (Indonesia)": "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Puertas de Bali
  "Singapur; Delhi & Agra (India)": "https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Taj Mahal
  "Dubái (EAU)": "/dubai.webp", // Burj Al Arab
  "Seúl (Corea del Sur)": "https://images.pexels.com/photos/237211/pexels-photo-237211.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Gyeongbokgung
  "Hanoi (Vietnam)": "/hanoi.webp", // Bahía de Ha Long, Vietnam

  // Oceanía
  "Sídney & Gran Barrera de Coral (Australia)": "/Sídney.webp", // Ópera de Sídney
  "Fiyi; Bora Bora & Tahití (Polinesia Francesa)": "https://images.pexels.com/photos/1483054/pexels-photo-1483054.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop", // Cabañas sobre el agua
};

const fallbackImage = "https://images.pexels.com/photos/2087391/pexels-photo-2087391.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop";

interface DestinationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destinationName: string;
  onQuote: (destinationName: string) => void;
}

export function DestinationModal({ open, onOpenChange, destinationName, onQuote }: DestinationModalProps) {
  const image = destinationImages[destinationName] || fallbackImage;

  const handleQuote = () => {
    onOpenChange(false);
    onQuote(destinationName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl">
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <img
            src={image}
            alt={destinationName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <h2 className="absolute bottom-4 left-6 text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            {destinationName}
          </h2>
        </div>

        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="sr-only">{destinationName}</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground leading-relaxed">
              Descubre los encantos de <span className="font-semibold text-foreground">{destinationName}</span>. 
              Un viaje diseñado a tu medida con las mejores experiencias, alojamiento y transporte incluidos.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleQuote}
              className="flex-1 h-12 bg-coral hover:bg-coral/90 text-coral-foreground rounded-xl text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Plane className="h-4 w-4 sm:h-5 sm:w-5 mr-2 shrink-0" />
              Cotizar con agente
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 h-12 border-2 border-primary text-primary hover:bg-primary/5 rounded-xl text-sm sm:text-base font-semibold shadow-sm transition-all duration-300"
            >
              <a href="https://reservas.annacviajesatumedida.com/" target="_blank" rel="noopener noreferrer">
                Cotiza en línea
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
