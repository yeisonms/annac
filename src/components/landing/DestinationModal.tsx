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
  "Cartagena": "https://images.unsplash.com/photo-1583997052103-b4a1cb974ce5?w=800&h=400&fit=crop",
  "Santa Marta": "https://images.unsplash.com/photo-1624811072711-4fe765954e63?w=800&h=400&fit=crop",
  "San Andrés": "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&h=400&fit=crop",
  "Eje Cafetero": "https://images.unsplash.com/photo-1616089338274-1dccefacd0a1?w=800&h=400&fit=crop",
  "Huila": "https://images.unsplash.com/photo-1563220556-91e847cbb650?w=800&h=400&fit=crop",
  "Medellín": "https://images.unsplash.com/photo-1582236940847-a7eb2b6df2d5?w=800&h=400&fit=crop",
  "Amazonas": "https://images.unsplash.com/photo-1542385151-efd9000785a0?w=800&h=400&fit=crop",
  "Coveñas": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop",
  "Cali": "https://images.unsplash.com/photo-1571261565557-4148b111db0d?w=800&h=400&fit=crop",
  "La Guajira": "https://images.unsplash.com/photo-1536640581454-e0c1dbfa2642?w=800&h=400&fit=crop",
  "Pacífico Colombiano": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=400&fit=crop",
  
  // Caribe & Otros
  "Punta Cana": "https://images.unsplash.com/photo-1535916707207-35f97e715e1c?w=800&h=400&fit=crop",
  "Cancún": "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&h=400&fit=crop",
  "París": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=400&fit=crop",
  "Roma": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=400&fit=crop",
  "Tokio": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=400&fit=crop",
};

const fallbackImage = "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=400&fit=crop";

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

          <Button
            onClick={handleQuote}
            size="lg"
            className="w-full bg-coral hover:bg-coral/90 text-coral-foreground rounded-xl py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plane className="h-5 w-5 mr-2" />
            Cotizar viaje a {destinationName}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
