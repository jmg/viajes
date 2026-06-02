import { useEffect, useMemo, useState } from "react";
import type {
  DestinationCategory,
  RecommendationCriteria,
} from "../destinations/types";
import { CATEGORY_EMOJI, CATEGORY_LABEL } from "../destinations/types";
import { DESTINATIONS } from "../destinations/data";
import { recommendDestinations } from "../lib/recommender";
import { loadDiscoverFilters, saveDiscoverFilters } from "../lib/storage";
import { DestinationCard } from "./DestinationCard";
import { WorldMap } from "./WorldMap";

const SAVED = loadDiscoverFilters();

const MONTHS_FULL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const CATEGORIES_ORDER: DestinationCategory[] = ["beach", "mountain", "city", "cultural", "nature", "snow", "desert", "tropical", "island", "lake", "wine", "wildlife"];

const REGIONS = ["Sudamérica", "Norteamérica", "Centroamérica", "Caribe", "Europa", "Asia", "Oceanía", "África"];

type Props = {
  onCreateTripFromDestination: (destId: string, criteria: RecommendationCriteria) => void;
  onOpenDestination: (id: string, criteria: RecommendationCriteria) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  initialMonth?: number;
};

export function Discover({ onCreateTripFromDestination: _, onOpenDestination, wishlist, onToggleWishlist, initialMonth }: Props) {
  const now = new Date();
  const [month, setMonth] = useState<number>(initialMonth ?? now.getMonth() + 1);
  const [duration, setDuration] = useState<number>(SAVED?.duration ?? 10);
  const [selectedCategories, setSelectedCategories] = useState<DestinationCategory[]>(SAVED?.selectedCategories ?? []);
  const [minTemp, setMinTemp] = useState(SAVED?.minTemp ?? 18);
  const [maxTemp, setMaxTemp] = useState(SAVED?.maxTemp ?? 28);
  const [rainPref, setRainPref] = useState(SAVED?.rainPref ?? 0);
  const [maxCostTier, setMaxCostTier] = useState<"budget" | "mid" | "expensive">(SAVED?.maxCostTier ?? "expensive");
  const [maxFlightHours, setMaxFlightHours] = useState<number | "any">(SAVED?.maxFlightHours ?? "any");
  const [search, setSearch] = useState("");
  const [excludeRegions, setExcludeRegions] = useState<string[]>(SAVED?.excludeRegions ?? []);
  const [onlyWishlist, setOnlyWishlist] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Recordar los filtros entre sesiones (sliders, categorías, presupuesto, etc.).
  useEffect(() => {
    saveDiscoverFilters({
      duration, selectedCategories, minTemp, maxTemp,
      rainPref, maxCostTier, maxFlightHours, excludeRegions,
    });
  }, [duration, selectedCategories, minTemp, maxTemp, rainPref, maxCostTier, maxFlightHours, excludeRegions]);

  // rainPref 0 = sin preferencia (tolerante) … 100 = lo más seco. Mapea a mm/mes máximos.
  const maxRainMm = rainPref <= 3 ? undefined : Math.round(250 - (rainPref / 100) * 235);

  const criteria: RecommendationCriteria = useMemo(() => ({
    month,
    duration,
    categories: selectedCategories.length ? selectedCategories : undefined,
    preferredTempC: { min: minTemp, max: maxTemp },
    maxRainMm,
    maxCostTier,
    maxFlightHours: maxFlightHours === "any" ? undefined : maxFlightHours,
    search: search.trim() || undefined,
    excludeRegions: excludeRegions.length ? excludeRegions : undefined,
  }), [month, duration, selectedCategories, minTemp, maxTemp, maxRainMm, maxCostTier, maxFlightHours, search, excludeRegions]);

  const allResults = useMemo(() => recommendDestinations(DESTINATIONS, criteria), [criteria]);
  const results = useMemo(
    () => onlyWishlist ? allResults.filter((r) => wishlist.includes(r.destination.id)) : allResults,
    [allResults, onlyWishlist, wishlist],
  );

  const toggleCategory = (c: DestinationCategory) =>
    setSelectedCategories((curr) => curr.includes(c) ? curr.filter((x) => x !== c) : [...curr, c]);

  const toggleRegion = (r: string) =>
    setExcludeRegions((curr) => curr.includes(r) ? curr.filter((x) => x !== r) : [...curr, r]);

  const reset = () => {
    setSelectedCategories([]);
    setMinTemp(18);
    setMaxTemp(28);
    setRainPref(0);
    setMaxCostTier("expensive");
    setMaxFlightHours("any");
    setSearch("");
    setExcludeRegions([]);
    setOnlyWishlist(false);
  };

  const top = results.filter((r) => r.climateRating === "ideal" || r.climateRating === "good").length;

  return (
    <div className="discover">
      <header className="discover-header">
        <h2>🌎 ¿A dónde voy en {MONTHS_FULL[month - 1]}?</h2>
        <p>Decinos cuándo querés viajar y qué te gusta. Te recomendamos destinos con el mejor clima.</p>
      </header>

      <div className="presets">
        <span className="presets-label">Quick:</span>
        <button className="preset-chip" onClick={() => { setSelectedCategories(["beach", "tropical"]); setMinTemp(24); setMaxTemp(32); setRainPref(80); }}>
          🏖 Playa cálida y seca
        </button>
        <button className="preset-chip" onClick={() => { setSelectedCategories(["mountain", "snow"]); setMinTemp(-5); setMaxTemp(10); }}>
          ⛷ Nieve y montaña
        </button>
        <button className="preset-chip" onClick={() => { setSelectedCategories(["city", "cultural"]); setMinTemp(12); setMaxTemp(24); }}>
          🏛 Ciudades culturales
        </button>
        <button className="preset-chip" onClick={() => { setSelectedCategories(["nature", "wildlife"]); setMinTemp(12); setMaxTemp(28); }}>
          🌿 Naturaleza
        </button>
        <button className="preset-chip" onClick={() => { setMaxFlightHours(4); setSelectedCategories([]); }}>
          🇦🇷 Solo regional
        </button>
        <button className="preset-chip" onClick={() => { setMaxCostTier("budget"); setSelectedCategories([]); }}>
          💵 Económicos
        </button>
      </div>

      <div className="filter-panel">
        <div className="filter-row">
          <label className="field">
            <span>Mes del viaje</span>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))}>
              {MONTHS_FULL.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Duración (días)</span>
            <input type="number" min={1} max={60} value={duration} onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)} />
          </label>
          <label className="field">
            <span>Vuelo máx. desde EZE</span>
            <select value={String(maxFlightHours)} onChange={(e) => setMaxFlightHours(e.target.value === "any" ? "any" : parseInt(e.target.value, 10))}>
              <option value="any">Cualquiera</option>
              <option value="4">≤ 4h (regional)</option>
              <option value="8">≤ 8h (americas)</option>
              <option value="14">≤ 14h (transatlántico)</option>
              <option value="20">≤ 20h (intercont.)</option>
            </select>
          </label>
          <label className="field">
            <span>Presupuesto</span>
            <select value={maxCostTier} onChange={(e) => setMaxCostTier(e.target.value as "budget" | "mid" | "expensive")}>
              <option value="budget">Económico</option>
              <option value="mid">Hasta medio</option>
              <option value="expensive">Sin límite</option>
            </select>
          </label>
        </div>

        <div className="filter-block">
          <span className="filter-label">¿Qué buscás? <small>(múltiple)</small></span>
          <div className="category-chips">
            {CATEGORIES_ORDER.map((c) => (
              <button
                key={c}
                type="button"
                className={`cat-chip-btn ${selectedCategories.includes(c) ? "active" : ""}`}
                onClick={() => toggleCategory(c)}
              >
                {CATEGORY_EMOJI[c]} {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <div className="field">
            <span>Temperatura ideal: {minTemp}° – {maxTemp}°C</span>
            <div className="range-pair">
              <span className="range-icon" title="Frío" aria-label="Frío">🥶</span>
              <div className="range-sliders">
                <input type="range" min={-10} max={35} value={minTemp} aria-label="Temperatura mínima" onChange={(e) => setMinTemp(Math.min(parseInt(e.target.value, 10), maxTemp - 1))} />
                <input type="range" min={-10} max={40} value={maxTemp} aria-label="Temperatura máxima" onChange={(e) => setMaxTemp(Math.max(parseInt(e.target.value, 10), minTemp + 1))} />
              </div>
              <span className="range-icon" title="Calor" aria-label="Calor">🥵</span>
            </div>
          </div>
          <div className="field">
            <span>Lluvia: {rainPref <= 3 ? "sin preferencia" : `≤ ${maxRainMm} mm/mes`}</span>
            <div className="range-pair">
              <span className="range-icon" title="Más húmedo" aria-label="Más húmedo">💧</span>
              <div className="range-sliders">
                <input type="range" min={0} max={100} value={rainPref} aria-label="Preferencia de lluvia" onChange={(e) => setRainPref(parseInt(e.target.value, 10))} />
              </div>
              <span className="range-icon" title="Más seco" aria-label="Más seco">☀️</span>
            </div>
          </div>
        </div>

        <div className="filter-block">
          <span className="filter-label">Excluir regiones</span>
          <div className="region-chips">
            {REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                className={`region-chip ${excludeRegions.includes(r) ? "excluded" : ""}`}
                onClick={() => toggleRegion(r)}
              >
                {excludeRegions.includes(r) ? "🚫 " : ""}{r}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-footer">
          <input
            type="text"
            placeholder="Buscar por nombre o país..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <label className="field checkbox inline">
            <input type="checkbox" checked={onlyWishlist} onChange={(e) => setOnlyWishlist(e.target.checked)} />
            <span>❤️ Solo guardados ({wishlist.length})</span>
          </label>
          <button type="button" className="button-secondary" onClick={reset}>Reset filtros</button>
        </div>
      </div>

      <div className="results-summary">
        <strong>{results.length}</strong> destinos encontrados ·{" "}
        <strong>{top}</strong> con clima ideal o bueno en {MONTHS_FULL[month - 1]}
        <span className="view-toggle">
          <button className={`toggle-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>📋 Lista</button>
          <button className={`toggle-btn ${viewMode === "map" ? "active" : ""}`} onClick={() => setViewMode("map")}>🗺 Mapa</button>
        </span>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <p>No hay destinos que cumplan estos filtros.</p>
          <button className="button-secondary" onClick={reset}>Reset filtros</button>
        </div>
      ) : viewMode === "map" ? (
        <WorldMap results={results} onOpen={(id) => onOpenDestination(id, criteria)} />
      ) : (
        <div className="dest-grid">
          {results.map((r) => (
            <DestinationCard
              key={r.destination.id}
              result={r}
              isInWishlist={wishlist.includes(r.destination.id)}
              onOpen={(id) => onOpenDestination(id, criteria)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
