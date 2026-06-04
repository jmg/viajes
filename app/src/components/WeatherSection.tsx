import { useEffect, useMemo, useState } from "react";
import type { Trip } from "../types";
import type { Destination } from "../destinations/types";
import { findDestination } from "../destinations/match";
import { loadTripWeather, weatherDayIcon, weatherModeForTrip, PRIOR_YEARS } from "../lib/forecast";
import type { DailyWeather } from "../lib/forecast";
import { daysUntilStart, daysUntilEnd } from "../lib/status";
import { formatDate } from "../lib/format";
import { InfoTip } from "./InfoTip";

type Props = {
  trip: Trip;
  /** Destino concreto a graficar. Si falta, se elige el primero del viaje con coordenadas. */
  destination?: Destination;
  /** Si está, muestra ~maxDays días salteados cada N (para previsualizar un mes entero). */
  sampleEvery?: number;
  maxDays?: number;
};

export function WeatherSection({ trip, destination, sampleEvery, maxDays }: Props) {
  const dest = useMemo(
    () => destination ?? trip.destinations.map(findDestination).find((d) => d?.lat != null && d?.lng != null) ?? null,
    [destination, trip.destinations],
  );

  const mode = weatherModeForTrip(daysUntilStart(trip), daysUntilEnd(trip));

  const [data, setData] = useState<DailyWeather[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setError(null);
    if (!mode || !dest?.lat || !dest?.lng) return;
    setLoading(true);
    loadTripWeather(mode, dest.id, dest.lat, dest.lng, trip.startDate, trip.endDate)
      .then(setData)
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
                <div className="weather-emoji">{weatherDayIcon(d)}</div>
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
