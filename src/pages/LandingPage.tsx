import { MessageCircle } from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { DestinationsSection } from "@/components/landing/DestinationsSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { QuoteFormSection } from "@/components/landing/QuoteFormSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PaymentMethodsSection } from "@/components/landing/PaymentMethodsSection";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <HeroSection />
      <ServicesSection />
      <DestinationsSection />
      <AboutSection />
      <QuoteFormSection />
      <PaymentMethodsSection />
      <LandingFooter />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/573001234567"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(142,71%,45%)] hover:bg-[hsl(142,71%,38%)] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
};

export default LandingPage;
