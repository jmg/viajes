import { useState } from "react";
import type { Currency } from "../types";
import { CURRENCIES, RATES, SYMBOL } from "../lib/currency";
import { useT } from "../i18n";

type Props = { defaultTarget?: Currency };

// Conversión directa por la tabla RATES (todo vs USD).
function convert(amount: number, from: Currency, to: Currency): number {
  if (!isFinite(amount)) return 0;
  return amount * (RATES[to] / RATES[from]);
}

function formatNumber(n: number, c: Currency): string {
  if (!isFinite(n)) return "";
  const decimals = c === "ARS" || c === "CLP" ? 0 : 2;
  return n.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export function CurrencyConverter({ defaultTarget = "USD" }: Props) {
  const t = useT();
  const [from, setFrom] = useState<Currency>("ARS");
  const [to, setTo] = useState<Currency>(defaultTarget);
  const [amount, setAmount] = useState("");

  const parsed = parseFloat(amount.replace(",", ".")) || 0;
  const result = convert(parsed, from, to);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="converter">
      <div className="converter-row">
        <div className="converter-field">
          <label>{t("currencyConv.from")}</label>
          <div className="converter-input">
            <select value={from} onChange={(e) => setFrom(e.target.value as Currency)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <button type="button" className="icon-button converter-swap" onClick={swap} title={t("currencyConv.swap")}>⇄</button>
        <div className="converter-field">
          <label>{t("currencyConv.to")}</label>
          <div className="converter-input">
            <select value={to} onChange={(e) => setTo(e.target.value as Currency)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <output>{SYMBOL[to]} {formatNumber(result, to)}</output>
          </div>
        </div>
      </div>
      <p className="converter-hint">
        {t("currencyConv.rate", {
          from,
          to,
          value: convert(1, from, to).toLocaleString(undefined, { maximumFractionDigits: 4 }),
        })}{" "}
        <code>src/lib/currency.ts</code>.
      </p>
    </div>
  );
}
