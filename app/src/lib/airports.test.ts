import { describe, it, expect } from "vitest";
import { AIRPORTS, airportsByCountry, findAirport, flagEmoji } from "./airports";

describe("findAirport", () => {
  it("encuentra por código IATA", () => {
    expect(findAirport("EZE")?.city).toBe("Buenos Aires");
    expect(findAirport("MAD")?.country).toBe("España");
  });
  it("devuelve undefined si no existe", () => {
    expect(findAirport("ZZZ")).toBeUndefined();
  });
});

describe("airportsByCountry", () => {
  it("agrupa sin repetir países", () => {
    const groups = airportsByCountry();
    const countries = groups.map((g) => g.country);
    expect(new Set(countries).size).toBe(countries.length);
  });
  it("cubre todos los aeropuertos", () => {
    const total = airportsByCountry().reduce((n, g) => n + g.airports.length, 0);
    expect(total).toBe(AIRPORTS.length);
  });
});

describe("flagEmoji", () => {
  it("convierte código ISO a bandera", () => {
    expect(flagEmoji("AR")).toBe("🇦🇷");
    expect(flagEmoji("BR")).toBe("🇧🇷");
  });
  it("devuelve bandera neutra para entradas inválidas", () => {
    expect(flagEmoji("XYZ")).toBe("🏳️");
  });
});
