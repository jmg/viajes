import { useEffect, useMemo, useState } from "react";
import type { Trip } from "../types";
import { DESTINATIONS } from "../destinations/data";
import { fetchForecast, fetchHistorical, weatherEmoji, weatherLabel } from "../lib/forecast";
import type { DailyWeather } from "../lib/forecast";
import { daysUntilStart, daysUntilEnd } from "../lib/status";
import { formatDate } from "../lib/format";

type Props = { trip: Trip };
type Mode = "forecast" | "historical" | "prior_year";

function matchDestination(name: string) {
  const lower = name.toLowerCase().trim();
  return DESTINATIONS.find((d) => {
    const dn = d.name.toLowerCase();
    return dn === lower || d.id === lower || d.id === lower.replace(/\s+/g, "-") || dn.includes(lower) || lower.includes(dn);
  });
}

function shiftYears(iso: string, years: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

export function WeatherSection({ trip }: Props) {
  const dest = useMemo(
    () => trip.destinations.map(matchDestination).find((d) => d?.lat != null && d?.lng != null) ?? null,
    [trip.destinations],
  );

  const dStart = daysUntilStart(trip);
  const dEnd = daysUntilEnd(trip);

  let mode: Mode | null = null;
  let queryStart = trip.startDate;
  let queryEnd = trip.endDate;

  if (dStart <= 16 && dEnd >= 0) {
    mode = "forecast";
  } else if (dEnd < 0 && dEnd >= -90) {
    mode = "historical";
  } else if (dStart > 16) {
    // Viaje muy lejos para forecast → mostramos lo que pasó el año pasado.
    mode = "prior_year";
    queryStart = shiftYears(trip.startDate, -1);
    queryEnd = shiftYears(trip.endDate, -1);
  }

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
        : fetchHistorical(dest.lat, dest.lng, queryStart, queryEnd);
    p.then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [mode, dest, queryStart, queryEnd]);

  if (!mode) return null;
  if (!dest) return null;

  const filtered = data?.filter((d) => d.date >= queryStart && d.date <= queryEnd) ?? [];

  const title =
    mode === "forecast" ? `🌤 Pronóstico — ${dest.name}` :
    mode === "historical" ? `📜 Tiempo histórico — ${dest.name}` :
    `📅 El año pasado en estas fechas — ${dest.name}`;

  const subtitle =
    mode === "prior_year" ? (
      <p className="settings-hint">Comparación con la misma semana del año pasado para tener expectativa real, en vez de promedios mensuales.</p>
    ) : null;

  return (
    <div className="weather-section">
      <h3>{title}</h3>
      {subtitle}
      {loading && <p className="settings-hint">Cargando datos de Open-Meteo…</p>}
      {error && (
        <p className="form-error">No se pudo cargar ({error}). Las normales climáticas en Descubrir siguen disponibles.</p>
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
