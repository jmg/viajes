import { useEffect, useMemo, useState } from "react";
import type {
  DestinationCategory,
  RecommendationCriteria,
} from "../destinations/types";
import { CATEGORY_EMOJI } from "../destinations/types";
import { DESTINATIONS } from "../destinations/data";
import { recommendDestinations } from "../lib/recommender";
import { loadDiscoverFilters, saveDiscoverFilters } from "../lib/storage";
import { DestinationCard } from "./DestinationCard";
import { WorldMap } from "./WorldMap";
import { InfoTip } from "./InfoTip";
import type { Airport } from "../lib/airports";
import { useT } from "../i18n";
import { catLabel, regionLabel } from "../i18n/labels";
import { monthName } from "../lib/format";

const CATEGORIES_ORDER: DestinationCategory[] = ["beach", "mountain", "city", "cultural", "nature", "snow", "desert", "tropical", "island", "lake", "wine", "wildlife"];

const REGIONS = ["Sudamérica", "Norteamérica", "Centroamérica", "Caribe", "Europa", "Asia", "Oceanía", "África"];

type Props = {
  origin?: Airport | null;
  onCreateTripFromDestination: (destId: string, criteria: RecommendationCriteria) => void;
  onOpenDestination: (id: string, criteria: RecommendationCriteria) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  initialMonth?: number;
};

export function Discover({ origin, onCreateTripFromDestination, onOpenDestination, wishlist, onToggleWishlist, initialMonth }: Props) {
  const t = useT();
  const now = new Date();
  // Se relee en cada montaje (al volver de un destino/viaje en la SPA no se pierde nada).
  const saved = useMemo(() => loadDiscoverFilters() ?? {}, []);
  const [month, setMonth] = useState<number>(saved.month ?? initialMonth ?? now.getMonth() + 1);
  const [duration, setDuration] = useState<number>(saved.duration ?? 10);
  const [selectedCategories, setSelectedCategories] = useState<DestinationCategory[]>(saved.selectedCategories ?? []);
  const [minTemp, setMinTemp] = useState(saved.minTemp ?? 18);
  const [maxTemp, setMaxTemp] = useState(saved.maxTemp ?? 28);
  const [rainPref, setRainPref] = useState(saved.rainPref ?? 0);
  const [maxCostTier, setMaxCostTier] = useState<"budget" | "mid" | "expensive">(saved.maxCostTier ?? "expensive");
  const [maxFlightHours, setMaxFlightHours] = useState<number | "any">(saved.maxFlightHours ?? "any");
  const [search, setSearch] = useState(saved.search ?? "");
  const [includeRegions, setIncludeRegions] = useState<string[]>(saved.includeRegions ?? []);
  const [onlyWishlist, setOnlyWishlist] = useState(saved.onlyWishlist ?? false);
  const [viewMode, setViewMode] = useState<"list" | "map">(saved.viewMode ?? "list");

  // Recordar TODOS los selectores entre sesiones y navegación en la SPA.
  useEffect(() => {
    saveDiscoverFilters({
      month, duration, selectedCategories, minTemp, maxTemp,
      rainPref, maxCostTier, maxFlightHours, includeRegions,
      search, onlyWishlist, viewMode,
    });
  }, [month, duration, selectedCategories, minTemp, maxTemp, rainPref, maxCostTier, maxFlightHours, includeRegions, search, onlyWishlist, viewMode]);

  // rainPref 0 = sin preferencia (tolerante) … 100 = lo más seco. Mapea a mm/mes máximos.
  const maxRainMm = rainPref <= 3 ? undefined : Math.round(250 - (rainPref / 100) * 235);

  // Slider de temperatura de dos perillas (rango -10° a 40°).
  const T_MIN = -10, T_MAX = 40;
  const minPct = ((minTemp - T_MIN) / (T_MAX - T_MIN)) * 100;
  const maxPct = ((maxTemp - T_MIN) / (T_MAX - T_MIN)) * 100;

  const criteria: RecommendationCriteria = useMemo(() => ({
    month,
    duration,
    categories: selectedCategories.length ? selectedCategories : undefined,
    preferredTempC: { min: minTemp, max: maxTemp },
    maxRainMm,
    maxCostTier,
    maxFlightHours: maxFlightHours === "any" ? undefined : maxFlightHours,
    originLatLng: origin ? { lat: origin.lat, lng: origin.lng } : undefined,
    search: search.trim() || undefined,
    includeRegions: includeRegions.length ? includeRegions : undefined,
  }), [month, duration, selectedCategories, minTemp, maxTemp, maxRainMm, maxCostTier, maxFlightHours, origin, search, includeRegions]);

  const allResults = useMemo(() => recommendDestinations(DESTINATIONS, criteria), [criteria]);
  const results = useMemo(
    () => onlyWishlist ? allResults.filter((r) => wishlist.includes(r.destination.id)) : allResults,
    [allResults, onlyWishlist, wishlist],
  );

  const toggleCategory = (c: DestinationCategory) =>
    setSelectedCategories((curr) => curr.includes(c) ? curr.filter((x) => x !== c) : [...curr, c]);

  const toggleRegion = (r: string) =>
    setIncludeRegions((curr) => curr.includes(r) ? curr.filter((x) => x !== r) : [...curr, r]);

  const reset = () => {
    setSelectedCategories([]);
    setMinTemp(18);
    setMaxTemp(28);
    setRainPref(0);
    setMaxCostTier("expensive");
    setMaxFlightHours("any");
    setSearch("");
    setIncludeRegions([]);
    setOnlyWishlist(false);
  };

  const top = results.filter((r) => r.climateRating === "ideal" || r.climateRating === "good").length;

  return (
    <div className="discover">
      <header className="discover-header">
        <h2>{t("discover.title", { month: monthName(month) })}</h2>
        <p>{t("discover.subtitle")}</p>
      </header>

      <div className="presets">
        <span className="presets-label">{t("discover.quickLabel")}</span>
        <button className="preset-chip" onClick={() => { setSelectedCategories(["beach", "tropical"]); setMinTemp(24); setMaxTemp(32); setRainPref(80); }}>
          {t("discover.presetBeach")}
        </button>
        <button className="preset-chip" onClick={() => { setSelectedCategories(["mountain", "snow"]); setMinTemp(-5); setMaxTemp(10); }}>
          {t("discover.presetSnow")}
        </button>
        <button className="preset-chip" onClick={() => { setSelectedCategories(["city", "cultural"]); setMinTemp(12); setMaxTemp(24); }}>
          {t("discover.presetCity")}
        </button>
        <button className="preset-chip" onClick={() => { setSelectedCategories(["nature", "wildlife"]); setMinTemp(12); setMaxTemp(28); }}>
          {t("discover.presetNature")}
        </button>
        <button className="preset-chip" onClick={() => { setMaxFlightHours(4); setSelectedCategories([]); }}>
          {t("discover.presetRegional")}
        </button>
        <button className="preset-chip" onClick={() => { setMaxCostTier("budget"); setSelectedCategories([]); }}>
          {t("discover.presetBudget")}
        </button>
      </div>

      <div className="filter-panel">
        <div className="filter-row">
          <label className="field">
            <span>{t("discover.monthField")}</span>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))}>
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{monthName(i + 1)}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t("discover.durationField")}</span>
            <input type="number" min={1} max={60} value={duration} onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)} />
          </label>
          <label className="field">
            <span>{t("discover.flightField", { code: origin?.code ?? "EZE" })}</span>
            <select value={String(maxFlightHours)} onChange={(e) => setMaxFlightHours(e.target.value === "any" ? "any" : parseInt(e.target.value, 10))}>
              <option value="any">{t("discover.flightAny")}</option>
              <option value="4">{t("discover.flight4")}</option>
              <option value="8">{t("discover.flight8")}</option>
              <option value="11">{t("discover.flight11")}</option>
              <option value="14">{t("discover.flight14")}</option>
              <option value="20">{t("discover.flight20")}</option>
            </select>
          </label>
          <label className="field">
            <span>{t("discover.budgetField")}</span>
            <select value={maxCostTier} onChange={(e) => setMaxCostTier(e.target.value as "budget" | "mid" | "expensive")}>
              <option value="budget">{t("discover.budgetBudget")}</option>
              <option value="mid">{t("discover.budgetMid")}</option>
              <option value="expensive">{t("discover.budgetAny")}</option>
            </select>
          </label>
        </div>

        <div className="filter-block">
          <span className="filter-label">{t("discover.whatLabel")} <small>{t("discover.whatMultiple")}</small></span>
          <div className="category-chips">
            {CATEGORIES_ORDER.map((c) => (
              <button
                key={c}
                type="button"
                className={`cat-chip-btn ${selectedCategories.includes(c) ? "active" : ""}`}
                onClick={() => toggleCategory(c)}
              >
                {CATEGORY_EMOJI[c]} {catLabel(c)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <div className="field">
            <span>
              {t("discover.tempLabel", { min: minTemp, max: maxTemp })}
              <InfoTip tip={t("discover.tempTip")} />
            </span>
            <div className="range-pair">
              <span className="range-icon" title={t("discover.cold")} aria-label={t("discover.cold")}>🥶</span>
              <div className="dual-range">
                <div className="dual-track" />
                <div className="dual-fill" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
                <input type="range" min={T_MIN} max={T_MAX} value={minTemp} aria-label={t("discover.tempMinAria")} onChange={(e) => setMinTemp(Math.min(parseInt(e.target.value, 10), maxTemp - 1))} />
                <input type="range" min={T_MIN} max={T_MAX} value={maxTemp} aria-label={t("discover.tempMaxAria")} onChange={(e) => setMaxTemp(Math.max(parseInt(e.target.value, 10), minTemp + 1))} />
              </div>
              <span className="range-icon" title={t("discover.hot")} aria-label={t("discover.hot")}>🥵</span>
            </div>
          </div>
          <div className="field">
            <span>
              {t("discover.rainLabel", { value: rainPref <= 3 ? t("discover.rainNoPref") : t("discover.rainMax", { mm: maxRainMm ?? 0 }) })}
              <InfoTip tip={t("discover.rainTip")} />
            </span>
            <div className="range-pair">
              <span className="range-icon" title={t("discover.wetter")} aria-label={t("discover.wetter")}>💧</span>
              <div className="range-sliders">
                <input type="range" min={0} max={100} value={rainPref} aria-label={t("discover.rainPrefAria")} onChange={(e) => setRainPref(parseInt(e.target.value, 10))} />
              </div>
              <span className="range-icon" title={t("discover.drier")} aria-label={t("discover.drier")}>☀️</span>
            </div>
          </div>
        </div>

        <div className="filter-block">
          <span className="filter-label">{t("discover.regions")}</span>
          <div className="region-chips">
            <button
              type="button"
              className={`region-chip ${includeRegions.length === 0 ? "included" : ""}`}
              onClick={() => setIncludeRegions([])}
            >
              {includeRegions.length === 0 ? "✓ " : ""}{t("discover.allRegions")}
            </button>
            {REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                className={`region-chip ${includeRegions.includes(r) ? "included" : ""}`}
                onClick={() => toggleRegion(r)}
              >
                {includeRegions.includes(r) ? "✓ " : ""}{regionLabel(r)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-footer">
          <input
            type="text"
            placeholder={t("discover.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <label className="field checkbox inline">
            <input type="checkbox" checked={onlyWishlist} onChange={(e) => setOnlyWishlist(e.target.checked)} />
            <span>{t("discover.onlySaved", { count: wishlist.length })}</span>
          </label>
          <button type="button" className="button-secondary" onClick={reset}>{t("discover.resetFilters")}</button>
        </div>
      </div>

      <div className="results-summary">
        <strong>{results.length}</strong> {t("discover.resultsSummary")} ·{" "}
        <strong>{top}</strong> {t("discover.resultsTop", { month: monthName(month) })}
        <span className="view-toggle">
          <button className={`toggle-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>{t("discover.viewList")}</button>
          <button className={`toggle-btn ${viewMode === "map" ? "active" : ""}`} onClick={() => setViewMode("map")}>{t("discover.viewMap")}</button>
        </span>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <p>{t("discover.emptyState")}</p>
          <button className="button-secondary" onClick={reset}>{t("discover.resetFilters")}</button>
        </div>
      ) : viewMode === "map" ? (
        <WorldMap
          results={results}
          onOpen={(id) => onOpenDestination(id, criteria)}
          onCreateTrip={(id) => onCreateTripFromDestination(id, criteria)}
        />
      ) : (
        <div className="dest-grid">
          {results.map((r) => (
            <DestinationCard
              key={r.destination.id}
              result={r}
              origin={origin}
              isInWishlist={wishlist.includes(r.destination.id)}
              onOpen={(id) => onOpenDestination(id, criteria)}
              onToggleWishlist={onToggleWishlist}
              onCreateTrip={(id) => onCreateTripFromDestination(id, criteria)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
