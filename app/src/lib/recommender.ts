import type {
  ClimateRating,
  Destination,
  MonthClimate,
  RecommendationCriteria,
  RecommendationResult,
} from "../destinations/types";

/** Califica el clima de un destino en un mes dado para un perfil de temperatura preferido. */
export function rateClimate(
  m: MonthClimate,
  preferredTempC?: { min: number; max: number },
  avoidRain?: boolean,
): { rating: ClimateRating; reasons: string[]; warnings: string[] } {
  const reasons: string[] = [];
  const warnings: string[] = [];

  const avg = (m.highC + m.lowC) / 2;

  // Default: rango cómodo 18-28°C, evitar lluvia >150mm/mes
  const target = preferredTempC ?? { min: 18, max: 28 };
  const heavyRainThreshold = 200;
  const moderateRainThreshold = 100;

  let tempScore: ClimateRating = "ideal";
  if (avg < target.min - 8 || avg > target.max + 8) tempScore = "avoid";
  else if (avg < target.min - 4 || avg > target.max + 4) tempScore = "ok";
  else if (avg < target.min || avg > target.max) tempScore = "good";

  let rainScore: ClimateRating = "ideal";
  if (m.rainMm > heavyRainThreshold) rainScore = avoidRain ? "avoid" : "ok";
  else if (m.rainMm > moderateRainThreshold) rainScore = avoidRain ? "ok" : "good";

  if (avg >= target.min && avg <= target.max) {
    reasons.push(`Temperatura ideal (${Math.round(m.lowC)}–${Math.round(m.highC)}°C)`);
  } else if (avg < target.min - 4) {
    warnings.push(`Frío (${Math.round(m.lowC)}–${Math.round(m.highC)}°C)`);
  } else if (avg > target.max + 4) {
    warnings.push(`Caluroso (${Math.round(m.lowC)}–${Math.round(m.highC)}°C)`);
  }

  if (m.rainMm > heavyRainThreshold) warnings.push(`Mucha lluvia (${m.rainMm} mm)`);
  else if (m.rainMm < 30) reasons.push("Seco");

  if (m.seaTempC && m.seaTempC >= 24) reasons.push(`Mar a ${m.seaTempC}°C`);

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
    if (criteria.excludeRegions?.includes(d.region)) continue;
    if (criteria.maxCostTier) {
      const tierOrder = { budget: 0, mid: 1, expensive: 2 };
      if (tierOrder[d.costTier] > tierOrder[criteria.maxCostTier]) continue;
    }
    if (criteria.maxFlightHours !== undefined && d.flightHoursFromEze !== undefined) {
      if (d.flightHoursFromEze > criteria.maxFlightHours) continue;
    }
    if (criteria.search) {
      const q = criteria.search.toLowerCase();
      const hit = d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q);
      if (!hit) continue;
    }

    const climate = d.climate[monthIdx];
    const climateEval = rateClimate(climate, criteria.preferredTempC, criteria.avoidRain);

    // Score base: clima
    let score = RATING_TO_SCORE[climateEval.rating];

    const reasons: string[] = [...climateEval.reasons];
    const warnings: string[] = [...climateEval.warnings];

    // Mejor mes: bonus
    if (d.bestMonths.includes(criteria.month)) {
      score += 15;
      reasons.unshift("Uno de sus mejores meses");
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
        const labels = overlap.length;
        reasons.push(`Coincide ${labels} preferencia${labels > 1 ? "s" : ""}`);
      }
    }

    // Penalización de visa (informativa)
    if (d.visaForArgentines === "required") {
      warnings.push("Requiere visa para argentinos");
      score -= 5;
    } else if (d.visaForArgentines === "evisa") {
      warnings.push("Requiere e-visa");
    }

    // Penalización vuelo larguísimo si no se especificó max
    if (criteria.maxFlightHours === undefined && d.flightHoursFromEze && d.flightHoursFromEze > 20) {
      warnings.push(`Vuelo largo (${d.flightHoursFromEze}h)`);
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
