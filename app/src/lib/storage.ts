import type { Trip, Currency } from "../types";

const TRIPS_KEY = "viajes:trips:v1";
const CURRENCY_KEY = "viajes:currency";

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

export function loadCurrency(): Currency {
  const saved = localStorage.getItem(CURRENCY_KEY);
  if (saved === "USD" || saved === "EUR" || saved === "ARS" || saved === "BRL" || saved === "GBP" || saved === "MXN" || saved === "CLP") {
    return saved;
  }
  return "USD";
}

export function saveCurrency(c: Currency): void {
  localStorage.setItem(CURRENCY_KEY, c);
}
