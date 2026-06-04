import { useEffect, useMemo, useState } from "react";
import type { Trip } from "../types";
import type { Destination } from "../destinations/types";
import { findDestination } from "../destinations/match";
import { daysUntilStart, daysUntilEnd } from "../lib/status";
import { loadTripWeather, weatherModeForTrip } from "../lib/forecast";
import type { DailyWeather } from "../lib/forecast";

/** Devuelve el clima de una fecha, priorizando el destino que coincide con el lugar del día. */
export type WeatherLookup = (date: string, location?: string) => DailyWeather | undefined;

/**
 * Carga el clima de cada destino del viaje (los que están en el catálogo y tienen
 * coordenadas) y expone un lookup por fecha. Para un día con `location`, prioriza
 * el clima de ese destino; si no, usa el primero que tenga dato para esa fecha.
 */
export function useTripWeather(trip: Trip): WeatherLookup {
  const dests = useMemo<Destination[]>(() => {
    const seen = new Set<string>();
    const out: Destination[] = [];
    for (const name of trip.destinations) {
      const d = findDestination(name);
      if (d && d.lat != null && d.lng != null && !seen.has(d.id)) {
        seen.add(d.id);
        out.push(d);
      }
    }
    return out;
  }, [trip.destinations]);

  const mode = weatherModeForTrip(daysUntilStart(trip), daysUntilEnd(trip));

  const [byDest, setByDest] = useState<Map<string, Map<string, DailyWeather>>>(new Map());

  useEffect(() => {
    if (!mode || dests.length === 0) {
      setByDest(new Map());
      return;
    }
    let cancelled = false;
    Promise.all(
      dests.map(async (d) => {
        try {
          const data = await loadTripWeather(mode, d.id, d.lat!, d.lng!, trip.startDate, trip.endDate);
          return [d.id, new Map(data.map((w) => [w.date, w]))] as const;
        } catch {
          return [d.id, new Map<string, DailyWeather>()] as const;
        }
      }),
    ).then((entries) => {
      if (!cancelled) setByDest(new Map(entries));
    });
    return () => { cancelled = true; };
  }, [mode, dests, trip.startDate, trip.endDate]);

  return useMemo<WeatherLookup>(() => {
    return (date, location) => {
      const loc = location ? findDestination(location) : undefined;
      if (loc) {
        const w = byDest.get(loc.id)?.get(date);
        if (w) return w;
      }
      for (const perDate of byDest.values()) {
        const w = perDate.get(date);
        if (w) return w;
      }
      return undefined;
    };
  }, [byDest]);
}
