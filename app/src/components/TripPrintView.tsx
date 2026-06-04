import type { Currency, Trip } from "../types";
import { formatDateRange, daysBetween, formatDate } from "../lib/format";
import { formatAmount } from "../lib/currency";
import { useT } from "../i18n";

type Props = { trip: Trip; currency: Currency };

// Vista imprimible (oculta en pantalla, visible al imprimir / guardar como PDF).
export function TripPrintView({ trip, currency }: Props) {
  const t = useT();
  const budgetMin = trip.budget?.reduce((s, b) => s + b.minUsd, 0) ?? 0;
  const budgetMax = trip.budget?.reduce((s, b) => s + b.maxUsd, 0) ?? 0;

  return (
    <div className="print-only print-view">
      <header className="print-header">
        <h1>{trip.title}</h1>
        {trip.subtitle && <p>{trip.subtitle}</p>}
        <p className="print-meta">
          {formatDateRange(trip.startDate, trip.endDate)} · {t("print.days", { n: daysBetween(trip.startDate, trip.endDate) })}
          {" · "}{trip.origin ? `${trip.origin} → ` : ""}{trip.destinations.join(" → ")}
          {" · "}{trip.travelers === 1 ? t("print.traveler", { n: trip.travelers }) : t("print.travelers", { n: trip.travelers })}
        </p>
      </header>

      {trip.summary && <p className="print-summary">{trip.summary}</p>}

      {trip.itinerary?.length ? (
        <section>
          <h2>{t("print.itinerary")}</h2>
          {trip.itinerary.map((d) => (
            <div className="print-day" key={d.dayNumber}>
              <h3>{t("print.day", { n: d.dayNumber })} · {formatDate(d.date)} — {d.location}</h3>
              <p className="print-day-title">{d.title}</p>
              <ul>{d.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
              {d.notes && <p className="print-notes">{d.notes}</p>}
            </div>
          ))}
        </section>
      ) : null}

      {trip.checklist?.length ? (
        <section>
          <h2>{t("print.checklist")}</h2>
          <ul>{trip.checklist.map((c, i) => <li key={i}>☐ {c.label}{c.category ? ` (${c.category})` : ""}</li>)}</ul>
        </section>
      ) : null}

      {trip.budget?.length ? (
        <section>
          <h2>{t("print.budget")}</h2>
          <table className="print-table">
            <tbody>
              {trip.budget.map((b, i) => (
                <tr key={i}><td>{b.label}</td><td>{formatAmount(b.minUsd, currency)} – {formatAmount(b.maxUsd, currency)}</td></tr>
              ))}
              <tr className="print-total"><td>{t("print.total")}</td><td>{formatAmount(budgetMin, currency)} – {formatAmount(budgetMax, currency)}</td></tr>
            </tbody>
          </table>
        </section>
      ) : null}

      {trip.links?.length ? (
        <section>
          <h2>{t("print.links")}</h2>
          <ul>{trip.links.map((l) => <li key={l.url}>{l.label}: {l.url}</li>)}</ul>
        </section>
      ) : null}

      <footer className="print-footer">{t("print.generatedWith")}</footer>
    </div>
  );
}
