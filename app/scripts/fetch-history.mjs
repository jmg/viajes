// Baja el clima real de los últimos 5 años (ERA5, Open-Meteo) para cada destino
// y guarda una climatología diaria por MM-DD en public/climate/<id>.json.
//
// Es RESUMIBLE: saltea los que ya tienen archivo, así se puede correr "de a poco".
//   node scripts/fetch-history.mjs            (todos los que falten)
//   MAX=50 node scripts/fetch-history.mjs     (solo 50 por corrida)
//
// Open-Meteo Archive es gratis y sin key. Hacemos 1 request por destino (5 años)
// con una pausa entre requests para respetar el uso justo (~600/min).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FROM = "2021-01-01";
const TO = "2025-12-31";
const YEARS = 5;
const DELAY_MS = process.env.DELAY ? parseInt(process.env.DELAY, 10) : 1200;
const MAX = process.env.MAX ? parseInt(process.env.MAX, 10) : Infinity;

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = `${root}public/climate`;
mkdirSync(outDir, { recursive: true });

const data = readFileSync(`${root}src/destinations/data.ts`, "utf8");
// id seguido (sin cruzar otro id) por lat/lng del mismo objeto.
const re = /id:\s*"([^"]+)"(?:(?!\bid:)[\s\S])*?lat:\s*(-?[\d.]+),\s*lng:\s*(-?[\d.]+)/g;
const dests = [];
let m;
while ((m = re.exec(data))) dests.push({ id: m[1], lat: +m[2], lng: +m[3] });
console.log(`Destinos con coordenadas: ${dests.length}`);

const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const stdev = (a) => {
  if (a.length < 2) return 0;
  const mu = mean(a);
  return Math.sqrt(mean(a.map((x) => (x - mu) ** 2)));
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchDest(d) {
  const url =
    `https://archive-api.open-meteo.com/v1/era5?latitude=${d.lat}&longitude=${d.lng}` +
    `&start_date=${FROM}&end_date=${TO}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
  let res;
  for (let attempt = 0; attempt < 6; attempt++) {
    res = await fetch(url);
    if (res.ok) break;
    if (res.status === 429) {
      const ra = parseInt(res.headers.get("retry-after") || "", 10);
      const wait = Number.isFinite(ra) ? ra * 1000 : Math.min(60_000, 8_000 * (attempt + 1));
      console.log(`  …429, espero ${Math.round(wait / 1000)}s`);
      await sleep(wait);
      continue;
    }
    throw new Error(`HTTP ${res.status}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} (tras reintentos)`);
  const j = await res.json();
  const t = j.daily.time, tmax = j.daily.temperature_2m_max, tmin = j.daily.temperature_2m_min, rain = j.daily.precipitation_sum;

  const byMd = new Map();
  for (let i = 0; i < t.length; i++) {
    const md = t[i].slice(5);
    const arr = byMd.get(md) ?? { tmax: [], tmin: [], rain: [] };
    if (tmax[i] != null) arr.tmax.push(tmax[i]);
    if (tmin[i] != null) arr.tmin.push(tmin[i]);
    if (rain[i] != null) arr.rain.push(rain[i]);
    byMd.set(md, arr);
  }
  const days = {};
  for (const [md, a] of byMd) {
    if (!a.tmax.length) continue;
    const rainy = a.rain.filter((r) => r >= 1).length;
    days[md] = [
      Math.round(mean(a.tmax)),
      Math.round(mean(a.tmin)),
      Math.round(mean(a.rain)),
      Math.round(stdev(a.tmax)),
      Math.round(stdev(a.tmin)),
      Math.round((rainy / a.rain.length) * 100) / 100,
    ];
  }
  return { id: d.id, years: YEARS, from: FROM.slice(0, 4), to: TO.slice(0, 4), days };
}

let done = 0, skipped = 0, failed = 0, processed = 0;
for (const d of dests) {
  const file = `${outDir}/${d.id}.json`;
  if (existsSync(file)) { skipped++; continue; }
  if (processed >= MAX) break;
  processed++;
  try {
    const clim = await fetchDest(d);
    writeFileSync(file, JSON.stringify(clim));
    done++;
    console.log(`✓ ${d.id} (${Object.keys(clim.days).length} días)`);
  } catch (e) {
    failed++;
    console.log(`✗ ${d.id}: ${e.message}`);
  }
  await sleep(DELAY_MS);
}
console.log(`\nListo. nuevos=${done} ya-estaban=${skipped} fallaron=${failed}`);
