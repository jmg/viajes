# Changelog

Todo el historial de cambios visibles de la app. Formato basado en
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [1.0.0] — 2026-06-01

Primer release público. La app pasa de un planeador del viaje a Brasil 2026 a un
**planeador + recomendador de viajes** generalista, local-first, gratis y open source.

### Highlights
- 🌎 **Recomendador de destinos por clima** con 190 destinos curados (12 meses de clima por destino).
- ✨ **Itinerarios con IA** (BYO API key de Anthropic) — modelo configurable (Opus / Sonnet / Haiku).
- 📝 **Borrador rápido sin IA** que reparte los destinos por las fechas del viaje.
- 📥 **Importar reservas** desde un mail pegado: la IA extrae proveedor, fechas y código.
- 💰 **Gastos compartidos** con balances automáticos y settlement entre viajeros.
- 💱 **Conversor de moneda** integrado en la pestaña de gastos.
- 🛒 **Reservar** con deep links a Google Flights, Skyscanner, Booking y GetYourGuide.
- 📅 **Exportar a calendario** (`.ics` válido RFC 5545) y a **PDF** vía print-friendly.
- 🔗 **Compartir por link** (codifica el viaje en la URL hash — sin servidor).
- 🌕 **Fases lunares y mareas** auto-calculadas para viajes costeros.
- 📱 **PWA instalable** con service worker offline.

### Added
- CRUD completo de viajes con plantillas (playa / ciudad / carretera / ski / trekking / blanco).
- Estado de viaje auto-derivado (planeando / reservado / en curso / pasado) y countdown.
- Búsqueda por texto en "Mis viajes" (título, destinos, resumen).
- Resaltado del día "HOY" en el itinerario durante viajes en curso.
- Onboarding con quick-actions y status de configuración opcional.
- Analytics local con endpoint remoto opcional (privacy-first).
- Import/Export JSON para backup y migración entre dispositivos.

### Tech
- Vite + React 18 + TypeScript.
- Carga inicial de ~76 KB gzip; Anthropic SDK lazy-loaded.
- Hand-rolled service worker, manifest PWA, deploy a GitHub Pages vía Actions.
- SEO: Open Graph, Twitter Card, JSON-LD, sitemap, robots, OG image.

### Decisiones de producto explícitas
- **No hay cuentas ni sync cloud.** Todo vive en `localStorage`. Para migrar usás
  Export/Import o el link de Compartir.
- **BYOK para la IA** — las API keys nunca salen de tu navegador, no hay paywall.

### Roadmap conocido
- Más destinos (objetivo: 100+).
- Vista de mapa en Descubrir.
- Pronóstico real vía Open-Meteo para viajes en los próximos 16 días.
- Vista "modo viaje activo" mejorada (próxima actividad, gastos del día).
