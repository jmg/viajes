// Configuración de marketing de afiliados.
//
// Pegá acá tus IDs cuando te des de alta en cada programa (todos son gratis).
// Mientras estén vacíos, los links siguen funcionando como búsquedas normales
// (sin comisión) — la app nunca se rompe por falta de ID.
//
// También se pueden inyectar en el build con variables de entorno (útil para
// no commitear los IDs): VITE_AFF_BOOKING, VITE_AFF_GYG, etc.
//
// ⚠️ Importante: el nombre exacto del parámetro de cada plataforma puede variar
// según tu cuenta/red (p. ej. Travelpayouts usa `marker`). Verificá el formato
// del deep-link en el panel de cada programa y ajustá lib/booking.ts si hace falta.

const env = import.meta.env as Record<string, string | undefined>;

export const AFFILIATES = {
  /** Booking.com — parámetro `aid`. Hoteles. ~25-40% de la comisión de Booking. */
  bookingAid: env.VITE_AFF_BOOKING ?? "",
  /** GetYourGuide — parámetro `partner_id`. Tours y actividades. ~8%. */
  getYourGuide: env.VITE_AFF_GYG ?? "",
  /** Skyscanner — parámetro `associateid`. Vuelos. */
  skyscanner: env.VITE_AFF_SKYSCANNER ?? "",
  /** Travelpayouts/WayAway — `marker`. Red que cubre vuelos, hoteles, autos, etc. */
  travelpayoutsMarker: env.VITE_AFF_TP_MARKER ?? "",
  /** Heymondo — seguro de viaje. Lo que más paga por venta (~10-25%). */
  heymondo: env.VITE_AFF_HEYMONDO ?? "",
  /** Airalo — eSIM / datos en el destino. ~8-15%. */
  airalo: env.VITE_AFF_AIRALO ?? "",
  /** DiscoverCars — alquiler de autos. ~$10-15 por reserva. */
  discoverCars: env.VITE_AFF_DISCOVERCARS ?? "",
} as const;

export type AffiliateKey = keyof typeof AFFILIATES;

/** True si hay al menos un ID cargado (para mostrar disclosure de afiliados, etc.). */
export const hasAnyAffiliate = Object.values(AFFILIATES).some(Boolean);
