import { useMemo, useState } from "react";
import { listCountries } from "../destinations/countries";
import { useT } from "../i18n";
import { regionLabel } from "../i18n/labels";
import { Modal } from "./Modal";
import { CompareCountries } from "./CompareCountries";

type Props = {
  onOpenCountry: (country: string) => void;
};

const MAX_COMPARE = 3;

export function CountriesIndex({ onOpenCountry }: Props) {
  const t = useT();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const all = useMemo(() => listCountries(), []);
  const countries = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;
    return all.filter((c) => c.country.toLowerCase().includes(s));
  }, [all, q]);

  const toggle = (country: string) => {
    setSelected((cur) =>
      cur.includes(country) ? cur.filter((c) => c !== country) : cur.length < MAX_COMPARE ? [...cur, country] : cur,
    );
  };

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
      <p className="countries-count">{t("countries.count", { n: countries.length })} · <span className="countries-hint">{t("countries.compareHint")}</span></p>

      <div className="countries-grid">
        {countries.map((c) => {
          const isSel = selected.includes(c.country);
          return (
            <div key={c.country} className={`country-card ${isSel ? "selected" : ""}`}>
              <button className="country-card-main" onClick={() => onOpenCountry(c.country)}>
                <span className="country-card-flag">{c.flag}</span>
                <span className="country-card-name">{c.country}</span>
                <span className="country-card-meta">{c.regions.map(regionLabel).join(" · ")}</span>
                <span className="country-card-count">{t("country.destCount", { n: c.count })}</span>
              </button>
              <label className="country-compare-check" title={t("countries.compareAdd")}>
                <input
                  type="checkbox"
                  checked={isSel}
                  disabled={!isSel && selected.length >= MAX_COMPARE}
                  onChange={() => toggle(c.country)}
                />
                <span>{t("countries.compare")}</span>
              </label>
            </div>
          );
        })}
      </div>

      {selected.length >= 2 && (
        <div className="compare-bar">
          <span>{t("countries.compareSelected", { n: selected.length })}</span>
          <div className="compare-bar-actions">
            <button className="button-secondary" onClick={() => setSelected([])}>{t("common.clear")}</button>
            <button className="button-primary" onClick={() => setComparing(true)}>{t("countries.compareNow")}</button>
          </div>
        </div>
      )}

      {comparing && (
        <Modal title={t("countries.compareTitle")} onClose={() => setComparing(false)} wide>
          <CompareCountries
            countries={selected}
            onOpenCountry={(c) => { setComparing(false); onOpenCountry(c); }}
          />
        </Modal>
      )}
    </div>
  );
}
