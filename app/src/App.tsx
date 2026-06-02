import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import type { Currency, Trip } from "./types";
import { useTrips } from "./hooks/useTrips";
import { TripCard } from "./components/TripCard";
import { TripForm } from "./components/TripForm";
import { Modal } from "./components/Modal";
import { Filters } from "./components/Filters";
import type { FilterId } from "./components/Filters";
import { ShareDialog } from "./components/ShareDialog";
import { SharedTripView } from "./components/SharedTripView";

// Vistas pesadas (dataset de destinos / muchos editores) cargadas on-demand.
const TripDetail = lazy(() => import("./components/TripDetail").then((m) => ({ default: m.TripDetail })));
const Discover = lazy(() => import("./components/Discover").then((m) => ({ default: m.Discover })));
const DestinationDetail = lazy(() => import("./components/DestinationDetail").then((m) => ({ default: m.DestinationDetail })));
import { DESTINATIONS } from "./destinations/data";
import type { Destination, RecommendationCriteria } from "./destinations/types";
import { autoStatus } from "./lib/status";
import { loadCurrency, saveCurrency } from "./lib/storage";
import { getSharedTripFromHash, clearShareHash } from "./lib/share";
import { track } from "./lib/analytics";

type View = "trips" | "discover";

const WISHLIST_KEY = "viajes:wishlist:v1";
const COASTAL_CATS = new Set(["beach", "island", "tropical", "lake"]);

const newId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `trip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

/** Fechas de la próxima ocurrencia del mes elegido, con la duración sugerida. */
function computeDates(month?: number, duration?: number): { start: string; end: string } {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  let year = now.getFullYear();
  if (m <= now.getMonth() + 1) year += 1; // próxima vez que llega ese mes
  const start = new Date(year, m - 1, 1);
  const end = new Date(year, m - 1, Math.min(28, Math.max(2, duration ?? 7)));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

/** Arma un viaje listo para usar a partir de un destino — sin formularios. */
function tripFromDestination(d: Destination, month?: number): Trip {
  const { start, end } = computeDates(month, d.suggestedDuration?.min);
  const coastal = d.categories.some((c) => COASTAL_CATS.has(c));
  return {
    id: newId(),
    title: `Viaje a ${d.name}`,
    subtitle: `${d.country} · ${d.region}`,
    startDate: start,
    endDate: end,
    origin: "Buenos Aires",
    destinations: [d.name],
    travelers: 1,
    status: "planning",
    coastal: coastal || undefined,
    summary: d.description,
  };
}

export function App() {
  const { trips, upsert, remove, restoreSeeds } = useTrips();
  const [view, setView] = useState<View>("discover");
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [activeDestination, setActiveDestination] = useState<{ id: string; month?: number } | null>(null);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState<Currency>(() => loadCurrency());
  const [sharingTrip, setSharingTrip] = useState<Trip | null>(null);
  const [sharedTrip, setSharedTrip] = useState<Trip | null>(() => getSharedTripFromHash());
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const saveSharedCopy = () => {
    if (!sharedTrip) return;
    const copy: Trip = { ...sharedTrip, id: `${sharedTrip.id}-copy-${Date.now().toString(36)}`, title: `${sharedTrip.title} (copia)` };
    upsert(copy);
    clearShareHash();
    setSharedTrip(null);
    setActiveTripId(copy.id);
  };

  const dismissShared = () => {
    clearShareHash();
    setSharedTrip(null);
  };

  const handleCurrency = (c: Currency) => {
    setCurrency(c);
    saveCurrency(c);
  };

  const openDiscover = () => {
    setView("discover");
    track("discover_open");
  };

  const activeTrip = activeTripId ? trips.find((t) => t.id === activeTripId) ?? null : null;
  const activeDest = activeDestination ? DESTINATIONS.find((d) => d.id === activeDestination.id) ?? null : null;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matchQuery = (t: Trip) => {
      if (!q) return true;
      const hay = [t.title, t.subtitle, t.summary, t.origin, ...t.destinations].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    };
    const withStatus = trips.map((t) => ({ trip: t, status: autoStatus(t) }));
    const matchFilter = (s: string) => {
      if (filter === "all") return true;
      if (filter === "upcoming") return s === "planning" || s === "booked";
      return s === filter;
    };
    return withStatus
      .filter((x) => matchFilter(x.status) && matchQuery(x.trip))
      .sort((a, b) => {
        const order = { "in-progress": 0, planning: 1, booked: 1, past: 2 };
        const oa = order[a.status];
        const ob = order[b.status];
        if (oa !== ob) return oa - ob;
        if (a.status === "past") return b.trip.startDate.localeCompare(a.trip.startDate);
        return a.trip.startDate.localeCompare(b.trip.startDate);
      })
      .map((x) => x.trip);
  }, [trips, filter, searchQuery]);

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
    if (activeTripId === id) setActiveTripId(null);
  };

  // Crear viaje desde un destino: se arma solo y se abre. Sin formularios.
  const handleCreateTripFromDestination = (destId: string, criteria?: RecommendationCriteria) => {
    const d = DESTINATIONS.find((x) => x.id === destId);
    if (!d) return;
    const trip = tripFromDestination(d, criteria?.month ?? activeDestination?.month);
    upsert(trip);
    track("trip_create");
    setActiveDestination(null);
    setActiveTripId(trip.id);
  };

  const toggleWishlist = (id: string) =>
    setWishlist((curr) => {
      if (curr.includes(id)) return curr.filter((x) => x !== id);
      track("wishlist_add", { id });
      return [...curr, id];
    });

  const isInWishlist = (id: string): boolean => wishlist.includes(id);

  // Vista de viaje compartido tiene prioridad sobre todo lo demás.
  if (sharedTrip) {
    return (
      <div className="app">
        <SharedTripView trip={sharedTrip} onSaveCopy={saveSharedCopy} onDismiss={dismissShared} />
      </div>
    );
  }

  const isHome = !activeTrip && !activeDest;

  return (
    <div className="app">
      {isHome && (
        <>
          <header className="home-header">
            <div className="home-header-top">
              <div>
                <h1>✈️ Viajes</h1>
                <p>Descubrí destinos según el clima y planeá tu próxima aventura.</p>
              </div>
            </div>
            <nav className="main-tabs">
              <button className={`main-tab ${view === "discover" ? "active" : ""}`} onClick={openDiscover}>
                🌎 Descubrir destinos
                {wishlist.length > 0 && <span className="wishlist-count">❤️ {wishlist.length}</span>}
              </button>
              <button className={`main-tab ${view === "trips" ? "active" : ""}`} onClick={() => setView("trips")}>
                📋 Mis viajes ({trips.length})
              </button>
            </nav>
          </header>

          {view === "trips" && (
            <>
              <div className="search-row">
                <input
                  className="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔎 Buscar por título, destino o resumen…"
                />
                {searchQuery && (
                  <button className="icon-button" onClick={() => setSearchQuery("")} title="Limpiar">✕</button>
                )}
              </div>
              <Filters value={filter} counts={counts} onChange={setFilter} />

              {filtered.length === 0 ? (
                <div className="empty-state">
                  {trips.length === 0 ? (
                    <>
                      <p>Todavía no tenés viajes.</p>
                      <p>Elegí un destino en <strong>Descubrir</strong> y se crea solo.</p>
                      <p>
                        <button className="button-primary" onClick={openDiscover}>🌎 Descubrir destinos</button>
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
                      onOpen={setActiveTripId}
                      onEdit={(id) => {
                        const t = trips.find((x) => x.id === id);
                        if (t) setEditing(t);
                      }}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {view === "discover" && (
            <Suspense fallback={<div className="loading">Cargando…</div>}>
              <Discover
                onCreateTripFromDestination={handleCreateTripFromDestination}
                onOpenDestination={(id, criteria) => setActiveDestination({ id, month: criteria.month })}
                wishlist={wishlist}
                onToggleWishlist={toggleWishlist}
              />
            </Suspense>
          )}
        </>
      )}

      {activeTrip && (
        <Suspense fallback={<div className="loading">Cargando…</div>}>
          <TripDetail
            trip={activeTrip}
            currency={currency}
            onCurrencyChange={handleCurrency}
            onChange={upsert}
            onEdit={() => setEditing(activeTrip)}
            onDelete={() => handleDelete(activeTrip.id)}
            onBack={() => setActiveTripId(null)}
            onShare={() => { setSharingTrip(activeTrip); track("share_open"); }}
          />
        </Suspense>
      )}

      {activeDest && (
        <div className="dest-detail-wrap">
          <button className="back-button" onClick={() => setActiveDestination(null)}>← Volver</button>
          <Suspense fallback={<div className="loading">Cargando…</div>}>
            <DestinationDetail
              destination={activeDest}
              highlightMonth={activeDestination?.month}
              isInWishlist={isInWishlist(activeDest.id)}
              onToggleWishlist={() => toggleWishlist(activeDest.id)}
              onCreateTrip={() => handleCreateTripFromDestination(activeDest.id, {
                month: activeDestination?.month ?? new Date().getMonth() + 1,
              })}
            />
          </Suspense>
        </div>
      )}

      {editing && (
        <Modal title="Editar viaje" onClose={() => setEditing(null)} wide>
          <TripForm
            trip={editing}
            onSave={(trip) => {
              upsert(trip);
              track("trip_edit");
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {sharingTrip && (
        <Modal title="Compartir viaje" onClose={() => setSharingTrip(null)}>
          <ShareDialog trip={sharingTrip} />
        </Modal>
      )}
    </div>
  );
}
