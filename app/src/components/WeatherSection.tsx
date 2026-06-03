import { useEffect, useMemo, useState } from "react";
import type { Trip } from "../types";
import { DESTINATIONS } from "../destinations/data";
import { fetchForecast, fetchHistorical, fetchMultiYearAverage, fetchPrecomputedAverage, weatherEmoji } from "../lib/forecast";
import type { DailyWeather } from "../lib/forecast";
import { daysUntilStart, daysUntilEnd } from "../lib/status";
import { formatDate } from "../lib/format";
import { InfoTip } from "./InfoTip";

const PRIOR_YEARS = 5;

type Props = {
  trip: Trip;
  /** Si está, muestra ~maxDays días salteados cada N (para previsualizar un mes entero). */
  sampleEvery?: number;
  maxDays?: number;
};
type Mode = "forecast" | "historical" | "prior_year";

/** Ícono coherente con los datos: en promedios sale de la probabilidad de lluvia, no de un código promediado. */
function dayIcon(d: DailyWeather): string {
  if (d.rainyDayProb != null) {
    const p = d.rainyDayProb;
    if (p < 0.25) return "☀️";
    if (p < 0.45) return "🌤";
    if (p < 0.65) return "⛅";
    if (p < 0.8) return "🌦";
    return "🌧";
  }
  return weatherEmoji(d.weatherCode);
}

function matchDestination(name: string) {
  const lower = name.toLowerCase().trim();
  return DESTINATIONS.find((d) => {
    const dn = d.name.toLowerCase();
    return dn === lower || d.id === lower || d.id === lower.replace(/\s+/g, "-") || dn.includes(lower) || lower.includes(dn);
  });
}

export function WeatherSection({ trip, sampleEvery, maxDays }: Props) {
  const dest = useMemo(
    () => trip.destinations.map(matchDestination).find((d) => d?.lat != null && d?.lng != null) ?? null,
    [trip.destinations],
  );

  const dStart = daysUntilStart(trip);
  const dEnd = daysUntilEnd(trip);

  let mode: Mode | null = null;
  if (dStart <= 16 && dEnd >= 0) {
    mode = "forecast";
  } else if (dEnd < 0 && dEnd >= -90) {
    mode = "historical";
  } else if (dStart > 16) {
    // Viaje muy lejos para forecast → promediamos las últimas 5 vueltas a estas fechas.
    mode = "prior_year";
  }

  const [data, setData] = useState<DailyWeather[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setError(null);
    if (!mode || !dest?.lat || !dest?.lng) return;
    setLoading(true);
    let p: Promise<DailyWeather[]>;
    if (mode === "forecast") p = fetchForecast(dest.lat, dest.lng);
    else if (mode === "historical") p = fetchHistorical(dest.lat, dest.lng, trip.startDate, trip.endDate);
    else {
      // Promedio 5 años: primero el archivo precalculado (sin API); si no está, la API.
      const { lat, lng } = dest;
      p = fetchPrecomputedAverage(dest.id, trip.startDate, trip.endDate)
        .then((pre) => pre ?? fetchMultiYearAverage(lat, lng, trip.startDate, trip.endDate, PRIOR_YEARS));
    }
    p.then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [mode, dest, trip.startDate, trip.endDate]);

  if (!mode) return null;
  if (!dest) return null;

  let filtered = data?.filter((d) => d.date >= trip.startDate && d.date <= trip.endDate) ?? [];
  if (sampleEvery && sampleEvery > 1) {
    filtered = filtered.filter((_, i) => i % sampleEvery === 0).slice(0, maxDays ?? 10);
  } else if (maxDays) {
    filtered = filtered.slice(0, maxDays);
  }
  const maxPrecip = Math.max(...filtered.map((d) => d.precipMm), 5);

  const title =
    mode === "forecast" ? `🌤 Pronóstico — ${dest.name}` :
    mode === "historical" ? `📜 Tiempo histórico — ${dest.name}` :
    `📅 Promedio últimos ${PRIOR_YEARS} años en estas fechas — ${dest.name}`;

  const titleTip =
    mode === "forecast" ? "Pronóstico real de Open-Meteo para los próximos días." :
    mode === "historical" ? "Lo que ocurrió realmente en estas fechas, según el archivo histórico ERA5." :
    `Promedio día a día de los últimos ${PRIOR_YEARS} años (datos satelitales ERA5). Da una idea realista de qué esperar, mejor que un único año que puede ser atípico.`;

  const subtitle =
    mode === "prior_year" ? (
      <p className="settings-hint">Promedio día por día de los últimos {PRIOR_YEARS} años (datos ERA5). Más robusto que un único año atípico.</p>
    ) : null;

  return (
    <div className="weather-section">
      <h3>{title} <InfoTip tip={titleTip} /></h3>
      {subtitle}
      {loading && (
        <div className="weather-grid" aria-label="Cargando datos de Open-Meteo…">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="weather-day weather-skeleton" aria-hidden />
          ))}
        </div>
      )}
      {error && (
        <p className="form-error">No se pudo cargar ({error}). Las normales climáticas del gráfico siguen disponibles.</p>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="weather-grid">
          {filtered.map((d) => {
            const prob = d.rainyDayProb != null ? Math.round(d.rainyDayProb * 100) : null;
            const cardTip =
              `${formatDate(d.date)} — máx ${d.tempMax}°, mín ${d.tempMin}°` +
              (prob != null ? ` · ${prob}% de probabilidad de lluvia` : "");
            return (
              <div key={d.date} className="weather-day" title={cardTip}>
                <div className="weather-date">{formatDate(d.date)}</div>
                <div className="weather-emoji">{dayIcon(d)}</div>
                <div className="weather-temp">
                  <span title="Mínima / máxima promedio del día">{d.tempMin}° / {d.tempMax}°</span>
                  {d.tempMaxStdev != null && d.tempMaxStdev > 0 && (
                    <span className="weather-stdev" title="Variación típica entre años: cuánto suele cambiar la máxima de ese día de un año a otro."> ±{d.tempMaxStdev}</span>
                  )}
                </div>
                <div className="weather-rainbar" aria-hidden>
                  <span style={{ width: `${Math.round((d.precipMm / maxPrecip) * 100)}%` }} />
                </div>
                <div className="weather-rain" title="Lluvia promedio acumulada en el día">{d.precipMm} mm</div>
                {prob != null && (
                  <div
                    className="weather-rainprob"
                    title={mode === "prior_year"
                      ? `Probabilidad de lluvia: en el ${prob}% de los últimos ${PRIOR_YEARS} años llovió este día (más de 1 mm).`
                      : `Probabilidad de lluvia ese día: ${prob}%.`}
                  >
                    {prob}% prob. lluvia
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
