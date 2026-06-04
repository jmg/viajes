import type { Currency } from "../types";

// Tasas aproximadas vs USD. Editables.
// Para un planeador no necesitamos exactitud al centavo.
export const RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  ARS: 1000,
  BRL: 5.0,
  GBP: 0.79,
  MXN: 17,
  CLP: 950,
};

export const SYMBOL: Record<Currency, string> = {
  USD: "US$",
  EUR: "€",
  ARS: "AR$",
  BRL: "R$",
  GBP: "£",
  MXN: "MX$",
  CLP: "CL$",
};

export const CURRENCIES: Currency[] = ["USD", "EUR", "ARS", "BRL", "GBP", "MXN", "CLP"];

// Moneda por defecto según el país del aeropuerto de origen (ISO alpha-2).
// Solo cubre las monedas soportadas; el resto cae a USD.
const COUNTRY_CURRENCY: Record<string, Currency> = {
  AR: "ARS", BR: "BRL", GB: "GBP", MX: "MXN", CL: "CLP",
  ES: "EUR", FR: "EUR", IT: "EUR", DE: "EUR", NL: "EUR", PT: "EUR",
  US: "USD",
};

export function defaultCurrencyForCountry(countryCode?: string): Currency {
  return (countryCode && COUNTRY_CURRENCY[countryCode]) || "USD";
}

export function convertFromUsd(amountUsd: number, target: Currency): number {
  return amountUsd * RATES[target];
}

export function formatAmount(amountUsd: number, currency: Currency): string {
  const v = convertFromUsd(amountUsd, currency);
  const rounded = currency === "ARS" || currency === "CLP" ? Math.round(v / 100) * 100 : Math.round(v);
  return `${SYMBOL[currency]} ${rounded.toLocaleString()}`;
}
