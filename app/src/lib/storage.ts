import type { Trip, Currency } from "../types";
import type { DestinationCategory } from "../destinations/types";
import type { Airport } from "./airports";

const TRIPS_KEY = "viajes:trips:v1";
const CURRENCY_KEY = "viajes:currency";
const DISCOVER_KEY = "viajes:discover-filters:v1";
const ORIGIN_KEY = "viajes:origin:v1";

export type DiscoverFilters = {
  /** Mes del viaje (1-12). */
  month: number;
  duration: number;
  selectedCategories: DestinationCategory[];
  minTemp: number;
  maxTemp: number;
  /** 0 = sin preferencia (húmedo OK) … 100 = lo más seco posible. */
  rainPref: number;
  maxCostTier: "budget" | "mid" | "expensive";
  maxFlightHours: number | "any";
  includeRegions: string[];
  search: string;
  onlyWishlist: boolean;
  viewMode: "list" | "map";
};

export function loadDiscoverFilters(): Partial<DiscoverFilters> | null {
  try {
    const raw = localStorage.getItem(DISCOVER_KEY);
    return raw ? (JSON.parse(raw) as Partial<DiscoverFilters>) : null;
  } catch {
    return null;
  }
}

export function saveDiscoverFilters(f: DiscoverFilters): void {
  try {
    localStorage.setItem(DISCOVER_KEY, JSON.stringify(f));
  } catch {
    /* storage lleno o deshabilitado — no es crítico */
  }
}

export function loadTrips(): Trip[] | null {
  try {
    const raw = localStorage.getItem(TRIPS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Trip[];
  } catch {
    return null;
  }
}

export function saveTrips(trips: Trip[]): void {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

/** Moneda guardada, o null si el usuario nunca eligió una (para derivar un default). */
export function loadCurrency(): Currency | null {
  const saved = localStorage.getItem(CURRENCY_KEY);
  if (saved === "USD" || saved === "EUR" || saved === "ARS" || saved === "BRL" || saved === "GBP" || saved === "MXN" || saved === "CLP") {
    return saved;
  }
  return null;
}

export function saveCurrency(c: Currency): void {
  localStorage.setItem(CURRENCY_KEY, c);
}

/** Aeropuerto de origen elegido (o autodetectado). null = no configurado. */
export function loadOrigin(): Airport | null {
  try {
    const raw = localStorage.getItem(ORIGIN_KEY);
    return raw ? (JSON.parse(raw) as Airport) : null;
  } catch {
    return null;
  }
}

export function saveOrigin(origin: Airport | null): void {
  try {
    if (origin) localStorage.setItem(ORIGIN_KEY, JSON.stringify(origin));
    else localStorage.removeItem(ORIGIN_KEY);
  } catch {
    /* no crítico */
  }
}
