import { useMemo, useState } from "react";
import type { Currency, Trip } from "../types";
import type { Destination } from "../destinations/types";
import { findDestination } from "../destinations/match";
import { DestinationPicker } from "./DestinationPicker";
import { useTripWeather } from "../hooks/useTripWeather";
import { formatDateRange, daysBetween } from "../lib/format";
import { autoStatus } from "../lib/status";
import { useT } from "../i18n";
import { computeMoonPhases, computeTideWindows } from "../lib/moon";
import { FlightTable } from "./FlightTable";
import { MoonTidePanel } from "./MoonTidePanel";
import { ChecklistEditor } from "./editors/ChecklistEditor";
import { LinksEditor } from "./editors/LinksEditor";
import { BudgetEditor } from "./editors/BudgetEditor";
import { ItineraryEditor } from "./editors/ItineraryEditor";
import { ExpensesEditor } from "./editors/ExpensesEditor";
import { BookingLinks } from "./BookingLinks";
import { TripPrintView } from "./TripPrintView";
import { TodayPanel } from "./TodayPanel";
import { WeatherSection } from "./WeatherSection";
import { Countdown } from "./Countdown";
import { InfoTip as Info } from "./InfoTip";
import { track } from "../lib/analytics";
import { downloadTripIcs } from "../lib/calendar";
import { googleFlightsUrl, bookingUrl } from "../lib/booking";

type Props = {
  trip: Trip;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onChange: (trip: Trip) => void;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  onShare: () => void;
};

type TabId = "overview" | "flights" | "itinerary" | "moon" | "budget" | "expenses" | "checklist" | "links" | "booking";

export function TripDetail({ trip, currency, onCurrencyChange, onChange, onEdit, onDelete, onBack, onShare }: Props) {
  const t = useT();
  const status = autoStatus(trip);

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: t("tripDetail.tabs.overview") },
    { id: "flights", label: t("tripDetail.tabs.flights") },
    { id: "itinerary", label: t("tripDetail.tabs.itinerary") },
    { id: "moon", label: t("tripDetail.tabs.moon") },
    { id: "budget", label: t("tripDetail.tabs.budget") },
    { id: "expenses", label: t("tripDetail.tabs.expenses") },
    { id: "checklist", label: t("tripDetail.tabs.checklist") },
    { id: "links", label: t("tripDetail.tabs.links") },
    { id: "booking", label: t("tripDetail.tabs.booking") },
  ];

  if (!trip.coastal && !trip.moonPhases?.length) {
    tabs.splice(tabs.findIndex((t) => t.id === "moon"), 1);
  }

  const [active, setActive] = useState<TabId>("overview");
  const [quickEdit, setQuickEdit] = useState(false);

  const setDestinations = (next: string[]) => {
    if (next.length === 0) return; // un viaje siempre tiene al menos un destino
    onChange({ ...trip, destinations: next });
  };

  const computedPhases = useMemo(() => {
    if (trip.moonPhases?.length) return trip.moonPhases;
    if (!trip.coastal) return [];
    return computeMoonPhases(trip.startDate, trip.endDate);
  }, [trip.coastal, trip.startDate, trip.endDate, trip.moonPhases]);

  const computedWindows = useMemo(() => {
    if (trip.tideWindows?.length) return trip.tideWindows;
    if (!trip.coastal) return [];
    return computeTideWindows(computedPhases);
  }, [trip.tideWindows, trip.coastal, computedPhases]);

  // Destinos del viaje que existen en el catálogo y tienen coordenadas: mostramos
  // un pronóstico por cada uno (sin repetir), para viajes de varios destinos.
  const weatherDests = useMemo(() => {
    const seen = new Set<string>();
    const out: Destination[] = [];
    for (const name of trip.destinations) {
      const d = findDestination(name);
      if (d && d.lat != null && d.lng != null && !seen.has(d.id)) {
        seen.add(d.id);
        out.push(d);
      }
    }
    return out;
  }, [trip.destinations]);

  // Clima por día para mostrarlo embebido en cada día del itinerario.
  const weatherFor = useTripWeather(trip);

  return (
    <>
    <div className="trip-detail screen-only">
      <button className="back-button" onClick={onBack}>{t("tripDetail.back")}</button>

      <header className="trip-header">
        <div className="trip-header-top">
          <div>
            <span className={`status-pill status-${status}`}>{t("tripDetail.status." + status)}</span>
            <h1>{trip.title}</h1>
            {trip.subtitle && <p className="subtitle">{trip.subtitle}</p>}
          </div>
          <div className="header-actions">
            <button className="button-secondary" onClick={() => { track("trip_calendar"); downloadTripIcs(trip); }}>📅 {t("common.calendar")}</button>
            <button className="button-secondary" onClick={() => { track("trip_print"); window.print(); }}>🖨 {t("common.print")}</button>
            <button className="button-secondary" onClick={onShare}>🔗 {t("common.share")}</button>
            <button className="button-secondary" onClick={onEdit}>✎ {t("common.edit")}</button>
            <button className="button-danger" onClick={onDelete}>🗑 {t("common.delete")}</button>
          </div>
        </div>
        <div className="trip-meta-row">
          <span>📅 {formatDateRange(trip.startDate, trip.endDate)}</span>
          <span>📍 {trip.destinations.join(" → ")}</span>
          <span>{t("tripDetail.days", { n: daysBetween(trip.startDate, trip.endDate) })}</span>
          <span>👥 {trip.travelers}</span>
          <span><Countdown trip={trip} /></span>
          <button className="link-button trip-meta-edit" onClick={() => setQuickEdit((v) => !v)}>
            ✎ {t("tripDetail.quickEdit")}
          </button>
        </div>

        {quickEdit && (
          <div className="trip-quick-edit">
            <label className="field">
              <span>{t("tripDetail.quickEditWhere")} <small>{t("tripForm.whereHint")}</small></span>
              <DestinationPicker
                value={trip.destinations}
                onChange={setDestinations}
                placeholder={t("tripForm.wherePlaceholder")}
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span>{t("tripForm.departLabel")}</span>
                <input type="date" value={trip.startDate}
                  onChange={(e) => onChange({ ...trip, startDate: e.target.value })} />
              </label>
              <label className="field">
                <span>{t("tripForm.returnLabel")}</span>
                <input type="date" value={trip.endDate}
                  onChange={(e) => onChange({ ...trip, endDate: e.target.value })} />
              </label>
              <label className="field field-narrow">
                <span>{t("tripForm.travelersLabel")}</span>
                <input type="number" min={1} max={20} value={trip.travelers}
                  onChange={(e) => onChange({ ...trip, travelers: Math.max(1, parseInt(e.target.value, 10) || 1) })} />
              </label>
            </div>
            <div className="trip-quick-edit-foot">
              <span className="form-hint">{t("tripDetail.quickEditHint")}</span>
              <button className="button-secondary" onClick={() => setQuickEdit(false)}>{t("common.close")}</button>
            </div>
          </div>
        )}
      </header>

      <TodayPanel trip={trip} onGoToItinerary={() => setActive("itinerary")} />

      <nav className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={active === t.id ? "tab active" : "tab"}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="tab-content">
        {active === "overview" && (
          <>
            <Overview trip={trip} onBook={() => setActive("booking")} />
            {weatherDests.length > 0
              ? weatherDests.map((d) => <WeatherSection key={d.id} trip={trip} destination={d} />)
              : <WeatherSection trip={trip} />}
          </>
        )}

        {active === "flights" && (
          trip.flightOptions?.length ? (
            <FlightTable
              options={trip.flightOptions}
              criteria={trip.flightCriteria}
              recommendedId={trip.recommendedFlightId}
            />
          ) : (
            <EmptyState
              message={t("tripDetail.emptyFlights")}
              hint={t("tripDetail.emptyFlightsHint")}
            />
          )
        )}

        {active === "itinerary" && (
          <ItineraryEditor
            days={trip.itinerary ?? []}
            tripStart={trip.startDate}
            tripEnd={trip.endDate}
            destinations={trip.destinations}
            weatherFor={weatherFor}
            onChange={(itinerary) => onChange({ ...trip, itinerary })}
          />
        )}

        {active === "moon" && (
          computedPhases.length || computedWindows.length ? (
            <MoonTidePanel phases={computedPhases} windows={computedWindows} />
          ) : (
            <EmptyState
              message={t("tripDetail.emptyMoon")}
            />
          )
        )}

        {active === "budget" && (
          <BudgetEditor
            items={trip.budget ?? []}
            currency={currency}
            onCurrencyChange={onCurrencyChange}
            onChange={(budget) => onChange({ ...trip, budget })}
          />
        )}

        {active === "expenses" && (
          <ExpensesEditor
            expenses={trip.expenses ?? []}
            travelerNames={trip.travelerNames ?? []}
            travelers={trip.travelers}
            currency={currency}
            onCurrencyChange={onCurrencyChange}
            onChange={(expenses) => onChange({ ...trip, expenses })}
            onNamesChange={(travelerNames) => onChange({ ...trip, travelerNames })}
          />
        )}

        {active === "checklist" && (
          <ChecklistEditor
            tripId={trip.id}
            items={trip.checklist ?? []}
            onChange={(checklist) => onChange({ ...trip, checklist })}
          />
        )}

        {active === "links" && (
          <LinksEditor
            links={trip.links ?? []}
            onChange={(links) => onChange({ ...trip, links })}
          />
        )}

        {active === "booking" && <BookingLinks trip={trip} />}
      </section>
    </div>
    <TripPrintView trip={trip} currency={currency} />
    </>
  );
}

const usd = (n: number) => `US$ ${Math.round(n).toLocaleString("es-AR")}`;

function Overview({ trip, onBook }: { trip: Trip; onBook: () => void }) {
  const t = useT();
  const top = trip.flightOptions?.find((o) => o.id === trip.recommendedFlightId);

  const days = daysBetween(trip.startDate, trip.endDate);
  const nights = Math.max(0, days - 1);
  const travelers = Math.max(1, trip.travelers);

  const budget = trip.budget?.length
    ? trip.budget.reduce((a, b) => ({ min: a.min + b.minUsd, max: a.max + b.maxUsd }), { min: 0, max: 0 })
    : null;
  const spent = trip.expenses?.length
    ? trip.expenses.reduce((a, e) => a + e.amountUsd, 0)
    : null;
  const itinDays = trip.itinerary?.length ?? 0;
  const checklistN = trip.checklist?.length ?? 0;

  return (
    <div className="overview">
      <div className="month-stats trip-stats">
        <div className="ms">
          <span className="ms-label">{t("overview.duration")}</span>
          <span className="ms-val">{t("tripDetail.days", { n: days })}</span>
          <span className="ms-sub">{nights} {nights === 1 ? t("common.night") : t("common.nights")}</span>
        </div>
        <div className="ms">
          <span className="ms-label">{t("overview.travelers")}</span>
          <span className="ms-val">👥 {travelers}</span>
          {trip.travelerNames?.length ? <span className="ms-sub">{trip.travelerNames.join(", ")}</span> : null}
        </div>
        {budget && (
          <div className="ms">
            <span className="ms-label">{t("overview.budget")} <Info tip={t("overview.budgetTip")} /></span>
            <span className="ms-val">{usd(budget.min)}–{usd(budget.max)}</span>
            <span className="ms-sub">{usd(budget.min / travelers)}–{usd(budget.max / travelers)} {t("common.perPerson")}</span>
          </div>
        )}
        {spent != null && (
          <div className="ms">
            <span className="ms-label">{t("overview.spent")} <Info tip={t("overview.spentTip")} /></span>
            <span className="ms-val">{usd(spent)}</span>
            <span className="ms-sub">{usd(spent / travelers)} {t("common.perPerson")}</span>
          </div>
        )}
        {itinDays > 0 && (
          <div className="ms">
            <span className="ms-label">{t("overview.itinerary")}</span>
            <span className="ms-val">{itinDays === 1 ? t("overview.itineraryDay", { n: itinDays }) : t("overview.itineraryDays", { n: itinDays })}</span>
            <span className="ms-sub">{t("overview.itinerarySub", { n: days })}</span>
          </div>
        )}
        {trip.destinations.length > 0 && (
          <div className="ms">
            <span className="ms-label">{t("overview.destinations")}</span>
            <span className="ms-val">{trip.destinations.length}</span>
            <span className="ms-sub">{trip.destinations.join(" → ")}</span>
          </div>
        )}
        {checklistN > 0 && (
          <div className="ms">
            <span className="ms-label">{t("overview.checklist")}</span>
            <span className="ms-val">{checklistN}</span>
            <span className="ms-sub">{t("overview.checklistSub")}</span>
          </div>
        )}
      </div>

      {trip.summary ? (
        <p className="summary">{trip.summary}</p>
      ) : (
        <p className="summary muted">{t("overview.noDescription")}</p>
      )}
      {top && (
        <div className="callout">
          <h3>{t("overview.recommendedFlight")}</h3>
          <p>
            <strong>{t("overview.outbound")}</strong> {top.outbound.date} · {top.outbound.from} →{" "}
            {top.outbound.to} · {top.outbound.airline} ·{" "}
            {top.outbound.depart} → {top.outbound.arrive}
            {top.outbound.direct ? t("overview.direct") : t("overview.withStop")}
          </p>
          <p>
            <strong>{t("overview.inbound")}</strong> {top.inbound.date} · {top.inbound.from} →{" "}
            {top.inbound.to} · {top.inbound.airline} ·{" "}
            {top.inbound.depart} → {top.inbound.arrive}
            {top.inbound.direct ? t("overview.direct") : t("overview.withStop")}
          </p>
          {top.comment && <p className="callout-comment">{top.comment}</p>}
        </div>
      )}

      <div className="book-cta">
        <div className="book-cta-text">
          <strong>{t("overview.bookTitle")}</strong>
          <span>{t("overview.bookSub")}</span>
        </div>
        <div className="book-cta-actions">
          <a
            className="button-primary"
            href={googleFlightsUrl(trip.origin || "Buenos Aires", trip.destinations[0] ?? "", trip.startDate)}
            target="_blank" rel="noreferrer sponsored"
            onClick={() => track("booking_click", { platform: "google_flights", from: "overview_cta" })}
          >✈️ {t("overview.bookFlight")}</a>
          <a
            className="button-secondary"
            href={bookingUrl(trip.destinations[0] ?? "", trip.startDate, trip.endDate)}
            target="_blank" rel="noreferrer sponsored"
            onClick={() => track("booking_click", { platform: "booking", from: "overview_cta" })}
          >🏨 {t("overview.bookHotel")}</a>
          <button className="link-button book-cta-more" onClick={onBook}>{t("overview.bookMore")}</button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
