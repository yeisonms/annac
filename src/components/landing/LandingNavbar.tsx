import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoAnnac from "@/assets/logo-annac.png";
import logoLight from "/logo1.png";

const navLinks = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Destinos", href: "/#destinos" },
  { label: "Blog", href: "/blog" },
  { label: "Casos de éxito", href: "/casos-exito" },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60]">
      <div className="bg-slate-900 py-2 px-4 text-center text-sm font-medium text-white shadow-sm tracking-wide">
        Más de 10 años de experiencia en turismo
      </div>
      <nav className="bg-card/90 backdrop-blur-md border-b border-border shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/#inicio" className="flex items-center gap-2 shrink-0">
            <img src={logoLight} alt="Annac Viajes" className="h-10 w-auto" />
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Button size="sm" className="bg-coral hover:bg-coral/90 text-coral-foreground transition-all" asChild>
              <a href="/#cotizar">Cotizar con agente</a>
            </Button>
            <Button variant="outline" size="sm" className="transition-all" asChild>
              <a href="https://www.aviatour.com" target="_blank" rel="noopener noreferrer">Cotiza en línea</a>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-card border-b border-border shadow-lg animate-in slide-in-from-top-2">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-muted-foreground hover:text-primary py-2 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t mt-2">
              <Button size="sm" className="bg-coral hover:bg-coral/90 text-coral-foreground" asChild>
                <a href="/#cotizar" onClick={() => setMobileOpen(false)}>Cotizar con agente</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.aviatour.com" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}>Cotiza en línea</a>
              </Button>
            </div>
          </div>
        </div>
      )}
      </nav>
    </div>
  );
}
