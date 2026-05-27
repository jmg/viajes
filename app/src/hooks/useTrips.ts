import { useCallback, useEffect, useState } from "react";
import type { Trip } from "../types";
import { trips as seedTrips } from "../trips";
import { loadTrips, saveTrips } from "../lib/storage";

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips() ?? [...seedTrips]);

  useEffect(() => {
    saveTrips(trips);
  }, [trips]);

  const upsert = useCallback((trip: Trip) => {
    setTrips((curr) => {
      const idx = curr.findIndex((t) => t.id === trip.id);
      if (idx >= 0) {
        const next = curr.slice();
        next[idx] = trip;
        return next;
      }
      return [...curr, trip];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setTrips((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const restoreSeeds = useCallback(() => {
    setTrips((curr) => {
      const existingIds = new Set(curr.map((t) => t.id));
      const toAdd = seedTrips.filter((t) => !existingIds.has(t.id));
      return [...curr, ...toAdd];
    });
  }, []);

  const replaceAll = useCallback((next: Trip[]) => {
    setTrips(next);
  }, []);

  return { trips, upsert, remove, restoreSeeds, replaceAll };
}
