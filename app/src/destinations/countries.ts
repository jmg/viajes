// Perfiles vacacionales por país, DERIVADOS del catálogo de destinos.
// No hay datos hardcodeados por país: todo (clima, mejores meses, costo, vuelo,
// visa, qué tipo de viaje es) se agrega a partir de los destinos de cada país.

import { DESTINATIONS } from "./data";
import type { Destination, DestinationCategory, CostTier, VisaStatus } from "./types";

// Normaliza nombres duplicados/equivalentes del catálogo a uno canónico.
const NAME_FIX: Record<string, string> = {
  "EE.UU.": "Estados Unidos",
  "Emiratos Árabes": "Emiratos Árabes Unidos",
};

export const normalizeCountry = (c: string): string => NAME_FIX[c] ?? c;

export type MonthAvg = { highC: number; lowC: number; rainMm: number };

export type CountrySummary = {
  country: string;
  flag: string;
  regions: string[];
  count: number;
};

export type CountryProfile = {
  country: string;
  flag: string;
  regions: string[];
  destinations: Destination[];
  count: number;
  /** 12 promedios mensuales (ene…dic) del país. */
  monthly: MonthAvg[];
  bestMonths: number[];
  warmestMonth: number;
  coolestMonth: number;
  wettestMonth: number;
  driestMonth: number;
  tempRange: { min: number; max: number };
  costTier: CostTier;
  costPerDay?: { min: number; max: number };
  flightHoursFromEze?: { min: number; max: number };
  visa?: VisaStatus;
  categories: DestinationCategory[];
};

const mode = <T extends string>(arr: T[]): T | undefined => {
  const c: Record<string, number> = {};
  for (const x of arr) c[x] = (c[x] ?? 0) + 1;
  let best: T | undefined; let n = -1;
  for (const x of arr) if (c[x] > n) { n = c[x]; best = x; }
  return best;
};

/** Lista de países (normalizados) con su bandera, regiones y cantidad de destinos. */
export function listCountries(): CountrySummary[] {
  const map = new Map<string, CountrySummary>();
  for (const d of DESTINATIONS) {
    const country = normalizeCountry(d.country);
    const cur = map.get(country);
    if (cur) {
      cur.count++;
      if (!cur.regions.includes(d.region)) cur.regions.push(d.region);
    } else {
      map.set(country, { country, flag: d.flag, regions: [d.region], count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));
}

/** Destinos de un país (acepta el nombre canónico o cualquier alias). */
export function destinationsForCountry(name: string): Destination[] {
  const target = normalizeCountry(name);
  return DESTINATIONS.filter((d) => normalizeCountry(d.country) === target);
}

/** Perfil vacacional agregado de un país. null si no existe. */
export function countryProfile(name: string): CountryProfile | null {
  const country = normalizeCountry(name);
  const dests = destinationsForCountry(country);
  if (dests.length === 0) return null;

  // Promedios mensuales del país.
  const monthly: MonthAvg[] = [];
  for (let m = 0; m < 12; m++) {
    let hi = 0, lo = 0, rain = 0, n = 0;
    for (const d of dests) {
      const c = d.climate[m];
      if (!c) continue;
      hi += c.highC; lo += c.lowC; rain += c.rainMm; n++;
    }
    monthly.push(n ? { highC: hi / n, lowC: lo / n, rainMm: rain / n } : { highC: 0, lowC: 0, rainMm: 0 });
  }

  // Mejores meses: frecuencia entre los destinos.
  const monthFreq = new Array(12).fill(0);
  for (const d of dests) for (const bm of d.bestMonths ?? []) monthFreq[bm - 1]++;
  const bestMonths = monthFreq
    .map((f, i) => ({ f, m: i + 1 }))
    .filter((x) => x.f > 0)
    .sort((a, b) => b.f - a.f || a.m - b.m)
    .slice(0, 3)
    .map((x) => x.m)
    .sort((a, b) => a - b);

  // Extremos climáticos.
  let warmestMonth = 1, coolestMonth = 1, wettestMonth = 1, driestMonth = 1;
  monthly.forEach((c, i) => {
    if (c.highC > monthly[warmestMonth - 1].highC) warmestMonth = i + 1;
    if (c.lowC < monthly[coolestMonth - 1].lowC) coolestMonth = i + 1;
    if (c.rainMm > monthly[wettestMonth - 1].rainMm) wettestMonth = i + 1;
    if (c.rainMm < monthly[driestMonth - 1].rainMm) driestMonth = i + 1;
  });
  const tempRange = {
    min: Math.round(Math.min(...monthly.map((c) => c.lowC))),
    max: Math.round(Math.max(...monthly.map((c) => c.highC))),
  };

  // Costo: tier más común + rango promedio de costo diario.
  const costTier = mode(dests.map((d) => d.costTier)) ?? "mid";
  const withCost = dests.filter((d) => d.costPerDayUsd);
  const costPerDay = withCost.length
    ? {
        min: Math.round(withCost.reduce((s, d) => s + d.costPerDayUsd!.min, 0) / withCost.length),
        max: Math.round(withCost.reduce((s, d) => s + d.costPerDayUsd!.max, 0) / withCost.length),
      }
    : undefined;

  // Vuelo desde EZE: rango entre destinos que lo tengan.
  const fh = dests.map((d) => d.flightHoursFromEze).filter((x): x is number => typeof x === "number");
  const flightHoursFromEze = fh.length ? { min: Math.min(...fh), max: Math.max(...fh) } : undefined;

  const visa = mode(dests.map((d) => d.visaForArgentines).filter((x): x is VisaStatus => !!x));

  // Categorías más frecuentes (qué tipo de viaje es el país).
  const catFreq: Record<string, number> = {};
  for (const d of dests) for (const c of d.categories) catFreq[c] = (catFreq[c] ?? 0) + 1;
  const categories = (Object.keys(catFreq) as DestinationCategory[])
    .sort((a, b) => catFreq[b] - catFreq[a])
    .slice(0, 5);

  return {
    country,
    flag: dests[0].flag,
    regions: [...new Set(dests.map((d) => d.region))],
    destinations: dests,
    count: dests.length,
    monthly,
    bestMonths,
    warmestMonth,
    coolestMonth,
    wettestMonth,
    driestMonth,
    tempRange,
    costTier,
    costPerDay,
    flightHoursFromEze,
    visa,
    categories,
  };
}
