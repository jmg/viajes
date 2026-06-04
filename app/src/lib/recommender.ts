import type {
  ClimateRating,
  Destination,
  MonthClimate,
  RecommendationCriteria,
  RecommendationResult,
} from "../destinations/types";
import { distanceKm, flightHoursForDistance } from "./geo";
import { t } from "../i18n/core";

/** Horas de vuelo a un destino: desde el origen elegido si hay coords, si no la referencia EZE. */
function flightHours(d: Destination, criteria: RecommendationCriteria): number | undefined {
  if (criteria.originLatLng && d.lat != null && d.lng != null) {
    return flightHoursForDistance(distanceKm(criteria.originLatLng.lat, criteria.originLatLng.lng, d.lat, d.lng));
  }
  return d.flightHoursFromEze;
}

/** Califica el clima de un destino en un mes dado para un perfil de temperatura preferido. */
export function rateClimate(
  m: MonthClimate,
  preferredTempC?: { min: number; max: number },
  maxRainMm?: number,
): { rating: ClimateRating; reasons: string[]; warnings: string[] } {
  const reasons: string[] = [];
  const warnings: string[] = [];

  const avg = (m.highC + m.lowC) / 2;

  // Default: rango cómodo 18-28°C. Sin preferencia de lluvia → tolerancia amplia (250 mm/mes).
  const target = preferredTempC ?? { min: 18, max: 28 };
  const rainTol = maxRainMm ?? 250;

  let tempScore: ClimateRating = "ideal";
  if (avg < target.min - 8 || avg > target.max + 8) tempScore = "avoid";
  else if (avg < target.min - 4 || avg > target.max + 4) tempScore = "ok";
  else if (avg < target.min || avg > target.max) tempScore = "good";

  // Cuanto más a "seco" lleve el slider, menor rainTol y más penaliza la lluvia.
  const rainRatio = m.rainMm / rainTol;
  let rainScore: ClimateRating = "ideal";
  if (rainRatio > 1.75) rainScore = "avoid";
  else if (rainRatio > 1.0) rainScore = "ok";
  else if (rainRatio > 0.55) rainScore = "good";

  const lo = Math.round(m.lowC);
  const hi = Math.round(m.highC);
  if (avg >= target.min && avg <= target.max) {
    reasons.push(t("rec.tempIdeal", { lo, hi }));
  } else if (avg < target.min - 4) {
    warnings.push(t("rec.cold", { lo, hi }));
  } else if (avg > target.max + 4) {
    warnings.push(t("rec.hot", { lo, hi }));
  }

  if (m.rainMm > 200) warnings.push(t("rec.heavyRain", { mm: m.rainMm }));
  else if (m.rainMm < 30) reasons.push(t("rec.dry"));
  if (maxRainMm !== undefined && m.rainMm > maxRainMm && m.rainMm <= 200) {
    warnings.push(t("rec.moreRain", { mm: m.rainMm }));
  }

  if (m.seaTempC && m.seaTempC >= 24) reasons.push(t("rec.seaTemp", { c: m.seaTempC }));

  // worst score wins
  const order: ClimateRating[] = ["ideal", "good", "ok", "avoid"];
  const worstIdx = Math.max(order.indexOf(tempScore), order.indexOf(rainScore));
  return { rating: order[worstIdx], reasons, warnings };
}

const RATING_TO_SCORE: Record<ClimateRating, number> = {
  ideal: 100,
  good: 75,
  ok: 45,
  avoid: 10,
};

export function recommendDestinations(
  destinations: Destination[],
  criteria: RecommendationCriteria,
): RecommendationResult[] {
  const monthIdx = criteria.month - 1;
  const results: RecommendationResult[] = [];

  for (const d of destinations) {
    if (criteria.includeRegions?.length && !criteria.includeRegions.includes(d.region)) continue;
    if (criteria.maxCostTier) {
      const tierOrder = { budget: 0, mid: 1, expensive: 2 };
      if (tierOrder[d.costTier] > tierOrder[criteria.maxCostTier]) continue;
    }
    const fh = flightHours(d, criteria);
    if (criteria.maxFlightHours !== undefined && fh !== undefined) {
      if (fh > criteria.maxFlightHours) continue;
    }
    if (criteria.search) {
      const q = criteria.search.toLowerCase();
      const hit = d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q);
      if (!hit) continue;
    }

    const climate = d.climate[monthIdx];
    const climateEval = rateClimate(climate, criteria.preferredTempC, criteria.maxRainMm);

    // Score base: clima
    let score = RATING_TO_SCORE[climateEval.rating];

    const reasons: string[] = [...climateEval.reasons];
    const warnings: string[] = [...climateEval.warnings];

    // Mejor mes: bonus
    if (d.bestMonths.includes(criteria.month)) {
      score += 15;
      reasons.unshift(t("rec.bestMonth"));
    } else {
      // Verificar cercanía al mejor mes (igual hemisferio = penalización moderada)
      const minDistance = Math.min(
        ...d.bestMonths.map((bm) => {
          const d1 = Math.abs(bm - criteria.month);
          return Math.min(d1, 12 - d1);
        }),
      );
      if (minDistance >= 4) score -= 10;
    }

    // Match de categorías
    if (criteria.categories?.length) {
      const overlap = criteria.categories.filter((c) => d.categories.includes(c));
      if (overlap.length === 0) {
        score -= 30;
      } else {
        score += overlap.length * 10;
        const n = overlap.length;
        reasons.push(t(n > 1 ? "rec.matchPrefsPlural" : "rec.matchPrefs", { n }));
      }
    }

    // Penalización de visa (informativa)
    if (d.visaForArgentines === "required") {
      warnings.push(t("rec.visaRequired"));
      score -= 5;
    } else if (d.visaForArgentines === "evisa") {
      warnings.push(t("rec.evisa"));
    }

    // Penalización vuelo larguísimo si no se especificó max
    if (criteria.maxFlightHours === undefined && fh && fh > 20) {
      warnings.push(t("rec.longFlight", { h: fh }));
      score -= 3;
    }

    score = Math.max(0, Math.min(100, score));

    results.push({
      destination: d,
      score,
      climateRating: climateEval.rating,
      reasons,
      warnings,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
