import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import type { Currency, Trip } from "./types";
import { useTrips } from "./hooks/useTrips";
import { TripCard } from "./components/TripCard";
import { TripForm } from "./components/TripForm";
import { CreateTripWizard } from "./components/CreateTripWizard";
import type { WizardResult } from "./components/CreateTripWizard";
import { TEMPLATES, applyTemplate } from "./lib/templates";
import { Modal } from "./components/Modal";
import { Filters } from "./components/Filters";
import type { FilterId } from "./components/Filters";
import { ShareDialog } from "./components/ShareDialog";
import { SharedTripView } from "./components/SharedTripView";
import { HelpPage } from "./components/HelpPage";
import { SettingsPanel } from "./components/SettingsPanel";
import { useLang, useT } from "./i18n";

// Vistas pesadas (dataset de destinos / muchos editores) cargadas on-demand.
const TripDetail = lazy(() => import("./components/TripDetail").then((m) => ({ default: m.TripDetail })));
const Discover = lazy(() => import("./components/Discover").then((m) => ({ default: m.Discover })));
const DestinationDetail = lazy(() => import("./components/DestinationDetail").then((m) => ({ default: m.DestinationDetail })));
const CountryDetail = lazy(() => import("./components/CountryDetail").then((m) => ({ default: m.CountryDetail })));
import { DESTINATIONS } from "./destinations/data";
import type { Destination, RecommendationCriteria } from "./destinations/types";
import { autoStatus } from "./lib/status";
import { loadCurrency, saveCurrency, loadOrigin, saveOrigin } from "./lib/storage";
import { defaultCurrencyForCountry } from "./lib/currency";
import type { Airport } from "./lib/airports";
import { getSharedTripFromHash, clearShareHash } from "./lib/share";
import { track } from "./lib/analytics";

type View = "trips" | "discover";

type Route =
  | { kind: "discover" }
  | { kind: "trips" }
  | { kind: "help" }
  | { kind: "destino"; id: string; month?: number }
  | { kind: "pais"; country: string }
  | { kind: "viaje"; id: string };

function parseHash(): Route {
  const h = window.location.hash;
  let m: RegExpMatchArray | null;
  if ((m = h.match(/^#\/destino\/([^/]+)(?:\/(\d+))?$/))) {
    return { kind: "destino", id: decodeURIComponent(m[1]), month: m[2] ? parseInt(m[2], 10) : undefined };
  }
  if ((m = h.match(/^#\/pais\/([^/]+)$/))) return { kind: "pais", country: decodeURIComponent(m[1]) };
  if ((m = h.match(/^#\/viaje\/([^/]+)$/))) return { kind: "viaje", id: decodeURIComponent(m[1]) };
  if (h === "#/viajes") return { kind: "trips" };
  if (h === "#/ayuda") return { kind: "help" };
  return { kind: "discover" };
}

function routeToHash(r: Route): string {
  switch (r.kind) {
    case "destino": return `#/destino/${encodeURIComponent(r.id)}${r.month ? `/${r.month}` : ""}`;
    case "pais": return `#/pais/${encodeURIComponent(r.country)}`;
    case "viaje": return `#/viaje/${encodeURIComponent(r.id)}`;
    case "trips": return "#/viajes";
    case "help": return "#/ayuda";
    default: return "#/descubrir";
  }
}

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
  // end = ida + duración, de modo que daysBetween(start, end) == los días pedidos
  // (la app cuenta los días como diferencia de fechas, ver lib/format daysBetween).
  const end = new Date(year, m - 1, Math.min(28, 1 + Math.max(1, duration ?? 7)));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

/** Arma un viaje listo para usar a partir de un destino — sin formularios. */
function tripFromDestination(d: Destination, month?: number, duration?: number): Trip {
  const { start, end } = computeDates(month, duration ?? d.suggestedDuration?.min);
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
  const t = useT();
  useLang(); // suscribe la app entera al cambio de idioma
  const { trips, upsert, remove, restoreSeeds } = useTrips();
  // Estado inicial desde la URL (hash), salvo que sea un link de "compartir".
  const initialRoute = getSharedTripFromHash() ? null : parseHash();
  const [view, setView] = useState<View>(initialRoute?.kind === "trips" ? "trips" : "discover");
  const [activeTripId, setActiveTripId] = useState<string | null>(initialRoute?.kind === "viaje" ? initialRoute.id : null);
  const [activeDestination, setActiveDestination] = useState<{ id: string; month?: number } | null>(
    initialRoute?.kind === "destino" ? { id: initialRoute.id, month: initialRoute.month } : null,
  );
  const [activeCountry, setActiveCountry] = useState<string | null>(
    initialRoute?.kind === "pais" ? initialRoute.country : null,
  );
  const [editing, setEditing] = useState<Trip | null>(null);
  const [creating, setCreating] = useState(false);
  const [wizard, setWizard] = useState<{ dest: Destination; start: string; end: string } | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState<Currency>(() => loadCurrency() ?? defaultCurrencyForCountry(loadOrigin()?.countryCode));
  const [sharingTrip, setSharingTrip] = useState<Trip | null>(null);
  const [showHelp, setShowHelp] = useState(initialRoute?.kind === "help");
  const [showSettings, setShowSettings] = useState(false);
  const [origin, setOrigin] = useState<Airport | null>(() => loadOrigin());
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

  // Sincronizar el estado actual con la URL (hash) para que recargar mantenga la vista.
  useEffect(() => {
    if (sharedTrip) return; // los links de compartir manejan su propio hash
    let r: Route;
    if (showHelp) r = { kind: "help" };
    else if (activeTrip) r = { kind: "viaje", id: activeTrip.id };
    else if (activeDest) r = { kind: "destino", id: activeDest.id, month: activeDestination?.month };
    else if (activeCountry) r = { kind: "pais", country: activeCountry };
    else r = { kind: view };
    const target = routeToHash(r);
    if (window.location.hash !== target) history.pushState(null, "", target);
  }, [view, activeTrip, activeDest, activeDestination, activeCountry, showHelp, sharedTrip]);

  // Título de la ventana + favicon (bandera del país al ver un destino).
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    const DEFAULT_ICON = `${import.meta.env.BASE_URL}icon.svg`;
    const flagIcon = (flag: string) =>
      "data:image/svg+xml," +
      encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="32" y="50" font-size="52" text-anchor="middle">${flag}</text></svg>`);
    const setIcon = (href: string) => { if (link) link.href = href; };

    if (sharedTrip) {
      document.title = `${sharedTrip.title} — Viajes`;
    } else if (activeDest) {
      document.title = `${activeDest.name}, ${activeDest.country} — Viajes`;
      setIcon(flagIcon(activeDest.flag));
    } else if (activeTrip) {
      document.title = `${activeTrip.title} — Viajes`;
      setIcon(DEFAULT_ICON);
    } else if (showHelp) {
      document.title = "Ayuda — Viajes";
      setIcon(DEFAULT_ICON);
    } else {
      document.title = "Viajes — destinos por clima";
      setIcon(DEFAULT_ICON);
    }
  }, [activeDest, activeTrip, showHelp, sharedTrip]);

  // Botón atrás/adelante del navegador → actualizar la vista.
  useEffect(() => {
    const onPop = () => {
      if (getSharedTripFromHash()) return;
      const r = parseHash();
      setShowHelp(r.kind === "help");
      setActiveTripId(r.kind === "viaje" ? r.id : null);
      setActiveDestination(r.kind === "destino" ? { id: r.id, month: r.month } : null);
      setActiveCountry(r.kind === "pais" ? r.country : null);
      if (r.kind === "trips") setView("trips");
      else if (r.kind === "discover") setView("discover");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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
    const trip = trips.find((x) => x.id === id);
    if (!trip) return;
    if (!confirm(t("home.deleteConfirm", { title: trip.title }))) return;
    remove(id);
    if (activeTripId === id) setActiveTripId(null);
  };

  const handleOrigin = (o: Airport | null) => {
    setOrigin(o);
    saveOrigin(o);
    // Si el usuario nunca eligió moneda a mano, ajustamos el default al país del origen.
    if (o && loadCurrency() === null) setCurrency(defaultCurrencyForCountry(o.countryCode));
  };

  // Crear viaje desde un destino: abre un asistente con pasos para que el
  // usuario confirme fechas, viajeros y estilo antes de crearlo.
  const handleCreateTripFromDestination = (destId: string, criteria?: RecommendationCriteria) => {
    const d = DESTINATIONS.find((x) => x.id === destId);
    if (!d) return;
    const month = criteria?.month ?? activeDestination?.month;
    const duration = criteria?.duration ?? d.suggestedDuration?.min;
    const { start, end } = computeDates(month, duration);
    setWizard({ dest: d, start, end });
  };

  // El usuario confirmó el asistente: armamos el viaje con sus respuestas.
  const handleWizardCreate = (result: WizardResult) => {
    if (!wizard) return;
    const d = wizard.dest;
    const trip = tripFromDestination(d);
    trip.startDate = result.startDate;
    trip.endDate = result.endDate;
    trip.travelers = result.travelers;
    if (result.destinations.length) trip.destinations = result.destinations;
    trip.origin = result.origin || origin?.city || trip.origin;
    if (result.title) trip.title = result.title;
    if (result.templateId !== "blank") {
      const template = TEMPLATES.find((x) => x.id === result.templateId);
      if (template) Object.assign(trip, applyTemplate(template));
    }
    upsert(trip);
    track("trip_create");
    setWizard(null);
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

  if (showHelp) {
    return (
      <div className="app">
        <HelpPage onBack={() => setShowHelp(false)} onDiscover={() => { setShowHelp(false); openDiscover(); }} />
      </div>
    );
  }

  const isHome = !activeTrip && !activeDest && !activeCountry;

  // Abrir la página de un país (desde un destino). Cierra la vista de destino.
  const openCountry = (country: string) => {
    setActiveDestination(null);
    setActiveCountry(country);
    window.scrollTo(0, 0);
  };

  return (
    <div className="app">
      {isHome && (
        <>
          <header className="home-header">
            <div className="home-header-top">
              <div>
                <h1>✈️ <span className="brand-grad">Viajes</span></h1>
                <p>{t("home.tagline")}</p>
              </div>
              <div className="home-actions">
                <button className="button-secondary" onClick={() => setShowSettings(true)}>{t("home.settings")}</button>
                <button className="button-secondary" onClick={() => setShowHelp(true)}>{t("home.help")}</button>
              </div>
            </div>
            <nav className="main-tabs">
              <button className={`main-tab ${view === "discover" ? "active" : ""}`} onClick={openDiscover}>
                {t("home.discoverTab")}
                {wishlist.length > 0 && <span className="wishlist-count">❤️ {wishlist.length}</span>}
              </button>
              <button className={`main-tab ${view === "trips" ? "active" : ""}`} onClick={() => setView("trips")}>
                {t("home.tripsTab", { count: trips.length })}
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
                  placeholder={t("home.searchPlaceholder")}
                />
                {searchQuery && (
                  <button className="icon-button" onClick={() => setSearchQuery("")} title={t("common.clear")}>✕</button>
                )}
                <button className="button-primary new-trip-btn" onClick={() => setCreating(true)}>{t("home.newTrip")}</button>
              </div>
              <Filters value={filter} counts={counts} onChange={setFilter} />

              {filtered.length === 0 ? (
                <div className="empty-state">
                  {trips.length === 0 ? (
                    <>
                      <p>{t("home.noTrips")}</p>
                      <p>{t("home.noTripsHint")}</p>
                      <p className="empty-cta-row">
                        <button className="button-primary" onClick={openDiscover}>{t("home.discoverDestinations")}</button>
                        <button className="button-secondary" onClick={() => setCreating(true)}>{t("home.newTripManual")}</button>
                      </p>
                      <p className="hint">
                        <button className="link-button" onClick={restoreSeeds}>{t("home.loadExample")}</button>
                      </p>
                    </>
                  ) : (
                    <p>{t("home.noTripsInView")}</p>
                  )}
                </div>
              ) : (
                <div className="trip-grid">
                  {filtered.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onOpen={setActiveTripId}
                      onEdit={(id) => {
                        const found = trips.find((x) => x.id === id);
                        if (found) setEditing(found);
                      }}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {view === "discover" && (
            <Suspense fallback={<div className="loading">{t("common.loading")}</div>}>
              <Discover
                origin={origin}
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
        <Suspense fallback={<div className="loading">{t("common.loading")}</div>}>
          <TripDetail
            trip={activeTrip}
            currency={currency}
            onCurrencyChange={handleCurrency}
            onChange={upsert}
            onEdit={() => setEditing(activeTrip)}
            onDelete={() => handleDelete(activeTrip.id)}
            onBack={() => { setActiveTripId(null); setView("trips"); }}
            onShare={() => { setSharingTrip(activeTrip); track("share_open"); }}
          />
        </Suspense>
      )}

      {activeDest && (
        <div className="dest-detail-wrap">
          <button className="back-button" onClick={() => setActiveDestination(null)}>← {t("common.back")}</button>
          <Suspense fallback={<div className="loading">{t("common.loading")}</div>}>
            <DestinationDetail
              destination={activeDest}
              origin={origin}
              highlightMonth={activeDestination?.month}
              isInWishlist={isInWishlist(activeDest.id)}
              onToggleWishlist={() => toggleWishlist(activeDest.id)}
              onCreateTrip={() => handleCreateTripFromDestination(activeDest.id, {
                month: activeDestination?.month ?? new Date().getMonth() + 1,
              })}
              onOpenCountry={openCountry}
            />
          </Suspense>
        </div>
      )}

      {activeCountry && !activeDest && (
        <div className="dest-detail-wrap">
          <button className="back-button" onClick={() => setActiveCountry(null)}>← {t("common.back")}</button>
          <Suspense fallback={<div className="loading">{t("common.loading")}</div>}>
            <CountryDetail
              country={activeCountry}
              origin={origin}
              wishlist={wishlist}
              onOpenDestination={(id) => { setActiveCountry(null); setActiveDestination({ id }); }}
              onToggleWishlist={toggleWishlist}
              onCreateTrip={(id) => handleCreateTripFromDestination(id)}
            />
          </Suspense>
        </div>
      )}

      {editing && (
        <Modal title={t("home.editTripTitle")} onClose={() => setEditing(null)} wide>
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

      {wizard && (
        <Modal title={t("tripWizard.title", { name: wizard.dest.name })} onClose={() => setWizard(null)}>
          <CreateTripWizard
            destination={wizard.dest}
            initialStart={wizard.start}
            initialEnd={wizard.end}
            defaultOrigin={origin?.city}
            onCreate={handleWizardCreate}
            onCancel={() => setWizard(null)}
          />
        </Modal>
      )}

      {creating && (
        <Modal title={t("home.newTripTitle")} onClose={() => setCreating(false)} wide>
          <TripForm
            defaultOrigin={origin?.city}
            onSave={(trip) => {
              upsert(trip);
              track("trip_create");
              setCreating(false);
              setView("trips");
              setActiveTripId(trip.id);
            }}
            onCancel={() => setCreating(false)}
          />
        </Modal>
      )}

      {sharingTrip && (
        <Modal title={t("home.shareTripTitle")} onClose={() => setSharingTrip(null)}>
          <ShareDialog trip={sharingTrip} />
        </Modal>
      )}

      {showSettings && (
        <Modal title={t("settings.title")} onClose={() => setShowSettings(false)} wide>
          <SettingsPanel origin={origin} onOriginChange={handleOrigin} />
        </Modal>
      )}
    </div>
  );
}
