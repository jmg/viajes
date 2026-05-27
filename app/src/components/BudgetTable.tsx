import type { BudgetItem } from "../types";

type Props = { items: BudgetItem[] };

export function BudgetTable({ items }: Props) {
  const totalMin = items.reduce((s, i) => s + i.minUsd, 0);
  const totalMax = items.reduce((s, i) => s + i.maxUsd, 0);

  return (
    <table className="budget-table">
      <thead>
        <tr>
          <th>Item</th>
          <th className="num">Mín USD</th>
          <th className="num">Máx USD</th>
        </tr>
      </thead>
      <tbody>
        {items.map((i, idx) => (
          <tr key={idx}>
            <td>{i.label}</td>
            <td className="num">{i.minUsd.toLocaleString()}</td>
            <td className="num">{i.maxUsd.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td><strong>Total</strong></td>
          <td className="num"><strong>{totalMin.toLocaleString()}</strong></td>
          <td className="num"><strong>{totalMax.toLocaleString()}</strong></td>
        </tr>
      </tfoot>
    </table>
  );
}
