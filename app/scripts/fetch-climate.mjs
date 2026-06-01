// Fetch climate normals (10 años de ERA5) desde Open-Meteo y emite entradas
// listas para pegar en src/destinations/data.ts.
//
// Uso:
//   node scripts/fetch-climate.mjs > /tmp/new-destinations.txt
//
// Open-Meteo Archive API es gratis, sin key, soporta cualquier lat/lng:
//   https://archive-api.open-meteo.com/v1/era5
//
// Devuelve datos diarios; el script promedia por mes para producir el
// formato c(highC, lowC, rainMm) que usa el modelo Destination.

import { TO_FETCH } from "./destinations-to-fetch.mjs";

const START = "2014-01-01";
const END = "2023-12-31";

async function fetchClimate(lat, lng) {
  const url =
    `https://archive-api.open-meteo.com/v1/era5` +
    `?latitude=${lat}&longitude=${lng}` +
    `&start_date=${START}&end_date=${END}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${lat},${lng}`);
  return res.json();
}

function mean(arr) {
  const v = arr.filter((x) => x != null);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0;
}

function monthlyNormals(data) {
  const { daily } = data;
  const time = daily.time;
  const tmax = daily.temperature_2m_max;
  const tmin = daily.temperature_2m_min;
  const rain = daily.precipitation_sum;

  // Para cada mes (1-12): juntar todas las daily highs/lows, y sumar lluvia por año-mes.
  const months = Array.from({ length: 12 }, () => ({ hi: [], lo: [], rainByYear: {} }));
  for (let i = 0; i < time.length; i++) {
    const m = parseInt(time[i].slice(5, 7), 10) - 1;
    const y = time[i].slice(0, 4);
    if (tmax[i] != null) months[m].hi.push(tmax[i]);
    if (tmin[i] != null) months[m].lo.push(tmin[i]);
    if (rain[i] != null) months[m].rainByYear[y] = (months[m].rainByYear[y] ?? 0) + rain[i];
  }
  return months.map((m) => ({
    highC: Math.round(mean(m.hi)),
    lowC: Math.round(mean(m.lo)),
    rainMm: Math.round(mean(Object.values(m.rainByYear))),
  }));
}

function emitEntry(d, climate) {
  const climateStr = climate.map((m) => `c(${m.highC},${m.lowC},${m.rainMm})`).join(", ");
  return `  {
    id: ${JSON.stringify(d.id)},
    name: ${JSON.stringify(d.name)},
    country: ${JSON.stringify(d.country)},
    region: ${JSON.stringify(d.region)},
    hemisphere: ${JSON.stringify(d.hemisphere)},
    flag: ${JSON.stringify(d.flag)},
    lat: ${d.lat}, lng: ${d.lng},
    categories: ${JSON.stringify(d.categories)},
    climate: [${climateStr}],
    costTier: ${JSON.stringify(d.costTier)},
    costPerDayUsd: { min: ${d.costPerDayUsd.min}, max: ${d.costPerDayUsd.max} },
    highlights: ${JSON.stringify(d.highlights)},
    description: ${JSON.stringify(d.description)},
    bestMonths: ${JSON.stringify(d.bestMonths)},
    flightHoursFromEze: ${d.flightHoursFromEze},
    visaForArgentines: ${JSON.stringify(d.visaForArgentines)},
    suggestedDuration: { min: ${d.suggestedDuration.min}, max: ${d.suggestedDuration.max} },
  },`;
}

async function main() {
  if (!TO_FETCH.length) {
    console.error("destinations-to-fetch.mjs está vacío. Agregá entradas y volvé a correr.");
    process.exit(1);
  }

  const out = [];
  for (const d of TO_FETCH) {
    process.stderr.write(`Fetching ${d.name} (${d.lat},${d.lng})... `);
    try {
      const data = await fetchClimate(d.lat, d.lng);
      const climate = monthlyNormals(data);
      out.push(emitEntry(d, climate));
      process.stderr.write("ok\n");
      // Open-Meteo permite ~10k requests/día gratis, igual le doy un respiro.
      await new Promise((r) => setTimeout(r, 250));
    } catch (e) {
      process.stderr.write(`error: ${e.message}\n`);
    }
  }

  console.log("\n  // ============== Auto-generados (Open-Meteo ERA5) ==============");
  console.log(out.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
