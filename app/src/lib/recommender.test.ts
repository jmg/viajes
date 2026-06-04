import { describe, it, expect, beforeEach } from "vitest";
import { recommendDestinations, rateClimate } from "./recommender";
import { setModuleLang, t } from "../i18n/core";
import type { Destination, MonthClimate, RecommendationCriteria } from "../destinations/types";

beforeEach(() => setModuleLang("es"));

const climate = (c: MonthClimate): MonthClimate[] => Array(12).fill(c);

const mk = (over: Partial<Destination>): Destination => ({
  id: "id", name: "Name", country: "País", region: "Sudamérica", hemisphere: "south",
  flag: "🏳️", categories: ["city"], climate: climate({ highC: 24, lowC: 18, rainMm: 40 }),
  costTier: "mid", highlights: [], description: "", bestMonths: [1],
  flightHoursFromEze: 5, lat: -23, lng: -46, ...over,
});

const baseCriteria: RecommendationCriteria = { month: 1 };

describe("rateClimate", () => {
  it("temperatura cómoda y poca lluvia → ideal", () => {
    const r = rateClimate({ highC: 26, lowC: 20, rainMm: 10 });
    expect(r.rating).toBe("ideal");
  });
  it("calor extremo → avoid", () => {
    const r = rateClimate({ highC: 46, lowC: 36, rainMm: 10 });
    expect(r.rating).toBe("avoid");
  });
  it("mucha lluvia genera advertencia", () => {
    const r = rateClimate({ highC: 26, lowC: 20, rainMm: 250 });
    expect(r.warnings.length).toBeGreaterThan(0);
  });
});

describe("recommendDestinations - filtros", () => {
  it("filtra por costo máximo", () => {
    const dests = [mk({ id: "cheap", costTier: "budget" }), mk({ id: "lux", costTier: "expensive" })];
    const res = recommendDestinations(dests, { ...baseCriteria, maxCostTier: "budget" });
    expect(res.map((r) => r.destination.id)).toEqual(["cheap"]);
  });

  it("filtra por región", () => {
    const dests = [mk({ id: "sa", region: "Sudamérica" }), mk({ id: "eu", region: "Europa" })];
    const res = recommendDestinations(dests, { ...baseCriteria, includeRegions: ["Europa"] });
    expect(res.map((r) => r.destination.id)).toEqual(["eu"]);
  });

  it("filtra por búsqueda de texto (nombre/país)", () => {
    const dests = [mk({ id: "a", name: "Tokio" }), mk({ id: "b", name: "Lima" })];
    const res = recommendDestinations(dests, { ...baseCriteria, search: "tok" });
    expect(res.map((r) => r.destination.id)).toEqual(["a"]);
  });

  it("filtra por horas de vuelo recalculadas desde el origen", () => {
    // Origen en EZE; un destino cercano y otro lejano (Europa).
    const near = mk({ id: "near", lat: -23.43, lng: -46.47 });   // São Paulo ~1.5h
    const far = mk({ id: "far", lat: 40.47, lng: -3.56 });       // Madrid ~13h
    const res = recommendDestinations([near, far], {
      ...baseCriteria, maxFlightHours: 5, originLatLng: { lat: -34.82, lng: -58.54 },
    });
    expect(res.map((r) => r.destination.id)).toEqual(["near"]);
  });
});

describe("recommendDestinations - visa coherente con el origen", () => {
  const dest = [mk({ id: "v", visaForArgentines: "required" })];
  const visaWarn = () => t("rec.visaRequired");

  it("muestra la visa sin origen configurado", () => {
    const res = recommendDestinations(dest, baseCriteria);
    expect(res[0].warnings).toContain(visaWarn());
  });
  it("muestra la visa si el origen es Argentina", () => {
    const res = recommendDestinations(dest, { ...baseCriteria, originCountryCode: "AR" });
    expect(res[0].warnings).toContain(visaWarn());
  });
  it("oculta la visa si el origen es otro país", () => {
    const res = recommendDestinations(dest, { ...baseCriteria, originCountryCode: "BR" });
    expect(res[0].warnings).not.toContain(visaWarn());
  });
});
