export const ANNAC_WHATSAPP_NUMBER = "573027050952";

export const buildWhatsAppUrl = (message?: string, phone = ANNAC_WHATSAPP_NUMBER) => {
  const baseUrl = `https://wa.me/${phone}`;

  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
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

export const openPendingExternalTab = () => {
  if (typeof window === "undefined") return null;

  const popup = window.open("", "_blank", "noopener,noreferrer");

  if (popup) {
    popup.opener = null;
  }

  return popup;
};