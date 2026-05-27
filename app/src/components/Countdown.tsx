import type { Trip } from "../types";
import { autoStatus, daysUntilEnd, daysUntilStart } from "../lib/status";

type Props = { trip: Trip };

export function Countdown({ trip }: Props) {
  const status = autoStatus(trip);
  if (status === "past") {
    const daysAgo = -daysUntilEnd(trip);
    return <span className="countdown past">Volviste hace {daysAgo} {daysAgo === 1 ? "día" : "días"}</span>;
  }
  if (status === "in-progress") {
    const left = daysUntilEnd(trip);
    return <span className="countdown live">🟢 En curso · {left} {left === 1 ? "día" : "días"} restantes</span>;
  }
  const d = daysUntilStart(trip);
  if (d === 0) return <span className="countdown soon">¡Sale hoy!</span>;
  if (d === 1) return <span className="countdown soon">Mañana</span>;
  if (d < 30) return <span className="countdown soon">Faltan {d} días</span>;
  return <span className="countdown upcoming">Faltan {d} días</span>;
}
