import { useState } from "react";
import type { BudgetItem, Currency } from "../../types";
import { CURRENCIES, formatAmount, SYMBOL } from "../../lib/currency";
import { useT } from "../../i18n";

type Props = {
  items: BudgetItem[];
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onChange: (items: BudgetItem[]) => void;
};

export function BudgetEditor({ items, currency, onCurrencyChange, onChange }: Props) {
  const t = useT();
  const [label, setLabel] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const add = () => {
    const l = label.trim();
    const mn = parseFloat(min);
    const mx = parseFloat(max);
    if (!l || isNaN(mn) || isNaN(mx)) return;
    onChange([...items, { label: l, minUsd: Math.min(mn, mx), maxUsd: Math.max(mn, mx) }]);
    setLabel("");
    setMin("");
    setMax("");
  };

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  const totalMin = items.reduce((s, i) => s + i.minUsd, 0);
  const totalMax = items.reduce((s, i) => s + i.maxUsd, 0);

  return (
    <div className="budget-editor">
      <div className="budget-currency">
        <label>
          {t("budget.showIn")}
          <select value={currency} onChange={(e) => onCurrencyChange(e.target.value as Currency)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c} ({SYMBOL[c]})</option>)}
          </select>
        </label>
        <small>{t("budget.storedNote")}</small>
      </div>

      <table className="budget-table">
        <thead>
          <tr>
            <th>{t("budget.item")}</th>
            <th className="num">{t("budget.min")}</th>
            <th className="num">{t("budget.max")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={idx}>
              <td>{i.label}</td>
              <td className="num">{formatAmount(i.minUsd, currency)}</td>
              <td className="num">{formatAmount(i.maxUsd, currency)}</td>
              <td>
                <button className="icon-button small" onClick={() => remove(idx)} aria-label={t("common.delete")}>✕</button>
              </td>
            </tr>
          ))}
        </tbody>
        {items.length > 0 && (
          <tfoot>
            <tr>
              <td><strong>{t("budget.total")}</strong></td>
              <td className="num"><strong>{formatAmount(totalMin, currency)}</strong></td>
              <td className="num"><strong>{formatAmount(totalMax, currency)}</strong></td>
              <td />
            </tr>
          </tfoot>
        )}
      </table>

      <div className="budget-add">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("budget.itemPlaceholder")} />
        <input type="number" value={min} onChange={(e) => setMin(e.target.value)} placeholder={t("budget.minPlaceholder")} />
        <input type="number" value={max} onChange={(e) => setMax(e.target.value)} placeholder={t("budget.maxPlaceholder")} />
        <button className="button-primary" onClick={add}>{t("common.add")}</button>
      </div>
    </div>
  );
}
