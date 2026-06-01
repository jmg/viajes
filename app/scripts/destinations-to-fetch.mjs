// Plantilla de destinos a importar via Open-Meteo.
//
// Cada entrada provee los campos manuales del destino + lat/lng. El script
// `fetch-climate.mjs` los pasa a la Open-Meteo Archive API (ERA5, gratis, sin
// auth, todo el planeta), calcula normales mensuales 2014-2023, y emite la
// entrada lista para pegar en `src/destinations/data.ts`.
//
// Editá esta lista y corré: `node scripts/fetch-climate.mjs > /tmp/new.txt`
// Después abrís /tmp/new.txt y pegás las entradas antes del cierre del array.

export const TO_FETCH = [
  // Ejemplo — borrá cuando agregues los tuyos
  // {
  //   id: "varadero",
  //   name: "Varadero",
  //   country: "Cuba",
  //   region: "Norteamérica",
  //   hemisphere: "north",
  //   flag: "🇨🇺",
  //   lat: 23.13,
  //   lng: -81.27,
  //   categories: ["beach", "tropical"],
  //   costTier: "mid",
  //   costPerDayUsd: { min: 70, max: 160 },
  //   highlights: ["Playa de 20 km", "Cayo Blanco", "Snorkel y delfines", "Centro histórico"],
  //   description: "El balneario más famoso del Caribe cubano.",
  //   bestMonths: [12, 1, 2, 3, 4],
  //   flightHoursFromEze: 11,
  //   visaForArgentines: "evisa",
  //   suggestedDuration: { min: 5, max: 8 },
  // },
];
