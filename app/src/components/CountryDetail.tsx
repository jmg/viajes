import { useMemo } from "react";
import type { RecommendationResult } from "../destinations/types";
import { CATEGORY_EMOJI } from "../destinations/types";
import { countryProfile } from "../destinations/countries";
import { COUNTRY_FACTS } from "../destinations/countryFacts";
import { rateClimate } from "../lib/recommender";
import type { Airport } from "../lib/airports";
import { DestinationCard } from "./DestinationCard";
import { ClimateChart } from "./ClimateChart";
import { useT } from "../i18n";
import { catLabel, costLabel, regionLabel, visaLabel } from "../i18n/labels";
import { getLang } from "../i18n/core";
import { MONTHS_SHORT, MONTHS_FULL } from "../i18n/dates";

type Props = {
  country: string;
  origin?: Airport | null;
  wishlist: string[];
  onOpenDestination: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onCreateTrip: (id: string) => void;
};

export function CountryDetail({ country, origin, wishlist, onOpenDestination, onToggleWishlist, onCreateTrip }: Props) {
  const t = useT();
  const lang = getLang();
  const profile = useMemo(() => countryProfile(country), [country]);

  const results: RecommendationResult[] = useMemo(() => {
    if (!profile) return [];
    const m = (profile.bestMonths[0] ?? 1) - 1;
    return profile.destinations
      .map((d) => {
        const ev = rateClimate(d.climate[m]);
        return { destination: d, score: 0, climateRating: ev.rating, reasons: ev.reasons, warnings: ev.warnings };
      })
      .sort((a, b) => {
        const order = { ideal: 0, good: 1, ok: 2, avoid: 3 } as const;
        return order[a.climateRating] - order[b.climateRating] || a.destination.name.localeCompare(b.destination.name);
      });
  }, [profile]);

  // "Qué hacer": highlights únicos sampleados de los destinos del país.
  const highlights = useMemo(() => {
    if (!profile) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const d of profile.destinations) {
      for (const h of d.highlights ?? []) {
        const key = h.toLowerCase();
        if (!seen.has(key)) { seen.add(key); out.push(h); }
        if (out.length >= 10) return out;
      }
    }
    return out;
  }, [profile]);

  if (!profile) return <p className="empty">{t("country.notFound")}</p>;

  const facts = COUNTRY_FACTS[profile.country];
  const short = (m: number) => MONTHS_SHORT[lang][m - 1];
  const full = (m: number) => MONTHS_FULL[lang][m - 1];
  const bestMonths = profile.bestMonths.length ? profile.bestMonths.map(short).join(" · ") : "—";

  return (
    <div className="country-detail">
      <div className="country-header">
        <span className="dest-flag-big">{profile.flag}</span>
        <div>
          <h2>{profile.country}</h2>
          <p className="dest-country">
            {profile.regions.map(regionLabel).join(" · ")} · {t("country.destCount", { n: profile.count })}
          </p>
        </div>
      </div>

      <div className="country-cats">
        {profile.categories.map((c) => (
          <span key={c} className="cat-chip">{CATEGORY_EMOJI[c]} {catLabel(c)}</span>
        ))}
      </div>

      <div className="dest-stats country-stats">
        <div className="stat">
          <span className="stat-label">{t("country.highSeason")}</span>
          <span className="stat-value">{bestMonths}</span>
          {profile.shoulderMonths.length > 0 && (
            <span className="stat-sub">{t("country.shoulder")}: {profile.shoulderMonths.map(short).join(" · ")}</span>
          )}
        </div>
        <div className="stat">
          <span className="stat-label">{t("country.climate")}</span>
          <span className="stat-value">{profile.tempRange.min}–{profile.tempRange.max}°C</span>
          <span className="stat-sub">{t("country.warmest", { month: full(profile.warmestMonth) })}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t("country.rain")}</span>
          <span className="stat-value">💧 {full(profile.wettestMonth)}</span>
          <span className="stat-sub">{t("country.driest", { month: full(profile.driestMonth) })}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t("country.dailyCost")}</span>
          <span className="stat-value">{costLabel(profile.costTier)}</span>
          {profile.costPerDay && <span className="stat-sub">US$ {profile.costPerDay.min}–{profile.costPerDay.max}</span>}
        </div>
        {profile.flightHoursFromEze && (
          <div className="stat">
            <span className="stat-label">{t("country.flight")}</span>
            <span className="stat-value">{profile.flightHoursFromEze.min}–{profile.flightHoursFromEze.max}h</span>
            <span className="stat-sub">{t("country.fromEze")}</span>
          </div>
        )}
        {profile.visa && (!origin || origin.countryCode === "AR") && (
          <div className="stat">
            <span className="stat-label">{t("country.visa")}</span>
            <span className="stat-value">{visaLabel(profile.visa)}</span>
          </div>
        )}
      </div>

      {highlights.length > 0 && (
        <div className="country-highlights">
          <h3 className="country-section-title">{t("country.highlights")}</h3>
          <div className="country-cats">
            {highlights.map((h) => <span key={h} className="cat-chip">✦ {h}</span>)}
          </div>
        </div>
      )}

      <div className="country-climate">
        <h3 className="country-section-title">{t("country.climateChart")}</h3>
        <ClimateChart climate={profile.monthly} highlightMonth={profile.bestMonths[0]} />
      </div>

      {facts && (
        <div className="country-practical">
          <h3 className="country-section-title">{t("country.practical")}</h3>
          <div className="dest-stats">
            <div className="stat"><span className="stat-label">{t("country.currency")}</span><span className="stat-value sm">{facts.currency}</span></div>
            <div className="stat"><span className="stat-label">{t("country.language")}</span><span className="stat-value sm">{facts.languages}</span></div>
            <div className="stat"><span className="stat-label">{t("country.plug")}</span><span className="stat-value">🔌 {facts.plugTypes}</span></div>
            <div className="stat"><span className="stat-label">{t("country.drive")}</span><span className="stat-value sm">{facts.driveSide === "izq" ? t("country.driveLeft") : t("country.driveRight")}</span></div>
            <div className="stat"><span className="stat-label">{t("country.callingCode")}</span><span className="stat-value">{facts.callingCode}</span></div>
          </div>
        </div>
      )}

      <h3 className="country-dests-title">{t("country.destinationsIn", { country: profile.country })}</h3>
      <div className="dest-grid">
        {results.map((r) => (
          <DestinationCard
            key={r.destination.id}
            result={r}
            origin={origin}
            isInWishlist={wishlist.includes(r.destination.id)}
            onOpen={onOpenDestination}
            onToggleWishlist={onToggleWishlist}
            onCreateTrip={onCreateTrip}
          />
        ))}
      </div>
    </div>
  );
}
