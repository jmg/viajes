import { useMemo, useState } from "react";
import type { Currency, Trip } from "../types";
import { formatDateRange, daysBetween } from "../lib/format";
import { autoStatus, STATUS_LABEL } from "../lib/status";
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
import { track } from "../lib/analytics";
import { downloadTripIcs } from "../lib/calendar";

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
  const status = autoStatus(trip);

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Resumen" },
    { id: "flights", label: "Vuelos" },
    { id: "itinerary", label: "Itinerario" },
    { id: "moon", label: "Luna y mareas" },
    { id: "budget", label: "Presupuesto" },
    { id: "expenses", label: "Gastos" },
    { id: "checklist", label: "Checklist" },
    { id: "links", label: "Links" },
    { id: "booking", label: "Reservar" },
  ];

  if (!trip.coastal && !trip.moonPhases?.length) {
    tabs.splice(tabs.findIndex((t) => t.id === "moon"), 1);
  }

  const [active, setActive] = useState<TabId>("overview");

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

  return (
    <>
    <div className="trip-detail screen-only">
      <button className="back-button" onClick={onBack}>← Volver</button>

      <header className="trip-header">
        <div className="trip-header-top">
          <div>
            <span className={`status-pill status-${status}`}>{STATUS_LABEL[status]}</span>
            <h1>{trip.title}</h1>
            {trip.subtitle && <p className="subtitle">{trip.subtitle}</p>}
          </div>
          <div className="header-actions">
            <button className="button-secondary" onClick={() => { track("trip_calendar"); downloadTripIcs(trip); }}>📅 Calendario</button>
            <button className="button-secondary" onClick={() => { track("trip_print"); window.print(); }}>🖨 Imprimir / PDF</button>
            <button className="button-secondary" onClick={onShare}>🔗 Compartir</button>
            <button className="button-secondary" onClick={onEdit}>✎ Editar</button>
            <button className="button-danger" onClick={onDelete}>🗑 Eliminar</button>
          </div>
        </div>
        <div className="trip-meta-row">
          <span>📅 {formatDateRange(trip.startDate, trip.endDate)}</span>
          <span>📍 {trip.destinations.join(" → ")}</span>
          <span>{daysBetween(trip.startDate, trip.endDate)} días</span>
          <span>👥 {trip.travelers}</span>
          <span><Countdown trip={trip} /></span>
        </div>
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
            <Overview trip={trip} />
            <WeatherSection trip={trip} />
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
              message="Todavía no hay opciones de vuelo cargadas."
              hint="Las opciones de vuelos por ahora se cargan editando el archivo TS del viaje."
            />
          )
        )}

        {active === "itinerary" && (
          <ItineraryEditor
            days={trip.itinerary ?? []}
            onChange={(itinerary) => onChange({ ...trip, itinerary })}
          />
        )}

        {active === "moon" && (
          computedPhases.length || computedWindows.length ? (
            <MoonTidePanel phases={computedPhases} windows={computedWindows} />
          ) : (
            <EmptyState
              message="Marcá este viaje como costero para ver las fases lunares y ventanas de marea."
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

function Info({ tip }: { tip: string }) {
  return <span className="info-tip" title={tip} role="img" aria-label={`Ayuda: ${tip}`}>ⓘ</span>;
}

const usd = (n: number) => `US$ ${Math.round(n).toLocaleString("es-AR")}`;

function Overview({ trip }: { trip: Trip }) {
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
          <span className="ms-label">Duración</span>
          <span className="ms-val">{days} días</span>
          <span className="ms-sub">{nights} {nights === 1 ? "noche" : "noches"}</span>
        </div>
        <div className="ms">
          <span className="ms-label">Viajeros</span>
          <span className="ms-val">👥 {travelers}</span>
          {trip.travelerNames?.length ? <span className="ms-sub">{trip.travelerNames.join(", ")}</span> : null}
        </div>
        {budget && (
          <div className="ms">
            <span className="ms-label">Presupuesto <Info tip="Suma estimada de los ítems cargados en la pestaña Presupuesto (en dólares)." /></span>
            <span className="ms-val">{usd(budget.min)}–{usd(budget.max)}</span>
            <span className="ms-sub">{usd(budget.min / travelers)}–{usd(budget.max / travelers)} por persona</span>
          </div>
        )}
        {spent != null && (
          <div className="ms">
            <span className="ms-label">Gastos cargados <Info tip="Total de gastos reales anotados en la pestaña Gastos (en dólares)." /></span>
            <span className="ms-val">{usd(spent)}</span>
            <span className="ms-sub">{usd(spent / travelers)} por persona</span>
          </div>
        )}
        {itinDays > 0 && (
          <div className="ms">
            <span className="ms-label">Itinerario</span>
            <span className="ms-val">{itinDays} {itinDays === 1 ? "día" : "días"}</span>
            <span className="ms-sub">de {days} planificados</span>
          </div>
        )}
        {trip.destinations.length > 0 && (
          <div className="ms">
            <span className="ms-label">Destinos</span>
            <span className="ms-val">{trip.destinations.length}</span>
            <span className="ms-sub">{trip.destinations.join(" → ")}</span>
          </div>
        )}
        {checklistN > 0 && (
          <div className="ms">
            <span className="ms-label">Checklist</span>
            <span className="ms-val">{checklistN}</span>
            <span className="ms-sub">ítems para empacar</span>
          </div>
        )}
      </div>

      {trip.summary ? (
        <p className="summary">{trip.summary}</p>
      ) : (
        <p className="summary muted">Sin descripción. Tocá <strong>Editar</strong> para agregar una.</p>
      )}
      {top && (
        <div className="callout">
          <h3>🏆 Vuelo recomendado</h3>
          <p>
            <strong>Ida:</strong> {top.outbound.date} · {top.outbound.from} →{" "}
            {top.outbound.to} · {top.outbound.airline} ·{" "}
            {top.outbound.depart} → {top.outbound.arrive}
            {top.outbound.direct ? " (directo)" : " (con escala)"}
          </p>
          <p>
            <strong>Vuelta:</strong> {top.inbound.date} · {top.inbound.from} →{" "}
            {top.inbound.to} · {top.inbound.airline} ·{" "}
            {top.inbound.depart} → {top.inbound.arrive}
            {top.inbound.direct ? " (directo)" : " (con escala)"}
          </p>
          {top.comment && <p className="callout-comment">{top.comment}</p>}
        </div>
      )}
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
