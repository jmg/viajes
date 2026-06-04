// Deep links a plataformas de reserva. Donde la plataforma soporta afiliados,
// se inyecta el ID configurado en config/affiliates.ts (revenue). Sin ID, son
// links de búsqueda normales — la app funciona igual.

import { AFFILIATES } from "../config/affiliates";

const enc = encodeURIComponent;
const slug = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "-");

/** Google Flights — siempre confiable, sin programa de afiliados. */
export function googleFlightsUrl(origin: string, destination: string, date?: string): string {
  const parts = [`Flights to ${destination}`, origin ? `from ${origin}` : "", date ? `on ${date}` : ""].filter(Boolean);
  return `https://www.google.com/travel/flights?q=${enc(parts.join(" "))}`;
}

/** Skyscanner — búsqueda al destino; agrega associateid si hay afiliado. */
export function skyscannerUrl(destination: string, affiliate = AFFILIATES.skyscanner): string {
  const base = `https://www.skyscanner.net/transport/flights-to/${enc(slug(destination))}/`;
  return affiliate ? `${base}?associateid=${enc(affiliate)}` : base;
}

/** WayAway (vuelos, red Travelpayouts) — `marker`. Suele pagar mejor que Skyscanner. */
export function wayAwayUrl(origin: string, destination: string, marker = AFFILIATES.travelpayoutsMarker): string {
  const params = new URLSearchParams({ origin, destination });
  if (marker) params.set("marker", marker);
  return `https://wayaway.io/flights?${params.toString()}`;
}

/** Booking.com — afiliado vía `aid`. */
export function bookingUrl(destination: string, checkin?: string, checkout?: string, affiliate = AFFILIATES.bookingAid): string {
  const params = new URLSearchParams({ ss: destination });
  if (checkin) params.set("checkin", checkin);
  if (checkout) params.set("checkout", checkout);
  if (affiliate) params.set("aid", affiliate);
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

/** GetYourGuide — tours; afiliado vía `partner_id`. */
export function getYourGuideUrl(destination: string, affiliate = AFFILIATES.getYourGuide): string {
  const params = new URLSearchParams({ q: destination });
  if (affiliate) params.set("partner_id", affiliate);
  return `https://www.getyourguide.com/s/?${params.toString()}`;
}

/** Heymondo — seguro de viaje. Afiliado vía `ref`. El de mayor margen por venta. */
export function insuranceUrl(start?: string, end?: string, ref = AFFILIATES.heymondo): string {
  const params = new URLSearchParams();
  if (start) params.set("date_from", start);
  if (end) params.set("date_to", end);
  if (ref) params.set("ref", ref);
  const qs = params.toString();
  return `https://heymondo.com/${qs ? `?${qs}` : ""}`;
}

/** Airalo — eSIM con datos en el destino. Afiliado vía `aff`. */
export function esimUrl(destination: string, aff = AFFILIATES.airalo): string {
  const params = new URLSearchParams({ q: destination });
  if (aff) params.set("aff", aff);
  return `https://www.airalo.com/?${params.toString()}`;
}

/** DiscoverCars — alquiler de autos. Afiliado vía `a_aid`. */
export function carRentalUrl(destination: string, pickup?: string, dropoff?: string, aid = AFFILIATES.discoverCars): string {
  const params = new URLSearchParams({ location: destination });
  if (pickup) params.set("date_from", pickup);
  if (dropoff) params.set("date_to", dropoff);
  if (aid) params.set("a_aid", aid);
  return `https://www.discovercars.com/?${params.toString()}`;
}
