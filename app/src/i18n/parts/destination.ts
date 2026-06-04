import type { Part } from "../dict";

// Etiquetas compartidas de enums del catálogo (categorías, costo, rating, visa)
// más los textos de tarjeta y detalle de destino.
export const destination: Part = {
  es: {
    dest: {
      cat: {
        beach: "Playa", mountain: "Montaña", city: "Ciudad", cultural: "Cultural",
        nature: "Naturaleza", snow: "Nieve / ski", desert: "Desierto", tropical: "Tropical",
        island: "Isla", lake: "Lagos", wine: "Vino", wildlife: "Fauna",
      },
      cost: { budget: "Económico", mid: "Medio", expensive: "Caro" },
      rating: { ideal: "🌟 Ideal", good: "✅ Bueno", ok: "⚠ Aceptable", avoid: "❌ Evitar" },
      ratingTip: {
        ideal: "Clima muy cómodo en este mes.",
        good: "Buen clima, con algún detalle menor.",
        ok: "Se puede, pero hay calor, frío o lluvia a tener en cuenta.",
        avoid: "Mes poco recomendable por temperatura o lluvia.",
      },
      visa: { none: "Sin visa", evisa: "E-visa", required: "Visa requerida" },
    },
  },
  pt: {
    dest: {
      cat: {
        beach: "Praia", mountain: "Montanha", city: "Cidade", cultural: "Cultural",
        nature: "Natureza", snow: "Neve / ski", desert: "Deserto", tropical: "Tropical",
        island: "Ilha", lake: "Lagos", wine: "Vinho", wildlife: "Fauna",
      },
      cost: { budget: "Econômico", mid: "Médio", expensive: "Caro" },
      rating: { ideal: "🌟 Ideal", good: "✅ Bom", ok: "⚠ Aceitável", avoid: "❌ Evitar" },
      ratingTip: {
        ideal: "Clima muito agradável neste mês.",
        good: "Bom clima, com algum detalhe menor.",
        ok: "Dá para ir, mas há calor, frio ou chuva a considerar.",
        avoid: "Mês pouco recomendável por temperatura ou chuva.",
      },
      visa: { none: "Sem visto", evisa: "E-visa", required: "Visto exigido" },
    },
  },
  en: {
    dest: {
      cat: {
        beach: "Beach", mountain: "Mountain", city: "City", cultural: "Cultural",
        nature: "Nature", snow: "Snow / ski", desert: "Desert", tropical: "Tropical",
        island: "Island", lake: "Lakes", wine: "Wine", wildlife: "Wildlife",
      },
      cost: { budget: "Budget", mid: "Mid", expensive: "Pricey" },
      rating: { ideal: "🌟 Ideal", good: "✅ Good", ok: "⚠ Acceptable", avoid: "❌ Avoid" },
      ratingTip: {
        ideal: "Very comfortable weather this month.",
        good: "Good weather, with a minor caveat.",
        ok: "Doable, but mind the heat, cold or rain.",
        avoid: "Not a great month for temperature or rain.",
      },
      visa: { none: "No visa", evisa: "E-visa", required: "Visa required" },
    },
  },
};
