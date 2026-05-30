import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import type { Currency, Trip } from "./types";
import { useTrips } from "./hooks/useTrips";
import { TripCard } from "./components/TripCard";
import { TripForm } from "./components/TripForm";
import { Modal } from "./components/Modal";
import { Filters } from "./components/Filters";
import type { FilterId } from "./components/Filters";
import { ImportExport } from "./components/ImportExport";
import { Settings } from "./components/Settings";
import { ShareDialog } from "./components/ShareDialog";
import { SharedTripView } from "./components/SharedTripView";
import { ReservationImport } from "./components/ReservationImport";
import { Onboarding } from "./components/Onboarding";

// Vistas pesadas (dataset de destinos / muchos editores) cargadas on-demand.
const TripDetail = lazy(() => import("./components/TripDetail").then((m) => ({ default: m.TripDetail })));
const Discover = lazy(() => import("./components/Discover").then((m) => ({ default: m.Discover })));
const DestinationDetail = lazy(() => import("./components/DestinationDetail").then((m) => ({ default: m.DestinationDetail })));
import { DESTINATIONS } from "./destinations/data";
import type { RecommendationCriteria } from "./destinations/types";
import { autoStatus } from "./lib/status";
import { loadCurrency, saveCurrency } from "./lib/storage";
import { loadSettings, saveSettings } from "./lib/settings";
import type { Settings as SettingsType } from "./lib/settings";
import { getSharedTripFromHash, clearShareHash } from "./lib/share";
import { setAnalyticsEndpoint, track } from "./lib/analytics";

type View = "trips" | "discover";
type TripFormPrefill = { destinationName?: string; month?: number; duration?: number };
type EditingState = Trip | { mode: "new"; prefill?: TripFormPrefill } | null;

const WISHLIST_KEY = "viajes:wishlist:v1";
const ONBOARDED_KEY = "viajes:onboarded:v1";

export function App() {
  const { trips, upsert, remove, restoreSeeds, replaceAll } = useTrips();
  const [view, setView] = useState<View>("trips");
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [activeDestination, setActiveDestination] = useState<{ id: string; month?: number } | null>(null);
  const [editing, setEditing] = useState<EditingState>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [showImportExport, setShowImportExport] = useState(false);
  const [currency, setCurrency] = useState<Currency>(() => loadCurrency());
  const [settings, setSettings] = useState<SettingsType>(() => loadSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const [sharingTrip, setSharingTrip] = useState<Trip | null>(null);
  const [sharedTrip, setSharedTrip] = useState<Trip | null>(() => getSharedTripFromHash());
  const [onboarded, setOnboarded] = useState<boolean>(() => localStorage.getItem(ONBOARDED_KEY) === "1");
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]"); } catch { return []; }
  });

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDED_KEY, "1");
    setOnboarded(true);
  };

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    setAnalyticsEndpoint(settings.analyticsEndpoint);
  }, [settings.analyticsEndpoint]);

  const handleSettings = (s: SettingsType) => {
    setSettings(s);
    saveSettings(s);
  };

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
    const withStatus = trips.map((t) => ({ trip: t, status: autoStatus(t) }));
    const matchFilter = (s: string) => {
      if (filter === "all") return true;
      if (filter === "upcoming") return s === "planning" || s === "booked";
      return s === filter;
    };
    return withStatus
      .filter((x) => matchFilter(x.status))
      .sort((a, b) => {
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
    if (activeTripId === id) setActiveTripId(null);
  };

  const handleImport = (imported: Trip[], mode: "merge" | "replace") => {
    const next = mode === "replace"
      ? imported
      : [...trips, ...imported.filter((t) => !new Set(trips.map((x) => x.id)).has(t.id))];
    replaceAll(next);
    setShowImportExport(false);
  };

  const handleCreateTripFromDestination = (destId: string, criteria?: RecommendationCriteria) => {
    const d = DESTINATIONS.find((x) => x.id === destId);
    if (!d) return;
    setActiveDestination(null);
    setEditing({
      mode: "new",
      prefill: {
        destinationName: d.name,
        month: criteria?.month,
        duration: criteria?.duration ?? d.suggestedDuration?.min,
      },
    });
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

  // Renderiza la home con tabs
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
              <div className="home-actions">
                <button className="button-secondary" onClick={() => setShowReservation(true)}>
                  📥 Importar reserva
                </button>
                <button className="button-secondary" onClick={() => setShowSettings(true)}>
                  ⚙ Configuración
                </button>
                <button className="button-secondary" onClick={() => setShowImportExport(true)}>
                  ⇅ Import/Export
                </button>
                <button className="button-primary" onClick={() => setEditing({ mode: "new" })}>
                  + Nuevo viaje
                </button>
              </div>
            </div>
            <nav className="main-tabs">
              <button className={`main-tab ${view === "trips" ? "active" : ""}`} onClick={() => setView("trips")}>
                📋 Mis viajes ({trips.length})
              </button>
              <button className={`main-tab ${view === "discover" ? "active" : ""}`} onClick={openDiscover}>
                🌎 Descubrir destinos
                {wishlist.length > 0 && <span className="wishlist-count">❤️ {wishlist.length}</span>}
              </button>
            </nav>
          </header>

          {view === "trips" && (
            <>
              {!onboarded && (
                <Onboarding
                  settings={settings}
                  onNewTrip={() => { dismissOnboarding(); setEditing({ mode: "new" }); }}
                  onDiscover={() => { dismissOnboarding(); openDiscover(); }}
                  onImportReservation={() => { dismissOnboarding(); setShowReservation(true); }}
                  onOpenSettings={() => setShowSettings(true)}
                  onDismiss={dismissOnboarding}
                />
              )}
              <Filters value={filter} counts={counts} onChange={setFilter} />

              {filtered.length === 0 ? (
                <div className="empty-state">
                  {trips.length === 0 ? (
                    <>
                      <p>Todavía no tenés viajes cargados.</p>
                      <p>
                        <button className="button-primary" onClick={() => setEditing({ mode: "new" })}>+ Crear mi primer viaje</button>
                        {" "}o{" "}
                        <button className="button-secondary" onClick={openDiscover}>🌎 Descubrir destinos</button>
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
            settings={settings}
            onCurrencyChange={handleCurrency}
            onChange={upsert}
            onEdit={() => setEditing(activeTrip)}
            onDelete={() => handleDelete(activeTrip.id)}
            onBack={() => setActiveTripId(null)}
            onOpenSettings={() => setShowSettings(true)}
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
                duration: activeDest.suggestedDuration?.min,
              })}
            />
          </Suspense>
        </div>
      )}

      {editing && (
        <Modal
          title={"mode" in editing ? "Nuevo viaje" : "Editar viaje"}
          onClose={() => setEditing(null)}
          wide
        >
          <TripForm
            trip={"mode" in editing ? undefined : editing}
            prefill={"mode" in editing ? editing.prefill : undefined}
            onSave={(trip) => {
              upsert(trip);
              track("mode" in editing ? "trip_create" : "trip_edit");
              setEditing(null);
              if ("mode" in editing) setActiveTripId(trip.id);
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

      {showSettings && (
        <Modal title="Configuración" onClose={() => setShowSettings(false)}>
          <Settings settings={settings} onSave={handleSettings} onClose={() => setShowSettings(false)} />
        </Modal>
      )}

      {sharingTrip && (
        <Modal title="Compartir viaje" onClose={() => setSharingTrip(null)}>
          <ShareDialog trip={sharingTrip} />
        </Modal>
      )}

      {showReservation && (
        <Modal title="Importar reserva" onClose={() => setShowReservation(false)} wide>
          <ReservationImport
            settings={settings}
            onCreateTrip={(trip) => {
              upsert(trip);
              setShowReservation(false);
              setActiveTripId(trip.id);
            }}
            onOpenSettings={() => { setShowReservation(false); setShowSettings(true); }}
          />
        </Modal>
      )}
    </div>
  );
}
