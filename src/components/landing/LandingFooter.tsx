import { Instagram, Mail, Phone } from "lucide-react";
import logoAnnac from "@/assets/logo-annac.png";
import logoDark from "/logo2.png";

export function LandingFooter() {
  return (
    <footer className="bg-deep text-deep-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <img src={logoDark} alt="Annac Viajes" className="h-16 w-auto mb-4" />
            <p className="text-sm text-white/70 leading-relaxed">
              Viajes personalizados a tu medida. Más de 10 años de experiencia haciendo sueños realidad.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white/90">
              Enlaces
            </h4>
            <ul className="space-y-2">
              {["Inicio", "Servicios", "Destinos", "Nosotros", "Cotizar"].map((l) => (
                <li key={l}>
                  <a
                    href={`#${l.toLowerCase()}`}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white/90">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Mail className="h-4 w-4 text-white/40" />
                annacviajesatumedida@gmail.com
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Phone className="h-4 w-4 text-white/40" />
                +57 302 7050952
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Instagram className="h-4 w-4 text-white/40" />
                @annac_viajesatumedida
              </li>
            </ul>
          </div>

          {/* Payment & Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white/90">
              Métodos de pago
            </h4>
            <div className="flex gap-3 mb-6">
              {["Visa", "MC", "PSE", "Nequi"].map((m) => (
                <span
                  key={m}
                  className="text-[10px] font-bold uppercase bg-white/10 rounded px-2.5 py-1.5 text-white/70"
                >
                  {m}
                </span>
              ))}
            </div>
            <p className="text-xs text-white/40">RNT 228975</p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Annac Viajes a tu medida. Todos los derechos reservados.
          </p>
          <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">
            Política de privacidad
          </a>
        </div>
      </div>
    </footer>
  );
}
