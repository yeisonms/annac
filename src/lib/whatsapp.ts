export const ANNAC_WHATSAPP_NUMBER = "573027050952";
export const QUOTE_REDIRECT_STORAGE_KEY = "annac_quote_redirect_payload";
export const QUOTE_REDIRECT_PATH = "/cotizacion/whatsapp";

export interface QuoteRedirectPayload {
  nombre: string;
  email: string;
  telefono: string;
  destino: string;
  fechaIda: string;
  fechaRegreso: string;
  numeroPersonas: number;
}

export const buildWhatsAppUrl = (message?: string, phone = ANNAC_WHATSAPP_NUMBER) => {
  const baseUrl = `https://wa.me/${phone}`;

  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
};

export const buildQuoteWhatsAppMessage = (payload: QuoteRedirectPayload) =>
  `Hola Annac Viajes, mi nombre es ${payload.nombre.trim()}. Me gustaría cotizar un viaje a ${payload.destino} para ${payload.numeroPersonas} personas, del ${payload.fechaIda} al ${payload.fechaRegreso}. Mi correo es ${payload.email.trim()}.`;

export const isInsideIframe = () => {
  if (typeof window === "undefined") return false;

  return window.top !== window.self;
};

export const navigateTopLevel = (url: string) => {
  if (typeof window === "undefined") return;

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_top";
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  try {
    if (window.top) {
      window.top.location.href = url;
      return;
    }
  } catch {
    window.location.href = url;
    return;
  }

  window.location.href = url;
};

export const buildInternalUrl = (path: string) => {
  if (typeof window === "undefined") return path;

  return new URL(path, window.location.origin).toString();
};

export const openWhatsAppLink = (message?: string) => {
  const url = buildWhatsAppUrl(message);

  if (isInsideIframe()) {
    navigateTopLevel(url);
    return;
  }

  openExternalLink(url);
};

export const saveQuoteRedirectPayload = (payload: QuoteRedirectPayload) => {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(QUOTE_REDIRECT_STORAGE_KEY, JSON.stringify(payload));
};

export const getQuoteRedirectPayload = (): QuoteRedirectPayload | null => {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(QUOTE_REDIRECT_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as QuoteRedirectPayload;
  } catch {
    return null;
  }
};

export const clearQuoteRedirectPayload = () => {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(QUOTE_REDIRECT_STORAGE_KEY);
};

export const openExternalLink = (url: string) => {
  if (typeof window === "undefined") return null;

  const popup = window.open(url, "_blank", "noopener,noreferrer");

  if (popup) {
    popup.opener = null;
    return popup;
  }

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  return null;
};