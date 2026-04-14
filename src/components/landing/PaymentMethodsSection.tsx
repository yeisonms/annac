import paymentPlansepare from "@/assets/payment-plansepare.png";
import paymentPse from "@/assets/payment-pse.png";
import paymentAmex from "@/assets/payment-amex.png";
import paymentDiners from "@/assets/payment-diners.png";
import paymentVisa from "@/assets/payment-visa.png";
import paymentMastercard from "@/assets/payment-mastercard.png";
import paymentNequi from "@/assets/payment-nequi.png";
import paymentEfectivo from "@/assets/payment-efectivo.png";

const paymentMethods = [
  { name: "Pague en cuotas Sin Intereses", image: paymentPlansepare },
  { name: "PSE", image: paymentPse },
  { name: "American Express", image: paymentAmex },
  { name: "Diners Club", image: paymentDiners },
  { name: "Visa", image: paymentVisa },
  { name: "Mastercard", image: paymentMastercard },
  { name: "Nequi", image: paymentNequi },
  { name: "Efectivo", image: paymentEfectivo },
];

export function PaymentMethodsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Conozca nuestros <span className="text-primary">medios de pago</span>
          </h2>
          <p className="text-muted-foreground mt-2">
            Las mejores opciones para realizar su compra
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className="flex flex-col items-center gap-3 group"
            >
              <div className="w-20 h-20 rounded-xl bg-background shadow-sm border border-border/50 flex items-center justify-center p-3 transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
                <img
                  src={method.image}
                  alt={method.name}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs text-muted-foreground text-center font-medium">
                {method.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
