# Changelog

Todo el historial de cambios visibles de la app. Formato basado en
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Added
- 🎚 **Slider de lluvia** (💧 más húmedo ↔ ☀️ más seco) en Descubrir, en reemplazo del checkbox "Evitar lluvia": ahora se gradúa cuánta lluvia tolerás y el recomendador puntúa los meses en consecuencia. Se recuerda en localStorage.
- 🌎 **+140 destinos (→ 500)**: Europa (Córdoba, Bilbao, Ibiza, Canarias, Ronda, Sintra, Algarve, Marsella, Chamonix, Annecy, Turín, Verona, Amalfi, Cerdeña, Puglia, Matera, Dresde, Neuschwanstein, Ginebra, Highlands, Rodas…), Asia (Nikko, Takayama, Fuji, Yakushima, Huangshan, Jiuzhaigou, Pingyao, Gyeongju, Krabi, Phi Phi, Ayutthaya, Ninh Binh, Da Nang, Dalat, Inle, Malaca, Flores, Toba, Nusa Penida, Bohol, Banaue, Ella, Jaisalmer, Rishikesh, Ladakh, Hampi…), Medio Oriente (Riad, Yeda, Kuwait, Baréin, Salalah, Mar Muerto, Isfahán, Shiraz), África (Rabat, Tánger, Agadir, Asuán, Dahab, Amboseli, Diani, Johannesburgo, Garden Route, Drakensberg, Sossusvlei, Chobe, Adís Abeba, Nosy Be), Oceanía (Brisbane, Adelaida, Kakadu, Cradle Mountain, Margaret River, Kangaroo Island, Ningaloo, Christchurch, Bay of Islands, Abel Tasman, Monte Cook, Wanaka, Palaos, Moorea), Norteamérica (Savannah, Santa Fe, Big Sur, Arches, Monument Valley, Smokies, Jackson Hole, Big Island, Tahoe, Aspen, Jasper, Victoria, Churchill, Guanajuato, Puerto Vallarta, Chichén Itzá, Bacalar, Isla Mujeres), Centroamérica/Caribe (Atitlán, Monteverde, Manuel Antonio, Ometepe, Varadero, Viñales, Granada, Martinica, Bonaire, Dominica) y Sudamérica (São Paulo, Ilha Grande, Morro de SP, Maragogi, Natal, Fortaleza, Gramado, Huacachina, Máncora, Huaraz, Titicaca, Baños, Guatapé, Tayrona, San Andrés, Colonia).
- 🌎 **(Tandas previas, +80 → 360)**: Primera tanda (310): Tíbet, Zhangjiajie, Kanazawa, Okinawa, Busan, Bagan, Komodo, Lombok, Raja Ampat, Ha Long, Almaty, Bakú, Ereván, Jerusalén, Amán, Abu Dabi, Nairobi, Kilimanjaro, Essaouira, Sahara (Merzouga), Reunión, Tenerife, Malta, Creta, Lago de Como, Dolomitas, Uluru, Gold Coast, Gran Cañón y Kauai. Segunda tanda (360): Capadocia, Moscú, San Petersburgo, Milán, Valencia, Zermatt, Lucerna, Innsbruck, Burdeos, Provenza, Mónaco, Lofoten, Split, Meteora, Corfú, Nara, Hakone, Jeju, Harbin, Coron, Boracay, Siargao, Bromo, Sigiriya, Pokhara, Udaipur, Jodhpur, Amritsar, Bujará, Luxor, Sharm el-Sheikh, Okavango, Ngorongoro, Bwindi, Whitsundays, Great Ocean Road, Byron Bay, Rotorua, Milford Sound, Nueva Caledonia, Sedona, Napa Valley, Key West, Whistler, Tikal, San Blas, Barbados, Valparaíso, Puerto Madryn y el Eje Cafetero.
- 🌴 Región **Caribe** agregada al filtro de "Excluir regiones" en Descubrir.
- 🎚 Los filtros de **Descubrir** (sliders de temperatura, categorías, presupuesto, vuelo, regiones) se recuerdan entre sesiones en `localStorage`.
- Íconos 🥶 / 🥵 en los extremos del slider de temperatura para que sea más intuitivo.

### Changed
- 📊 **Gráficos rediseñados**: el climograma ahora usa curvas suaves, gradientes, grilla con eje °C y barras de lluvia con punta redondeada; el sparkline de temperatura marca el mes más cálido y el más frío; las tarjetas de pronóstico muestran una mini-barra de lluvia.
- La pestaña **Descubrir destinos** pasa a ser la vista por defecto (antes era *Mis viajes*).

## [1.0.0] — 2026-06-01

Primer release público. La app pasa de un planeador del viaje a Brasil 2026 a un
**planeador + recomendador de viajes** generalista, local-first, gratis y open source.

### Highlights
- 🌎 **Recomendador de destinos por clima** con 280 destinos curados (12 meses de clima por destino).
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
