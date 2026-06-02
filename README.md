<div align="center">

# ✈️ Viajes

### Planeador y recomendador de destinos por clima — 100% en tu navegador, gratis

¿A dónde voy en marzo? Decile cuándo querés viajar y qué te gusta, y te recomendamos destinos
con el mejor clima. Elegís uno y el viaje se crea solo: después armás el itinerario, llevás los
gastos del grupo y exportás todo al calendario o a PDF. Sin cuentas, sin servidor, sin tracking.

[🌐 Probarlo ahora](https://jmg.github.io/viajes/) · [📦 Código](https://github.com/jmg/viajes)

![Viajes](app/public/og.svg)

</div>

---

## ¿Qué hace?

| | |
|---|---|
| 🌎 **Descubrir destinos** | Catálogo curado de **520 destinos** con clima mensual, filtros por playa/montaña/ciudad/etc., temperatura, lluvia (húmedo↔seco), presupuesto, tiempo de vuelo y visa para argentinos. Te dice si es **ideal / bueno / aceptable / evitar** en el mes elegido. Gráficos interactivos (Chart.js) y clima real día-a-día (promedio 5 años, Open-Meteo). |
| ✨ **Crear viaje en un click** | Elegís el destino en el buscador (o en el mapa) y el viaje **se arma solo**, con fechas según el mes elegido. Sin formularios. Después editás lo que quieras. |
| 📝 **Itinerario** | Armás el día por día a mano, con lugares y notas. |
| 💰 **Gastos del grupo** | Quién pagó qué, dividido entre N viajeros, balances automáticos y la sugerencia mínima de cómo saldar. Multi-moneda con conversor. |
| 🔎 **Mareas y luna** | Para destinos costeros, calcula fases lunares y ventanas de marea baja (ideal para piscinas naturales). |
| 🛒 **Reservar** | Deep links a Google Flights, Skyscanner, Booking y GetYourGuide pre-llenados con tus datos. |
| 📅 **Exportar** | A `.ics` para Google/Apple/Outlook Calendar, y a **PDF** vía el diálogo de impresión. |
| 🔗 **Compartir** | Link de solo lectura que codifica el viaje en la URL — sin servidor. El destinatario puede guardar una copia. |
| 📱 **PWA** | Instalable en mobile y desktop, funciona offline. |
| 🔒 **Privacy-first** | Todo vive en tu navegador (localStorage). Sin cuentas, sin servidor, sin tracking. |

## Pantallas

> *(agregar capturas aquí — `docs/screens/*.png`)*

## Quick start

```bash
git clone https://github.com/jmg/viajes
cd viajes/app
npm install
npm run dev
```

Abrir <http://localhost:5173>.

## Deploy

Es una SPA estática (Vite + React) sin backend. Deploya en cualquier hosting:

- **GitHub Pages** — workflow incluido en `.github/workflows/deploy.yml`. Setea `VITE_BASE` si vivís bajo un subpath.
- **Netlify / Vercel / Cloudflare Pages** — root dir `app`, build `npm run build`, output `dist`.

## Stack

- **Vite + React 18 + TypeScript**
- **Chart.js** (react-chartjs-2) para los gráficos de clima — carga lazy con el detalle de destino
- **Open-Meteo** (Forecast + ERA5) para el clima real día-a-día — gratis y sin keys
- **localStorage** como única persistencia
- **PWA**: manifest + service worker hand-rolled (navegaciones network-first)

## SEO / Marketing

El proyecto incluye los básicos para indexarse bien:

- ✅ `<title>` y `<meta description>` ricas
- ✅ Open Graph + Twitter Card
- ✅ JSON-LD (`WebApplication`)
- ✅ `sitemap.xml` + `robots.txt`
- ✅ Fallback `<noscript>` con copy SEO-friendly
- ✅ Imagen OG (`public/og.svg`)

**Tip:** para máxima compatibilidad con redes sociales (Twitter/X especialmente) conviene
convertir `public/og.svg` a PNG 1200×630 una sola vez (cualquier conversor online,
o `npx svg-to-png-cli`). El SVG ya funciona en Facebook, WhatsApp y LinkedIn.

## Licencia

MIT — usá, modificá y compartí libremente.
