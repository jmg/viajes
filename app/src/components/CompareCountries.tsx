import { useMemo } from "react";
import { countryProfile } from "../destinations/countries";
import { COUNTRY_FACTS } from "../destinations/countryFacts";
import { useT } from "../i18n";
import { costLabel, regionLabel, visaLabel } from "../i18n/labels";
import { getLang } from "../i18n/core";
import { MONTHS_SHORT } from "../i18n/dates";

type Props = {
  countries: string[];
  onOpenCountry: (country: string) => void;
};

export function CompareCountries({ countries, onOpenCountry }: Props) {
  const t = useT();
  const lang = getLang();
  const profiles = useMemo(
    () => countries.map((c) => countryProfile(c)).filter((p): p is NonNullable<typeof p> => !!p),
    [countries],
  );
  const short = (ms: number[]) => (ms.length ? ms.map((m) => MONTHS_SHORT[lang][m - 1]).join(" · ") : "—");

  const rows: { label: string; render: (p: NonNullable<ReturnType<typeof countryProfile>>) => string }[] = [
    { label: t("compare.region"), render: (p) => p.regions.map(regionLabel).join(" · ") },
    { label: t("compare.destinations"), render: (p) => String(p.count) },
    { label: t("compare.highSeason"), render: (p) => short(p.bestMonths) },
    { label: t("compare.shoulder"), render: (p) => short(p.shoulderMonths) },
    { label: t("compare.temp"), render: (p) => `${p.tempRange.min}–${p.tempRange.max}°C` },
    { label: t("compare.cost"), render: (p) => costLabel(p.costTier) + (p.costPerDay ? ` (US$ ${p.costPerDay.min}–${p.costPerDay.max})` : "") },
    { label: t("compare.flight"), render: (p) => (p.flightHoursFromEze ? `${p.flightHoursFromEze.min}–${p.flightHoursFromEze.max}h` : "—") },
    { label: t("compare.visa"), render: (p) => (p.visa ? visaLabel(p.visa) : "—") },
    { label: t("compare.currency"), render: (p) => COUNTRY_FACTS[p.country]?.currency ?? "—" },
    { label: t("compare.language"), render: (p) => COUNTRY_FACTS[p.country]?.languages ?? "—" },
    { label: t("compare.plug"), render: (p) => (COUNTRY_FACTS[p.country] ? `🔌 ${COUNTRY_FACTS[p.country].plugTypes}` : "—") },
    { label: t("compare.drive"), render: (p) => {
      const f = COUNTRY_FACTS[p.country];
      return f ? (f.driveSide === "izq" ? t("country.driveLeft") : t("country.driveRight")) : "—";
    } },
  ];

  return (
    <div className="compare">
      <table className="compare-table">
        <thead>
          <tr>
            <th />
            {profiles.map((p) => (
              <th key={p.country}>
                <button className="compare-country" onClick={() => onOpenCountry(p.country)}>
                  <span className="compare-flag">{p.flag}</span>
                  <span>{p.country}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              {profiles.map((p) => <td key={p.country}>{r.render(p)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
