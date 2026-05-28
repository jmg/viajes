import { useMemo, useState } from "react";
import type { Currency, Expense } from "../../types";
import { CURRENCIES, formatAmount, SYMBOL } from "../../lib/currency";

type Props = {
  expenses: Expense[];
  travelerNames: string[];
  travelers: number;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onChange: (expenses: Expense[]) => void;
  onNamesChange: (names: string[]) => void;
};

const newId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
};

export function ExpensesEditor({ expenses, travelerNames, travelers, currency, onCurrencyChange, onChange, onNamesChange }: Props) {
  // Si no hay nombres cargados, generamos placeholders según cantidad de viajeros.
  const people = travelerNames.length ? travelerNames : Array.from({ length: travelers }, (_, i) => `Viajero ${i + 1}`);

  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(people[0] ?? "");
  const [split, setSplit] = useState<string[]>(people);
  const [editingNames, setEditingNames] = useState(false);
  const [namesDraft, setNamesDraft] = useState(people.join(", "));

  const balances = useMemo(() => computeBalances(expenses, people), [expenses, people]);
  const settlements = useMemo(() => settle(balances), [balances]);

  const total = expenses.reduce((s, e) => s + e.amountUsd, 0);

  const add = () => {
    const amt = parseFloat(amount);
    if (!label.trim() || isNaN(amt) || amt <= 0 || !paidBy || split.length === 0) return;
    onChange([
      ...expenses,
      {
        id: newId(),
        date: new Date().toISOString().slice(0, 10),
        label: label.trim(),
        amountUsd: amt,
        paidBy,
        splitBetween: split,
      },
    ]);
    setLabel("");
    setAmount("");
  };

  const remove = (id: string) => onChange(expenses.filter((e) => e.id !== id));

  const toggleSplit = (name: string) =>
    setSplit((curr) => curr.includes(name) ? curr.filter((n) => n !== name) : [...curr, name]);

  const saveNames = () => {
    const names = namesDraft.split(",").map((n) => n.trim()).filter(Boolean);
    onNamesChange(names);
    setSplit(names);
    if (!names.includes(paidBy)) setPaidBy(names[0] ?? "");
    setEditingNames(false);
  };

  return (
    <div className="expenses-editor">
      <div className="budget-currency">
        <label>
          Moneda
          <select value={currency} onChange={(e) => onCurrencyChange(e.target.value as Currency)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c} ({SYMBOL[c]})</option>)}
          </select>
        </label>
        <button className="button-secondary" onClick={() => { setNamesDraft(people.join(", ")); setEditingNames((v) => !v); }}>
          {editingNames ? "Cerrar" : "👥 Nombres"}
        </button>
      </div>

      {editingNames && (
        <div className="names-editor">
          <label className="field">
            <span>Nombres de los viajeros <small>(separados por coma)</small></span>
            <input type="text" value={namesDraft} onChange={(e) => setNamesDraft(e.target.value)} placeholder="Ana, Beto, Caro" />
          </label>
          <button className="button-primary" onClick={saveNames}>Guardar nombres</button>
        </div>
      )}

      <div className="expense-add">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Gasto (ej: cena)" />
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Monto USD" />
        <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          {people.map((p) => <option key={p} value={p}>Pagó: {p}</option>)}
        </select>
        <button className="button-primary" onClick={add}>Agregar</button>
      </div>

      <div className="split-picker">
        <span className="filter-label">Dividir entre:</span>
        {people.map((p) => (
          <button
            key={p}
            type="button"
            className={`cat-chip-btn ${split.includes(p) ? "active" : ""}`}
            onClick={() => toggleSplit(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {expenses.length > 0 ? (
        <>
          <table className="budget-table">
            <thead>
              <tr><th>Gasto</th><th>Pagó</th><th>Entre</th><th className="num">Monto</th><th /></tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>{e.label}</td>
                  <td>{e.paidBy}</td>
                  <td className="split-cell">{e.splitBetween.length === people.length ? "Todos" : e.splitBetween.join(", ")}</td>
                  <td className="num">{formatAmount(e.amountUsd, currency)}</td>
                  <td><button className="icon-button small" onClick={() => remove(e.id)} aria-label="Eliminar">✕</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={3}><strong>Total</strong></td><td className="num"><strong>{formatAmount(total, currency)}</strong></td><td /></tr>
            </tfoot>
          </table>

          <div className="balances">
            <h4>Balances</h4>
            <ul>
              {people.map((p) => {
                const b = balances[p] ?? 0;
                return (
                  <li key={p} className={b >= 0 ? "positive" : "negative"}>
                    {p}: {b >= 0 ? "le deben " : "debe "} {formatAmount(Math.abs(b), currency)}
                  </li>
                );
              })}
            </ul>
          </div>

          {settlements.length > 0 && (
            <div className="settlements">
              <h4>Cómo saldar</h4>
              <ul>
                {settlements.map((s, i) => (
                  <li key={i}>{s.from} → {s.to}: <strong>{formatAmount(s.amount, currency)}</strong></li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className="settings-hint">Agregá gastos para ver el balance y cómo saldar cuentas entre el grupo.</p>
      )}
    </div>
  );
}

function computeBalances(expenses: Expense[], people: string[]): Record<string, number> {
  const bal: Record<string, number> = {};
  for (const p of people) bal[p] = 0;
  for (const e of expenses) {
    const share = e.amountUsd / e.splitBetween.length;
    if (bal[e.paidBy] !== undefined) bal[e.paidBy] += e.amountUsd;
    for (const person of e.splitBetween) {
      if (bal[person] !== undefined) bal[person] -= share;
    }
  }
  return bal;
}

type Settlement = { from: string; to: string; amount: number };

function settle(balances: Record<string, number>): Settlement[] {
  const debtors = Object.entries(balances).filter(([, v]) => v < -0.01).map(([k, v]) => ({ name: k, amt: -v }));
  const creditors = Object.entries(balances).filter(([, v]) => v > 0.01).map(([k, v]) => ({ name: k, amt: v }));
  const out: Settlement[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt);
    out.push({ from: debtors[i].name, to: creditors[j].name, amount: pay });
    debtors[i].amt -= pay;
    creditors[j].amt -= pay;
    if (debtors[i].amt < 0.01) i++;
    if (creditors[j].amt < 0.01) j++;
  }
  return out;
}
