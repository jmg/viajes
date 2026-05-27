import { useMemo, useState } from "react";
import type { Currency, Trip } from "./types";
import { useTrips } from "./hooks/useTrips";
import { TripCard } from "./components/TripCard";
import { TripDetail } from "./components/TripDetail";
import { TripForm } from "./components/TripForm";
import { Modal } from "./components/Modal";
import { Filters } from "./components/Filters";
import type { FilterId } from "./components/Filters";
import { ImportExport } from "./components/ImportExport";
import { autoStatus } from "./lib/status";
import { loadCurrency, saveCurrency } from "./lib/storage";

export function App() {
  const { trips, upsert, remove, restoreSeeds, replaceAll } = useTrips();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Trip | "new" | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [showImportExport, setShowImportExport] = useState(false);
  const [currency, setCurrency] = useState<Currency>(() => loadCurrency());

  const handleCurrency = (c: Currency) => {
    setCurrency(c);
    saveCurrency(c);
  };

  const active = activeId ? trips.find((t) => t.id === activeId) ?? null : null;

  const filtered = useMemo(() => {
    const withStatus = trips.map((t) => ({ trip: t, status: autoStatus(t) }));
    const matchFilter = (s: string) => {
      if (filter === "all") return true;
      if (filter === "upcoming") return s === "planning" || s === "booked";
      return s === filter;
    };
    return withStatus
      .filter((x) => matchFilter(x.status))
      .sort((a, b) => {
        // upcoming first by date, then in-progress, then past (most recent first)
        const order = { "in-progress": 0, planning: 1, booked: 1, past: 2 };
        const oa = order[a.status];
        const ob = order[b.status];
        if (oa !== ob) return oa - ob;
        if (a.status === "past") return b.trip.startDate.localeCompare(a.trip.startDate);
        return a.trip.startDate.localeCompare(b.trip.startDate);
      })
      .map((x) => x.trip);
  }, [trips, filter]);

  const counts = useMemo(() => {
    const c: Record<FilterId, number> = { all: 0, upcoming: 0, "in-progress": 0, past: 0 };
    for (const t of trips) {
      c.all++;
      const s = autoStatus(t);
      if (s === "past") c.past++;
      else if (s === "in-progress") c["in-progress"]++;
      else c.upcoming++;
    }
    return c;
  }, [trips]);

  const handleDelete = (id: string) => {
    const t = trips.find((x) => x.id === id);
    if (!t) return;
    if (!confirm(`¿Eliminar "${t.title}"? Esta acción no se puede deshacer.`)) return;
    remove(id);
    if (activeId === id) setActiveId(null);
  };

  const handleImport = (imported: Trip[], mode: "merge" | "replace") => {
    if (mode === "replace") {
      replaceAll(imported);
    } else {
      const existingIds = new Set(trips.map((t) => t.id));
      const toAdd = imported.filter((t) => !existingIds.has(t.id));
      replaceAll([...trips, ...toAdd]);
    }
    setShowImportExport(false);
  };

  return (
    <div className="app">
      {!active && (
        <>
          <header className="home-header">
            <div className="home-header-top">
              <div>
                <h1>✈️ Viajes</h1>
                <p>Planeá viajes con vuelos, itinerario, mareas, presupuesto y checklist.</p>
              </div>
              <div className="home-actions">
                <button className="button-secondary" onClick={() => setShowImportExport(true)}>
                  ⇅ Import/Export
                </button>
                <button className="button-primary" onClick={() => setEditing("new")}>
                  + Nuevo viaje
                </button>
              </div>
            </div>
          </header>

          <Filters value={filter} counts={counts} onChange={setFilter} />

          {filtered.length === 0 ? (
            <div className="empty-state">
              {trips.length === 0 ? (
                <>
                  <p>Todavía no tenés viajes cargados.</p>
                  <p>
                    <button className="button-primary" onClick={() => setEditing("new")}>+ Crear mi primer viaje</button>
                  </p>
                  <p className="hint">
                    <button className="link-button" onClick={restoreSeeds}>O cargar el ejemplo "Brasil noviembre 2026"</button>
                  </p>
                </>
              ) : (
                <p>No hay viajes en esta vista. Probá otro filtro.</p>
              )}
            </div>
          ) : (
            <div className="trip-grid">
              {filtered.map((t) => (
                <TripCard
                  key={t.id}
                  trip={t}
                  onOpen={setActiveId}
                  onEdit={(id) => setEditing(trips.find((x) => x.id === id) ?? null)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {active && (
        <TripDetail
          trip={active}
          currency={currency}
          onCurrencyChange={handleCurrency}
          onChange={upsert}
          onEdit={() => setEditing(active)}
          onDelete={() => handleDelete(active.id)}
          onBack={() => setActiveId(null)}
        />
      )}

      {editing && (
        <Modal
          title={editing === "new" ? "Nuevo viaje" : "Editar viaje"}
          onClose={() => setEditing(null)}
          wide
        >
          <TripForm
            trip={editing === "new" ? undefined : editing}
            onSave={(trip) => {
              upsert(trip);
              setEditing(null);
              if (editing === "new") setActiveId(trip.id);
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {showImportExport && (
        <Modal title="Import / Export" onClose={() => setShowImportExport(false)}>
          <ImportExport trips={trips} onImport={handleImport} />
        </Modal>
      )}
    </div>
  );
}
