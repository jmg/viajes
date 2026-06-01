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
