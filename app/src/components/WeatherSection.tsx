import { useEffect, useMemo, useState } from "react";
import type { Trip } from "../types";
import type { Destination } from "../destinations/types";
import { findDestination } from "../destinations/match";
import { loadTripWeather, weatherDayIcon, weatherModeForTrip, PRIOR_YEARS } from "../lib/forecast";
import type { DailyWeather } from "../lib/forecast";
import { daysUntilStart, daysUntilEnd } from "../lib/status";
import { formatDate } from "../lib/format";
import { InfoTip } from "./InfoTip";
import { useT } from "../i18n";

type Props = {
  trip: Trip;
  /** Destino concreto a graficar. Si falta, se elige el primero del viaje con coordenadas. */
  destination?: Destination;
  /** Si está, muestra ~maxDays días salteados cada N (para previsualizar un mes entero). */
  sampleEvery?: number;
  maxDays?: number;
};

export function WeatherSection({ trip, destination, sampleEvery, maxDays }: Props) {
  const t = useT();
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
    mode === "forecast" ? t("weather.titleForecast", { dest: dest.name }) :
    mode === "historical" ? t("weather.titleHistorical", { dest: dest.name }) :
    t("weather.titlePriorYear", { years: PRIOR_YEARS, dest: dest.name });

  const titleTip =
    mode === "forecast" ? t("weather.tipForecast") :
    mode === "historical" ? t("weather.tipHistorical") :
    t("weather.tipPriorYear", { years: PRIOR_YEARS });

  const subtitle =
    mode === "prior_year" ? (
      <p className="settings-hint">{t("weather.subtitlePriorYear", { years: PRIOR_YEARS })}</p>
    ) : null;

  return (
    <div className="weather-section">
      <h3>{title} <InfoTip tip={titleTip} /></h3>
      {subtitle}
      {loading && (
        <div className="weather-grid" aria-label={t("weather.loadingAria")}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="weather-day weather-skeleton" aria-hidden />
          ))}
        </div>
      )}
      {error && (
        <p className="form-error">{t("weather.loadError", { error })}</p>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="weather-grid">
          {filtered.map((d) => {
            const prob = d.rainyDayProb != null ? Math.round(d.rainyDayProb * 100) : null;
            const cardTip =
              prob != null
                ? t("weather.cardTipRain", { date: formatDate(d.date), max: d.tempMax, min: d.tempMin, prob })
                : t("weather.cardTip", { date: formatDate(d.date), max: d.tempMax, min: d.tempMin });
            return (
              <div key={d.date} className="weather-day" title={cardTip}>
                <div className="weather-date">{formatDate(d.date)}</div>
                <div className="weather-emoji">{weatherDayIcon(d)}</div>
                <div className="weather-temp">
                  <span title={t("weather.tempTip")}>{d.tempMin}° / {d.tempMax}°</span>
                  {d.tempMaxStdev != null && d.tempMaxStdev > 0 && (
                    <span className="weather-stdev" title={t("weather.stdevTip")}> ±{d.tempMaxStdev}</span>
                  )}
                </div>
                <div className="weather-rainbar" aria-hidden>
                  <span style={{ width: `${Math.round((d.precipMm / maxPrecip) * 100)}%` }} />
                </div>
                <div className="weather-rain" title={t("weather.rainTip")}>{d.precipMm} mm</div>
                {prob != null && (
                  <div
                    className="weather-rainprob"
                    title={mode === "prior_year"
                      ? t("weather.rainProbTipPriorYear", { prob, years: PRIOR_YEARS })
                      : t("weather.rainProbTip", { prob })}
                  >
                    {t("weather.rainProbLabel", { prob })}
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
