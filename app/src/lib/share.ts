import type { Trip } from "../types";

// Codifica/decodifica un viaje en la URL (hash) para compartir de solo lectura,
// sin backend. Base64 URL-safe sobre UTF-8.

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64u: string): string {
  const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeTrip(trip: Trip): string {
  return toBase64Url(JSON.stringify(trip));
}

export function decodeTrip(encoded: string): Trip | null {
  try {
    const json = fromBase64Url(encoded);
    const trip = JSON.parse(json) as Trip;
    if (!trip.id || !trip.title || !trip.startDate || !trip.endDate) return null;
    return trip;
  } catch {
    return null;
  }
}

export function buildShareUrl(trip: Trip): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#share=${encodeTrip(trip)}`;
}

export function getSharedTripFromHash(): Trip | null {
  const hash = window.location.hash;
  const match = hash.match(/^#share=(.+)$/);
  if (!match) return null;
  return decodeTrip(match[1]);
}

export function clearShareHash(): void {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}
