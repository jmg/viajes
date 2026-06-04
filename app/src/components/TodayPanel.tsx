import type { Trip } from "../types";
import { formatDate, daysBetween } from "../lib/format";
import { autoStatus, daysUntilEnd } from "../lib/status";
import { useT } from "../i18n";

type Props = { trip: Trip; onGoToItinerary: () => void };

const today = (): string => new Date().toISOString().slice(0, 10);

export function TodayPanel({ trip, onGoToItinerary }: Props) {
  const t = useT();
  if (autoStatus(trip) !== "in-progress") return null;

  const totalDays = daysBetween(trip.startDate, trip.endDate) + 1;
  const startTime = new Date(trip.startDate + "T00:00:00").getTime();
  const dayNumber = Math.floor((Date.now() - startTime) / 86_400_000) + 1;
  const remaining = daysUntilEnd(trip);

  const todayIso = today();
  const todayDay = trip.itinerary?.find((d) => d.date === todayIso) ?? null;

  return (
    <div className="today-panel">
      <div className="today-header">
        <div>
          <span className="today-badge-inline">{t("common.today")}</span>
          <strong>{t("today.day", { n: dayNumber, total: totalDays })}</strong>
          <span className="today-sub">{remaining === 1 ? t("today.subOne", { date: formatDate(todayIso), n: remaining }) : t("today.sub", { date: formatDate(todayIso), n: remaining })}</span>
        </div>
        {trip.itinerary?.length ? (
          <button className="link-button" onClick={onGoToItinerary}>{t("today.viewItinerary")}</button>
        ) : null}
      </div>
      {todayDay ? (
        <div className="today-content">
          <div className="today-emoji">{todayDay.emoji ?? "📍"}</div>
          <div className="today-info">
            <div className="today-location">{todayDay.location}</div>
            <h3 className="today-title">{todayDay.title}</h3>
            <ul className="today-highlights">
              {todayDay.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
            {todayDay.notes && <p className="today-notes">{todayDay.notes}</p>}
          </div>
        </div>
      ) : (
        <p className="today-empty">
          {t("today.noActivities")} {trip.itinerary?.length
            ? t("today.reviewHint")
            : t("today.generateHint")}
        </p>
      )}
    </div>
  );
}
