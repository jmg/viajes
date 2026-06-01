# Scripts

## `fetch-climate.mjs` — agregar destinos en bulk con Open-Meteo

Para llegar a 500 destinos sin entrar manualmente 6.000 valores climáticos, este
script trae las **normales mensuales reales** desde la Open-Meteo Archive API
(ERA5, gratis, sin auth) y emite las entradas ya formateadas.

### Cómo se usa

1. Editá `scripts/destinations-to-fetch.mjs` y agregá los destinos que querés
   importar. Necesitás escribir manualmente:
   - `id`, `name`, `country`, `region`, `hemisphere`, `flag`
   - `lat`, `lng` (de Google Maps / Wikipedia)
   - `categories`, `costTier`, `costPerDayUsd`
   - `highlights`, `description`
   - `bestMonths`, `flightHoursFromEze`, `visaForArgentines`, `suggestedDuration`

   El script solo genera la `climate: [...]` con las normales reales.

2. Corré:

   ```bash
   cd app
   node scripts/fetch-climate.mjs > /tmp/new-destinations.txt
   ```

3. Abrí `/tmp/new-destinations.txt`, copiá las entradas y pegalas en
   `src/destinations/data.ts` justo antes del `];` final.

4. `npm run build` para verificar que typecheck pasa.

### Datos

- Fuente: **ERA5 reanálisis** vía Open-Meteo (la mejor data climática gratis
  para cualquier lat/lng del planeta).
- Rango: 2014-2023 (10 años de datos diarios).
- Output: `highC` = media de máximas diarias del mes, `lowC` = media de mínimas
  diarias, `rainMm` = lluvia mensual promedio.

### Límites y notas

- Open-Meteo no requiere key y permite ~10.000 requests por día — más que
  suficiente para llegar a 500 destinos.
- El script hace un sleep de 250ms entre destinos para no saturar.
- La precisión es ~10km de la lat/lng dada — para una ciudad la coordenada del
  centro está bien.
- **`seaTempC`** no se genera; si querés agregarlo (destinos costeros), editá
  la entrada después manualmente. La API también lo tiene si te animás a
  extender el script (`marine` endpoint).

### Workflow sugerido para llegar a 500

1. Sesión 1: agregás 30-40 destinos a la plantilla → corrés el script →
   pegás resultados. Total queda en ~130.
2. Repetís 10-12 veces. Cada sesión es 10-15 minutos de copiar lat/lng +
   highlights y 1 minuto del script.
3. Total: ~5-6 horas de trabajo curado a 500 destinos.
