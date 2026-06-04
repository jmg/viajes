import { useMemo, useState } from "react";
import { listCountries } from "../destinations/countries";
import { useT } from "../i18n";
import { regionLabel } from "../i18n/labels";

type Props = {
  onOpenCountry: (country: string) => void;
};

export function CountriesIndex({ onOpenCountry }: Props) {
  const t = useT();
  const [q, setQ] = useState("");
  const all = useMemo(() => listCountries(), []);
  const countries = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;
    return all.filter((c) => c.country.toLowerCase().includes(s));
  }, [all, q]);

  return (
    <div className="countries-index">
      <div className="search-row">
        <input
          className="search-input"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("countries.searchPlaceholder")}
        />
        {q && <button className="icon-button" onClick={() => setQ("")} title={t("common.clear")}>✕</button>}
      </div>
      <p className="countries-count">{t("countries.count", { n: countries.length })}</p>
      <div className="countries-grid">
        {countries.map((c) => (
          <button key={c.country} className="country-card" onClick={() => onOpenCountry(c.country)}>
            <span className="country-card-flag">{c.flag}</span>
            <span className="country-card-name">{c.country}</span>
            <span className="country-card-meta">
              {c.regions.map(regionLabel).join(" · ")}
            </span>
            <span className="country-card-count">{t("country.destCount", { n: c.count })}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
