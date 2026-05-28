// Deep links a plataformas de reserva. Donde la plataforma soporta afiliados,
// se inyecta el ID del usuario (revenue). Sin ID, son links de búsqueda normales.

const enc = encodeURIComponent;

/** Google Flights — siempre confiable, sin afiliado. */
export function googleFlightsUrl(origin: string, destination: string, date?: string): string {
  const parts = [`Flights to ${destination}`, origin ? `from ${origin}` : "", date ? `on ${date}` : ""].filter(Boolean);
  return `https://www.google.com/travel/flights?q=${enc(parts.join(" "))}`;
}

/** Skyscanner — búsqueda al destino; agrega associateid si hay afiliado. */
export function skyscannerUrl(destination: string, affiliate?: string): string {
  const base = `https://www.skyscanner.net/transport/flights-to/${enc(destination.toLowerCase().replace(/\s+/g, "-"))}/`;
  return affiliate ? `${base}?associateid=${enc(affiliate)}` : base;
}

/** Booking.com — afiliado vía `aid`. */
export function bookingUrl(destination: string, checkin?: string, checkout?: string, affiliate?: string): string {
  const params = new URLSearchParams({ ss: destination });
  if (checkin) params.set("checkin", checkin);
  if (checkout) params.set("checkout", checkout);
  if (affiliate) params.set("aid", affiliate);
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

/** GetYourGuide — tours; afiliado vía `partner_id`. */
export function getYourGuideUrl(destination: string, affiliate?: string): string {
  const params = new URLSearchParams({ q: destination });
  if (affiliate) params.set("partner_id", affiliate);
  return `https://www.getyourguide.com/s/?${params.toString()}`;
}
