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
  const fetches: Promise<DailyWeather[]>[] = [];
  for (let i = 1; i <= yearsBack; i++) {
    fetches.push(fetchHistorical(lat, lng, shift(start, -i), shift(end, -i)));
  }
  const yearsData = await Promise.all(fetches);

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

// WMO weather codes → emoji + label.
// https://open-meteo.com/en/docs#weathervariables
export function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "🌤";
  if (code === 45 || code === 48) return "🌫";
  if (code >= 51 && code <= 57) return "🌦";
  if (code >= 61 && code <= 67) return "🌧";
  if (code >= 71 && code <= 77) return "🌨";
  if (code >= 80 && code <= 86) return "🌧";
  if (code >= 95) return "⛈";
  return "🌤";
}

export function weatherLabel(code: number): string {
  if (code === 0) return "Despejado";
  if (code <= 3) return "Parcial nublado";
  if (code === 45 || code === 48) return "Niebla";
  if (code >= 51 && code <= 57) return "Llovizna";
  if (code >= 61 && code <= 67) return "Lluvia";
  if (code >= 71 && code <= 77) return "Nieve";
  if (code >= 80 && code <= 86) return "Chubascos";
  if (code === 95) return "Tormenta";
  if (code >= 96) return "Tormenta con granizo";
  return "—";
}
