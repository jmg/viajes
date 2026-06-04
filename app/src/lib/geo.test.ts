import { describe, it, expect } from "vitest";
import { distanceKm, flightHoursForDistance, nearestAirport } from "./geo";

describe("distanceKm", () => {
  it("es 0 entre el mismo punto", () => {
    expect(distanceKm(-34.6, -58.4, -34.6, -58.4)).toBe(0);
  });

  it("90° sobre el ecuador ≈ un cuarto de circunferencia (~10007 km)", () => {
    const d = distanceKm(0, 0, 0, 90);
    expect(d).toBeGreaterThan(10000);
    expect(d).toBeLessThan(10015);
  });

  it("es simétrica", () => {
    const a = distanceKm(-34.82, -58.54, 40.47, -3.56);
    const b = distanceKm(40.47, -3.56, -34.82, -58.54);
    expect(a).toBeCloseTo(b, 6);
  });

  it("Buenos Aires → Madrid ≈ 10.000 km", () => {
    const d = distanceKm(-34.82, -58.54, 40.47, -3.56);
    expect(d).toBeGreaterThan(9800);
    expect(d).toBeLessThan(10300);
  });
});

describe("flightHoursForDistance", () => {
  it("nunca baja de 1h", () => {
    expect(flightHoursForDistance(0)).toBe(1);
    expect(flightHoursForDistance(100)).toBe(1);
  });

  it("redondea a la media hora", () => {
    expect(flightHoursForDistance(800)).toBe(1.5); // 1 + 0.5
    expect(flightHoursForDistance(8000)).toBe(10.5); // 10 + 0.5
  });
});

describe("nearestAirport", () => {
  it("elige EZE cerca de Buenos Aires", () => {
    expect(nearestAirport(-34.6, -58.45).countryCode).toBe("AR");
  });

  it("elige un aeropuerto español cerca de Madrid", () => {
    expect(nearestAirport(40.4, -3.7).countryCode).toBe("ES");
  });
});
