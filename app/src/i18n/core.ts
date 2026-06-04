// Núcleo de i18n sin dependencias de React, para que también lo puedan usar los
// módulos puros (lib/format, lib/recommender, etc.).
import { DICT } from "./dict";
import type { Lang } from "./dict";

export type { Lang };

const STORAGE_KEY = "viajes:lang";

function detectInitial(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "pt" || saved === "en") return saved;
  } catch { /* ignore */ }
  const nav = (typeof navigator !== "undefined" ? navigator.language : "es").slice(0, 2).toLowerCase();
  if (nav === "pt") return "pt";
  if (nav === "en") return "en";
  return "es";
}

let currentLang: Lang = detectInitial();

export const getLang = (): Lang => currentLang;

export function setModuleLang(l: Lang): void {
  currentLang = l;
}

export function persistLang(l: Lang): void {
  try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
}

function lookup(lang: Lang, key: string): string | undefined {
  let node: unknown = DICT[lang];
  for (const part of key.split(".")) {
    if (node == null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

/** Traduce una clave (ej: "tripForm.title"). Reemplaza {placeholders} con params. */
export function t(key: string, params?: Record<string, string | number>): string {
  let s = lookup(currentLang, key) ?? lookup("es", key) ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}
