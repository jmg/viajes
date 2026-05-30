// Registro central de viajes. Para agregar uno nuevo:
//   1) crear `src/trips/<id>.ts` exportando un `Trip`
//   2) importarlo y agregarlo a `trips`
//
// El resto de la app se autoconfigura.

import type { Trip } from "../types";
import { brasilNoviembre2026 } from "./brasil-noviembre-2026";

export const trips: Trip[] = [brasilNoviembre2026];

export const getTrip = (id: string): Trip | undefined =>
  trips.find((t) => t.id === id);
