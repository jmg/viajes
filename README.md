<div align="center">

# ✈️ Viajes

### Planeador y recomendador de destinos con IA — 100% en tu navegador, gratis

¿A dónde voy en marzo? Decile cuándo querés viajar y qué te gusta, y te recomendamos destinos
con el mejor clima. Después armás el itinerario con IA, llevás los gastos del grupo, y exportás
todo al calendario o a PDF. Sin cuentas, sin servidor, sin tracking.

[🌐 Probarlo ahora](https://jmg.com.ar/viajes/) · [📦 Código](https://github.com/jmg/viajes)

![Viajes](app/public/og.svg)

</div>

---

## ¿Qué hace?

| | |
|---|---|
| 🌎 **Descubrir destinos** | Catálogo curado con clima mensual, filtros por playa/montaña/ciudad/etc., presupuesto, tiempo de vuelo y visa para argentinos. Te dice si es **ideal / bueno / aceptable / evitar** en el mes elegido. |
| ✨ **Itinerarios con IA** | Pegás tu propia API key de Anthropic (BYOK) y la IA arma el día por día con lugares concretos. Sin key, hay un **borrador rápido** que reparte los destinos por las fechas. |
| 📥 **Importar reservas** | Pegás un mail de confirmación de Booking/LATAM/Airbnb y la IA extrae proveedor, fechas, código y crea el viaje. |
| 💰 **Gastos del grupo** | Quién pagó qué, dividido entre N viajeros, balances automáticos y la sugerencia mínima de cómo saldar. Multi-moneda con conversor. |
| 🔎 **Mareas y luna** | Para destinos costeros, calcula fases lunares y ventanas de marea baja (ideal para piscinas naturales). |
| 🛒 **Reservar** | Deep links a Google Flights, Skyscanner, Booking y GetYourGuide pre-llenados con tus datos. |
| 📅 **Exportar** | A `.ics` para Google/Apple/Outlook Calendar, y a **PDF** vía el diálogo de impresión. |
| 🔗 **Compartir** | Link de solo lectura que codifica el viaje en la URL — sin servidor. El destinatario puede guardar una copia. |
| 📱 **PWA** | Instalable en mobile y desktop, funciona offline. |
| 🔒 **Privacy-first** | Todo vive en tu navegador (localStorage). Las API keys nunca salen del cliente. Analytics local opcional. |

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

## Configuración opcional (en ⚙ Configuración)

- **API key de Anthropic** — para itinerarios con IA y parse de reservas. Conseguila en [console.anthropic.com](https://console.anthropic.com/) → API Keys. Se guarda **solo en tu navegador**.
- **Afiliados** — si tenés IDs de afiliado de Booking.com o Skyscanner, los deep links los incluyen y generan comisiones.
- **Analytics endpoint** — opcional, si querés reenviar eventos de uso a un agregador (PostHog/Plausible/custom). Por defecto los eventos quedan locales.

## Deploy

Es una SPA estática (Vite + React) sin backend. Deploya en cualquier hosting:

- **GitHub Pages** — workflow incluido en `.github/workflows/deploy.yml`. Setea `VITE_BASE` si vivís bajo un subpath.
- **Netlify / Vercel / Cloudflare Pages** — root dir `app`, build `npm run build`, output `dist`.

## Stack

- **Vite + React 18 + TypeScript**
- **@anthropic-ai/sdk** para la IA (carga lazy, solo cuando se usa)
- **localStorage** como única persistencia
- **PWA**: manifest + service worker hand-rolled

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
