import type { FlightCriterion, FlightOption } from "../types";
import { formatDate } from "../lib/format";

type Props = {
  options: FlightOption[];
  criteria?: FlightCriterion[];
  recommendedId?: string | number;
};

const CRITERIA_SYMBOL: Record<string, string> = {
  yes: "✅",
  no: "❌",
  partial: "½",
  warning: "⚠",
};

export function FlightTable({ options, criteria, recommendedId }: Props) {
  const sorted = [...options].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <div className="flight-table-wrap">
      <table className="flight-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Ida</th>
            <th>Vuelta</th>
            <th>Días</th>
            {criteria?.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            <th>Score</th>
            <th>Comentario</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((o) => (
            <tr
              key={o.id}
              className={o.id === recommendedId ? "row-top" : ""}
            >
              <td>
                {o.rank === 1 && <span title="Top">🥇</span>}
                {o.rank === 2 && <span title="2do">🥈</span>}
                {o.rank === 3 && <span title="3ro">🥉</span>}
                {!o.rank && o.id}
              </td>
              <td>
                <div className="leg-date">{formatDate(o.outbound.date)}</div>
                <div className="leg-info">
                  {o.outbound.from} → {o.outbound.to} · {o.outbound.airline}
                </div>
                <div className="leg-time">
                  {o.outbound.depart} → {o.outbound.arrive}
                  {!o.outbound.direct && " (escala)"}
                </div>
              </td>
              <td>
                <div className="leg-date">{formatDate(o.inbound.date)}</div>
                <div className="leg-info">
                  {o.inbound.from} → {o.inbound.to} · {o.inbound.airline}
                </div>
                <div className="leg-time">
                  {o.inbound.depart} → {o.inbound.arrive}
                  {!o.inbound.direct && " (escala)"}
                </div>
              </td>
              <td className="num">{o.days}</td>
              {criteria?.map((c) => (
                <td key={c.key} className="center">
                  {CRITERIA_SYMBOL[o.criteria?.[c.key] ?? ""] ?? ""}
                </td>
              ))}
              <td className="num">
                <span className={`score score-${o.score ?? 0}`}>{o.score}/5</span>
              </td>
              <td className="comment">{o.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
