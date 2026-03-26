import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { DestinationsSection } from "@/components/landing/DestinationsSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { QuoteFormSection } from "@/components/landing/QuoteFormSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <HeroSection />
      <ServicesSection />
      <DestinationsSection />
      <AboutSection />
      <QuoteFormSection />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
