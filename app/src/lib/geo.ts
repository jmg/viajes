// Utilidades geográficas: distancia entre coordenadas y estimación de horas de vuelo.
import { AIRPORTS } from "./airports";
import type { Airport } from "./airports";

const EARTH_KM = 6371;

/** Distancia en km entre dos puntos (haversine). */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

/**
 * Horas de vuelo estimadas a partir de la distancia: velocidad de crucero ~800 km/h
 * más medio hora de rodaje/ascenso/descenso. Redondeado a la media hora. Es una
 * aproximación pensada para comparar destinos, no un horario real.
 */
export function flightHoursForDistance(km: number): number {
  const hours = km / 800 + 0.5;
  return Math.max(1, Math.round(hours * 2) / 2);
}

/** Aeropuerto más cercano a una coordenada (para autodetección por geolocalización). */
export function nearestAirport(lat: number, lng: number): Airport {
  let best = AIRPORTS[0];
  let bestKm = Infinity;
  for (const a of AIRPORTS) {
    const km = distanceKm(lat, lng, a.lat, a.lng);
    if (km < bestKm) { bestKm = km; best = a; }
  }
  return best;
}
