// Matcher compartido nombre-de-destino → entrada del catálogo. Lo usan el
// selector de destinos del formulario y la sección de clima, para que un destino
// elegido del catálogo siempre encuentre sus coordenadas (y por ende, pronóstico).
import { DESTINATIONS } from "./data";
import type { Destination, DestinationCategory } from "./types";

export function findDestination(name: string): Destination | undefined {
  const lower = name.toLowerCase().trim();
  if (!lower) return undefined;
  return DESTINATIONS.find((d) => {
    const dn = d.name.toLowerCase();
    return dn === lower || d.id === lower || d.id === lower.replace(/\s+/g, "-") || dn.includes(lower) || lower.includes(dn);
  });
}

const COASTAL_CATS = new Set<DestinationCategory>(["beach", "island", "tropical", "lake"]);

/** ¿Alguno de estos destinos es de playa/isla/tropical/lago? (para autodetectar viaje costero) */
export function anyCoastal(names: string[]): boolean {
  return names.some((n) => findDestination(n)?.categories.some((c) => COASTAL_CATS.has(c)) ?? false);
}
