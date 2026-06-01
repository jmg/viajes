import { useEffect, useMemo, useState } from "react";
import type { Trip } from "../types";
import { DESTINATIONS } from "../destinations/data";
import { fetchForecast, fetchHistorical, weatherEmoji, weatherLabel } from "../lib/forecast";
import type { DailyWeather } from "../lib/forecast";
import { daysUntilStart, daysUntilEnd } from "../lib/status";
import { formatDate } from "../lib/format";

type Props = { trip: Trip };

function matchDestination(name: string) {
  const lower = name.toLowerCase().trim();
  return DESTINATIONS.find((d) => {
    const dn = d.name.toLowerCase();
    return dn === lower || d.id === lower || d.id === lower.replace(/\s+/g, "-") || dn.includes(lower) || lower.includes(dn);
  });
}

export function WeatherSection({ trip }: Props) {
  const dest = useMemo(
    () => trip.destinations.map(matchDestination).find((d) => d?.lat != null && d?.lng != null) ?? null,
    [trip.destinations],
  );

  const dStart = daysUntilStart(trip);
  const dEnd = daysUntilEnd(trip);

  let mode: "forecast" | "historical" | null = null;
  if (dStart <= 16 && dEnd >= 0) mode = "forecast";
  else if (dEnd < 0 && dEnd >= -90) mode = "historical";

  const [data, setData] = useState<DailyWeather[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setError(null);
    if (!mode || !dest?.lat || !dest?.lng) return;
    setLoading(true);
    const p =
      mode === "forecast"
        ? fetchForecast(dest.lat, dest.lng)
        : fetchHistorical(dest.lat, dest.lng, trip.startDate, trip.endDate);
    p.then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [mode, dest, trip.startDate, trip.endDate]);

  if (!mode) return null;
  if (!dest) return null;

  const filtered = data?.filter((d) => d.date >= trip.startDate && d.date <= trip.endDate) ?? [];

  return (
    <div className="weather-section">
      <h3>
        {mode === "forecast" ? "🌤 Pronóstico" : "📜 Tiempo histórico"} — {dest.name}
      </h3>
      {loading && <p className="settings-hint">Cargando datos de Open-Meteo…</p>}
      {error && (
        <p className="form-error">No se pudo cargar el pronóstico ({error}). Mostramos solo las normales climáticas.</p>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="weather-grid">
          {filtered.map((d) => (
            <div key={d.date} className="weather-day" title={weatherLabel(d.weatherCode)}>
              <div className="weather-date">{formatDate(d.date)}</div>
              <div className="weather-emoji">{weatherEmoji(d.weatherCode)}</div>
              <div className="weather-temp">{d.tempMin}° / {d.tempMax}°</div>
              <div className="weather-rain">{d.precipMm} mm</div>
            </div>
          ))}
        </div>
      )}
      <p className="settings-hint">
        Fuente: Open-Meteo ({mode === "forecast" ? "Forecast API" : "ERA5 Archive"}) · cacheado 6h local · gratis y sin keys.
      </p>
    </div>
  );
}
