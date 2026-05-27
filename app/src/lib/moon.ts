import type { MoonPhase, TideWindow } from "../types";

// Algoritmo simplificado basado en período sinódico (29.530588 días)
// y un new moon de referencia conocido: 2000-01-06 18:14 UTC.
const SYNODIC_DAYS = 29.530588853;
const REF_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

export function phaseFraction(iso: string): number {
  const t = new Date(iso + "T12:00:00Z").getTime();
  const days = (t - REF_NEW_MOON_MS) / 86_400_000;
  const f = ((days / SYNODIC_DAYS) % 1 + 1) % 1;
  return f; // 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter
}

const PHASE_NAMES: MoonPhase["phase"][] = ["new", "first-quarter", "full", "last-quarter"];

/** Find ISO dates within [start, end] where the moon is in a "major" phase (new/full/quarters). */
export function computeMoonPhases(startIso: string, endIso: string): MoonPhase[] {
  const start = new Date(startIso + "T00:00:00").getTime();
  const end = new Date(endIso + "T23:59:59").getTime();
  const out: MoonPhase[] = [];

  // Iterate ~half-month windows to find each phase center.
  // Walk one day at a time looking for the closest day to each target fraction.
  const targets = [0, 0.25, 0.5, 0.75];
  const dayMs = 86_400_000;

  // Track best candidate for each upcoming target across the range.
  // Easier: walk daily, when phase fraction crosses a target boundary, take the closest day.
  let prevDay: { iso: string; frac: number } | null = null;
  for (let t = start; t <= end; t += dayMs) {
    const iso = new Date(t).toISOString().slice(0, 10);
    const frac = phaseFraction(iso);
    if (prevDay) {
      for (const target of targets) {
        const crossed = isClosestToTarget(prevDay.frac, frac, target);
        if (crossed) {
          const useCurr = Math.abs(diff(frac, target)) <= Math.abs(diff(prevDay.frac, target));
          const winner = useCurr ? { iso, frac } : prevDay;
          const idx = targets.indexOf(target);
          out.push({
            date: winner.iso,
            phase: PHASE_NAMES[idx],
            tideQuality: idx === 0 || idx === 2 ? "low" : "medium",
            note: idx === 0 ? "Marés muy bajas" : idx === 2 ? "Marés muy bajas" : "Mareas moderadas",
          });
        }
      }
    }
    prevDay = { iso, frac };
  }
  return dedupe(out);
}

function diff(a: number, b: number): number {
  // signed shortest distance on circle [0,1)
  let d = a - b;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return d;
}

function isClosestToTarget(prev: number, curr: number, target: number): boolean {
  // detect a sign change in `diff` near target
  const dp = diff(prev, target);
  const dc = diff(curr, target);
  return dp <= 0 && dc > 0;
}

function dedupe(phases: MoonPhase[]): MoonPhase[] {
  const seen = new Set<string>();
  return phases.filter((p) => {
    const key = `${p.date}:${p.phase}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Build 5-day tide windows around new/full moon dates. */
export function computeTideWindows(phases: MoonPhase[]): TideWindow[] {
  const fmt = (d: Date) => `${d.getDate()} ${["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][d.getMonth()]}`;

  return phases
    .filter((p) => p.phase === "new" || p.phase === "full" || p.phase === "supermoon")
    .map((p) => {
      const center = new Date(p.date + "T00:00:00");
      const startD = new Date(center.getTime() - 2 * 86_400_000);
      const endD = new Date(center.getTime() + 3 * 86_400_000);
      return {
        label: p.phase === "supermoon" ? "Supermoon" : p.phase === "new" ? "Luna nueva" : "Luna llena",
        range: `${fmt(startD)} – ${fmt(endD)}`,
        quality: p.phase === "supermoon" ? "exceptional" as const : "very-good" as const,
        note: p.note,
      };
    });
}
