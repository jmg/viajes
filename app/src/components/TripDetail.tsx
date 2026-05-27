import { useState } from "react";
import type { Trip } from "../types";
import { formatDateRange, daysBetween } from "../lib/format";
import { FlightTable } from "./FlightTable";
import { Itinerary } from "./Itinerary";
import { MoonTidePanel } from "./MoonTidePanel";
import { BudgetTable } from "./BudgetTable";
import { Checklist } from "./Checklist";
import { LinksList } from "./LinksList";

type Props = {
  trip: Trip;
  onBack: () => void;
};

type TabId = "overview" | "flights" | "itinerary" | "moon" | "budget" | "checklist" | "links";

export function TripDetail({ trip, onBack }: Props) {
  const tabs: { id: TabId; label: string; show: boolean }[] = [
    { id: "overview", label: "Resumen", show: true },
    { id: "flights", label: "Vuelos", show: !!trip.flightOptions?.length },
    { id: "itinerary", label: "Itinerario", show: !!trip.itinerary?.length },
    { id: "moon", label: "Luna y mareas", show: !!(trip.moonPhases?.length || trip.tideWindows?.length) },
    { id: "budget", label: "Presupuesto", show: !!trip.budget?.length },
    { id: "checklist", label: "Checklist", show: !!trip.checklist?.length },
    { id: "links", label: "Links", show: !!trip.links?.length },
  ];

  const visibleTabs = tabs.filter((t) => t.show);
  const [active, setActive] = useState<TabId>("overview");

  return (
    <div className="trip-detail">
      <button className="back-button" onClick={onBack}>
        ← Volver a viajes
      </button>

      <header className="trip-header">
        <h1>{trip.title}</h1>
        {trip.subtitle && <p className="subtitle">{trip.subtitle}</p>}
        <div className="trip-meta-row">
          <span>📅 {formatDateRange(trip.startDate, trip.endDate)}</span>
          <span>📍 {trip.destinations.join(" → ")}</span>
          <span>{daysBetween(trip.startDate, trip.endDate)} días</span>
          <span>👥 {trip.travelers}</span>
        </div>
      </header>

      <nav className="tabs">
        {visibleTabs.map((t) => (
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
        {active === "overview" && <Overview trip={trip} />}
        {active === "flights" && trip.flightOptions && (
          <FlightTable
            options={trip.flightOptions}
            criteria={trip.flightCriteria}
            recommendedId={trip.recommendedFlightId}
          />
        )}
        {active === "itinerary" && trip.itinerary && (
          <Itinerary days={trip.itinerary} />
        )}
        {active === "moon" && (
          <MoonTidePanel phases={trip.moonPhases} windows={trip.tideWindows} />
        )}
        {active === "budget" && trip.budget && (
          <BudgetTable items={trip.budget} />
        )}
        {active === "checklist" && trip.checklist && (
          <Checklist tripId={trip.id} items={trip.checklist} />
        )}
        {active === "links" && trip.links && <LinksList links={trip.links} />}
      </section>
    </div>
  );
}

function Overview({ trip }: { trip: Trip }) {
  const top = trip.flightOptions?.find((o) => o.id === trip.recommendedFlightId);
  return (
    <div className="overview">
      {trip.summary && <p className="summary">{trip.summary}</p>}
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
