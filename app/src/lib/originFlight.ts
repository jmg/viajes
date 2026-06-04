import type { Destination } from "../destinations/types";
import type { Airport } from "./airports";
import { distanceKm, flightHoursForDistance } from "./geo";

/**
 * Horas de vuelo desde el aeropuerto de origen elegido hasta el destino.
 * Si falta el origen o las coordenadas del destino, cae al valor de referencia
 * desde EZE que trae el catálogo (comportamiento previo).
 */
export function flightHoursFromOrigin(dest: Destination, origin: Airport | null): number | undefined {
  if (origin && dest.lat != null && dest.lng != null) {
    return flightHoursForDistance(distanceKm(origin.lat, origin.lng, dest.lat, dest.lng));
  }
  return dest.flightHoursFromEze;
}
