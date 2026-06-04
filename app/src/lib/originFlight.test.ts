import { describe, it, expect } from "vitest";
import { flightHoursFromOrigin } from "./originFlight";
import { flightHoursForDistance, distanceKm } from "./geo";
import { findAirport } from "./airports";
import type { Destination } from "../destinations/types";

const baseDest = (over: Partial<Destination> = {}): Destination => ({
  id: "x", name: "X", country: "C", region: "R", hemisphere: "south", flag: "🏳️",
  categories: ["city"], climate: Array(12).fill({ highC: 20, lowC: 10, rainMm: 50 }),
  costTier: "mid", highlights: [], description: "", bestMonths: [1],
  flightHoursFromEze: 3, lat: -23.43, lng: -46.47, ...over,
});

describe("flightHoursFromOrigin", () => {
  const eze = findAirport("EZE")!;

  it("calcula desde el origen cuando hay coords", () => {
    const d = baseDest();
    const expected = flightHoursForDistance(distanceKm(eze.lat, eze.lng, d.lat!, d.lng!));
    expect(flightHoursFromOrigin(d, eze)).toBe(expected);
  });

  it("cae a flightHoursFromEze sin origen", () => {
    expect(flightHoursFromOrigin(baseDest(), null)).toBe(3);
  });

  it("cae a flightHoursFromEze si el destino no tiene coords", () => {
    expect(flightHoursFromOrigin(baseDest({ lat: undefined, lng: undefined }), eze)).toBe(3);
  });
});
