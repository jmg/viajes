import type { Part } from "../dict";

export const currency: Part = {
  es: {
    currencyConv: {
      from: "De",
      to: "A",
      swap: "Invertir",
      rate: "Tasa: 1 {from} = {value} {to} · tasas aproximadas, editables en",
    },
  },
  pt: {
    currencyConv: {
      from: "De",
      to: "Para",
      swap: "Inverter",
      rate: "Taxa: 1 {from} = {value} {to} · taxas aproximadas, editáveis em",
    },
  },
  en: {
    currencyConv: {
      from: "From",
      to: "To",
      swap: "Swap",
      rate: "Rate: 1 {from} = {value} {to} · approximate rates, editable in",
    },
  },
};
