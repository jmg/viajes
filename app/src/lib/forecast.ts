// Open-Meteo (gratis, sin auth) para clima real de las fechas del viaje.
// - Forecast (próximos 16 días): https://api.open-meteo.com/v1/forecast
// - Archive ERA5 (1940-presente): https://archive-api.open-meteo.com/v1/era5

const CACHE_PREFIX = "viajes:wx:";
const CACHE_TTL_MS = 6 * 3600_000; // 6 horas

export type DailyWeather = {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipMm: number;
  /** Variabilidad (1σ) — solo se setea cuando viene de promedio multi-año */
  tempMaxStdev?: number;
  tempMinStdev?: number;
  /** Probabilidad de día lluvioso (>1mm) entre los años promediados — 0..1 */
  rainyDayProb?: number;
  /** Cuántos años se promediaron (solo multi-año) */
  yearsAveraged?: number;
};

type Cached = { ts: number; data: DailyWeather[] };

function cacheKey(kind: "fc" | "hist", lat: number, lng: number, start: string, end: string): string {
  return `${CACHE_PREFIX}${kind}:${lat.toFixed(2)},${lng.toFixed(2)}:${start}:${end}`;
}

function readCache(key: string): DailyWeather[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw) as Cached;
    if (Date.now() - obj.ts < CACHE_TTL_MS) return obj.data;
  } catch { /* ignore */ }
  return null;
}

function writeCache(key: string, data: DailyWeather[]): void {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch { /* ignore */ }
}

async function fetchWeather(url: string): Promise<DailyWeather[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const d = json.daily;
  return (d.time as string[]).map((date, i) => ({
    date,
    weatherCode: d.weather_code?.[i] ?? 0,
    tempMax: Math.round(d.temperature_2m_max[i]),
    tempMin: Math.round(d.temperature_2m_min[i]),
    precipMm: Math.round(d.precipitation_sum?.[i] ?? 0),
  }));
}

export async function fetchForecast(lat: number, lng: number): Promise<DailyWeather[]> {
  const key = cacheKey("fc", lat, lng, "", "16d");
  const cached = readCache(key);
  if (cached) return cached;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&forecast_days=16&timezone=auto`;
  const data = await fetchWeather(url);
  writeCache(key, data);
  return data;
}

export async function fetchHistorical(lat: number, lng: number, start: string, end: string): Promise<DailyWeather[]> {
  const key = cacheKey("hist", lat, lng, start, end);
  const cached = readCache(key);
  if (cached) return cached;
  const url = `https://archive-api.open-meteo.com/v1/era5?latitude=${lat}&longitude=${lng}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;
  const data = await fetchWeather(url);
  writeCache(key, data);
  return data;
}

/** Promedia las últimas N vueltas a estas fechas (años anteriores) — más robusto que un solo año. */
export async function fetchMultiYearAverage(
  lat: number, lng: number, start: string, end: string, yearsBack: number,
): Promise<DailyWeather[]> {
  const shift = (iso: string, years: number) => {
    const d = new Date(iso + "T00:00:00Z");
    d.setUTCFullYear(d.getUTCFullYear() + years);
    return d.toISOString().slice(0, 10);
  };
  // El archivo ERA5 va con unos días de retraso: nunca pedimos rangos cuyo fin
  // caiga en el futuro (o muy reciente), porque devuelve HTTP 400. Si el viaje
  // está en el futuro, retrocedemos más años para igual juntar `yearsBack` completos.
  const cutoffMs = Date.now() - 6 * 86_400_000;
  const ranges: { s: string; e: string }[] = [];
  for (let i = 1; ranges.length < yearsBack && i <= yearsBack + 6; i++) {
    const s = shift(start, -i);
    const e = shift(end, -i);
    if (new Date(e + "T00:00:00Z").getTime() <= cutoffMs) ranges.push({ s, e });
  }
  const settled = await Promise.allSettled(ranges.map((r) => fetchHistorical(lat, lng, r.s, r.e)));
  const yearsData = settled
    .filter((r): r is PromiseFulfilledResult<DailyWeather[]> => r.status === "fulfilled")
    .map((r) => r.value);
  if (yearsData.length === 0) throw new Error("sin datos históricos disponibles");

  // Agrupar por MM-DD para promediar entre años
  const byMonthDay = new Map<string, DailyWeather[]>();
  for (const yr of yearsData) {
    for (const day of yr) {
      const md = day.date.slice(5); // "MM-DD"
      const arr = byMonthDay.get(md) ?? [];
      arr.push(day);
      byMonthDay.set(md, arr);
    }
  }

  // Generar fechas objetivo del rango original y emitir promedios + stats.
  const out: DailyWeather[] = [];
  const startMs = new Date(start + "T00:00:00Z").getTime();
  const endMs = new Date(end + "T00:00:00Z").getTime();
  for (let t = startMs; t <= endMs; t += 86_400_000) {
    const date = new Date(t).toISOString().slice(0, 10);
    const samples = byMonthDay.get(date.slice(5));
    if (!samples?.length) continue;
    const maxs = samples.map((x) => x.tempMax);
    const mins = samples.map((x) => x.tempMin);
    const rains = samples.map((x) => x.precipMm);
    const rainy = rains.filter((r) => r >= 1).length;
    out.push({
      date,
      tempMax: Math.round(mean(maxs)),
      tempMin: Math.round(mean(mins)),
      precipMm: Math.round(mean(rains)),
      weatherCode: mostCommonCode(samples.map((x) => x.weatherCode)),
      tempMaxStdev: Math.round(stdev(maxs)),
      tempMinStdev: Math.round(stdev(mins)),
      rainyDayProb: rainy / samples.length,
      yearsAveraged: samples.length,
    });
  }
  return out;
}

function mean(arr: number[]): number {
  return arr.reduce((s, x) => s + x, 0) / arr.length;
}

function stdev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

function mostCommonCode(codes: number[]): number {
  const counts = new Map<number, number>();
  for (const c of codes) counts.set(c, (counts.get(c) ?? 0) + 1);
  let best = 0;
  let bestCount = 0;
  for (const [c, n] of counts) if (n > bestCount) { best = c; bestCount = n; }
  return best;
}

// Códigos WMO 4677 (estándar) → ícono + descripción, como los mapea Open-Meteo y
// la mayoría de las apps de clima. https://open-meteo.com/en/docs#weathervariables
const WMO: Record<number, { icon: string; label: string }> = {
  0: { icon: "☀️", label: "Despejado" },
  1: { icon: "🌤", label: "Mayormente despejado" },
  2: { icon: "⛅", label: "Parcialmente nublado" },
  3: { icon: "☁️", label: "Nublado" },
  45: { icon: "🌫", label: "Niebla" },
  48: { icon: "🌫", label: "Niebla con escarcha" },
  51: { icon: "🌦", label: "Llovizna ligera" },
  53: { icon: "🌦", label: "Llovizna moderada" },
  55: { icon: "🌧", label: "Llovizna intensa" },
  56: { icon: "🌧", label: "Llovizna helada" },
  57: { icon: "🌧", label: "Llovizna helada intensa" },
  61: { icon: "🌦", label: "Lluvia ligera" },
  63: { icon: "🌧", label: "Lluvia moderada" },
  65: { icon: "🌧", label: "Lluvia fuerte" },
  66: { icon: "🌧", label: "Lluvia helada" },
  67: { icon: "🌧", label: "Lluvia helada fuerte" },
  71: { icon: "🌨", label: "Nevada ligera" },
  73: { icon: "🌨", label: "Nevada moderada" },
  75: { icon: "❄️", label: "Nevada fuerte" },
  77: { icon: "🌨", label: "Granos de nieve" },
  80: { icon: "🌦", label: "Chubascos ligeros" },
  81: { icon: "🌧", label: "Chubascos moderados" },
  82: { icon: "⛈", label: "Chubascos violentos" },
  85: { icon: "🌨", label: "Chubascos de nieve" },
  86: { icon: "❄️", label: "Chubascos de nieve fuertes" },
  95: { icon: "⛈", label: "Tormenta" },
  96: { icon: "⛈", label: "Tormenta con granizo" },
  99: { icon: "⛈", label: "Tormenta con granizo fuerte" },
};

export function weatherEmoji(code: number): string {
  return WMO[code]?.icon ?? "🌤";
}

export function weatherLabel(code: number): string {
  return WMO[code]?.label ?? "—";
}
