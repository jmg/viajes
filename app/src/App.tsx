import { useState } from "react";
import { trips, getTrip } from "./trips";
import { TripCard } from "./components/TripCard";
import { TripDetail } from "./components/TripDetail";

export function App() {
  const [tripId, setTripId] = useState<string | null>(null);
  const trip = tripId ? getTrip(tripId) : null;

  return (
    <div className="app">
      {!trip && (
        <>
          <header className="home-header">
            <h1>✈️ Viajes</h1>
            <p>Planeá viajes con vuelos, itinerario, mareas, presupuesto y checklist.</p>
          </header>
          <div className="trip-grid">
            {trips.map((t) => (
              <TripCard key={t.id} trip={t} onOpen={setTripId} />
            ))}
          </div>
          {trips.length === 0 && (
            <p className="empty">No hay viajes cargados. Agregá uno en <code>src/trips/</code>.</p>
          )}
        </>
      )}
      {trip && <TripDetail trip={trip} onBack={() => setTripId(null)} />}
    </div>
  );
}
