import { describe, it, expect } from "vitest";
import { convertFromUsd, formatAmount, defaultCurrencyForCountry, SYMBOL } from "./currency";

describe("convertFromUsd", () => {
  it("USD es identidad", () => {
    expect(convertFromUsd(100, "USD")).toBe(100);
  });
  it("aplica la tasa", () => {
    expect(convertFromUsd(100, "EUR")).toBeCloseTo(92, 5);
  });
});

describe("formatAmount", () => {
  it("antepone el símbolo de la moneda", () => {
    expect(formatAmount(1, "USD").startsWith(SYMBOL.USD)).toBe(true);
    expect(formatAmount(50, "BRL").startsWith(SYMBOL.BRL)).toBe(true);
  });
});

describe("defaultCurrencyForCountry", () => {
  it("mapea países conocidos", () => {
    expect(defaultCurrencyForCountry("AR")).toBe("ARS");
    expect(defaultCurrencyForCountry("BR")).toBe("BRL");
    expect(defaultCurrencyForCountry("FR")).toBe("EUR");
    expect(defaultCurrencyForCountry("MX")).toBe("MXN");
  });
  it("cae a USD para desconocidos o vacío", () => {
    expect(defaultCurrencyForCountry("JP")).toBe("USD");
    expect(defaultCurrencyForCountry(undefined)).toBe("USD");
  });
});
