# Launch kit — Viajes

URL canónica: **https://jmg.com.ar/viajes/**
Repo: **https://github.com/jmg/viajes**
Hashtags ES: `#Viajes #Argentina #IA #ProductoLocal`
Hashtags EN: `#TravelTech #AI #IndieDev #PWA #BuildInPublic`

---

## 🎯 Posicionamiento (la idea en 1 frase)

> Un planeador de viajes con IA que vive en tu navegador: descubrí destinos según el clima
> de la fecha y armá el itinerario sin cuentas, sin servidor, gratis.

**Diferenciadores honestos:**
1. **Descubrimiento por clima del mes** + preferencias (playa, montaña, ciudad…) — pocas apps lo hacen bien y casi ninguna en español.
2. **BYOK (Bring Your Own Key)** — la IA usa tu propia API key de Anthropic, así no hay suscripción ni paywall.
3. **Privacy-first** — todo en `localStorage`, sin login, sin tracking.
4. **PWA** instalable, funciona offline una vez cargada.

**Honestidad / debilidades a mencionar antes que te las marquen:**
- No hay sync entre dispositivos (por elección: cero servidor).
- BYOK suma fricción para no-técnicos (mitigación: borrador sin IA).
- Solo 220 destinos curados (crecerá).

---

## 📝 Descripciones reutilizables

### Tagline (≤ 60 chars)
- ES: **Planeá tu viaje con IA. En tu navegador. Gratis.**
- EN: **AI travel planner that lives in your browser. Free.**

### Corta — ~50 palabras
**ES.** Viajes es un planeador y recomendador de viajes que funciona 100% en tu navegador.
Decile cuándo querés viajar y qué te gusta; te recomienda destinos con el mejor clima.
Armás el itinerario con IA, llevás los gastos del grupo y exportás todo a tu calendario o a PDF.
Gratis, sin cuentas, sin tracking.

**EN.** Viajes is a travel planner and destination recommender that lives entirely in your
browser. Tell it when you want to travel and what you like; it suggests destinations with the
best weather for that month. Generate the itinerary with AI, track group expenses, export to
calendar or PDF. Free, no signup, no tracking.

### Media — ~150 palabras
**ES.** ¿A dónde voy en marzo? Esa es la pregunta que la mayoría de apps de viajes no responde
bien. Viajes sí: elegís el mes, tus preferencias (playa, montaña, ciudad, naturaleza…), tu
presupuesto y tiempo de vuelo, y te muestra destinos con badge **Ideal / Bueno / Aceptable /
Evitar** según el clima real de esa fecha.

Después armás el viaje: itinerario día por día generado con IA (BYOK Anthropic) o un borrador
rápido sin IA; importás reservas pegando un mail y dejás que la IA extraiga los datos; llevás
gastos compartidos con balances automáticos; exportás todo a `.ics` para Google/Apple Calendar
o a PDF; compartís el viaje por un link.

Todo vive en tu navegador (localStorage). Sin cuentas, sin servidor, sin tracking, gratis.
PWA instalable que funciona offline.

**EN.** "Where should I go in March?" Most travel apps don't answer that well. Viajes does:
pick a month and your preferences (beach, mountain, city, nature…), budget tier and max flight
time, and see destinations badged **Ideal / Good / OK / Avoid** based on actual climate for
that month.

Then plan: AI-generated day-by-day itinerary (BYO Anthropic key) or a quick no-AI draft;
paste a reservation email and the AI extracts the data; track group expenses with auto
balances; export to `.ics` for Google/Apple Calendar or to PDF; share via link. Everything
lives in your browser (localStorage). No signup, no server, no tracking, free. Installable
PWA, works offline.

---

## 🚀 Por plataforma — copy lista para pegar

### Product Hunt
**Name:** Viajes
**Tagline:** AI travel planner that lives in your browser. BYOK, free, no signup.
**Description:**
> Pick a month + preferences, get destinations rated by climate. Generate the itinerary with
> Claude using your own key. Track group expenses, export to calendar or PDF, share by link.
> Everything in localStorage — no server, no signup, no tracking.

**First comment (del maker):**
> Hi PH! 👋 I built Viajes because every travel app asks me "where do you want to go?" — but
> sometimes I want the opposite: "I have these 12 days in March, where SHOULD I go?".
>
> So I made a planner that starts from the date and your preferences, scores 220 curated
> destinations by climate match, and lets you build the trip from there with AI (using your
> own Anthropic key — no subscription).
>
> Stack: React + Vite + TS. Everything is local-first (localStorage). The Anthropic SDK loads
> lazily only when you generate. PWA installable, works offline.
>
> Roadmap: more destinations, a map view, weather forecasts via Open-Meteo.
> Honest gaps: no cross-device sync (by design), BYOK adds friction for non-techies.
>
> Code: github.com/jmg/viajes — MIT. Feedback welcome 🙏

### Twitter / X — thread (7 tweets)

**1/** 🚀 Lancé **Viajes** — un planeador de viajes que arranca por la pregunta correcta:
**"¿a dónde voy en marzo?"**.

Elegís el mes + lo que te gusta (playa, montaña, ciudad…) y te dice qué destinos tienen el
mejor clima para esa fecha.

👉 https://jmg.com.ar/viajes/

**2/** El problema que resuelve: la mayoría de apps de viajes asumen que ya sabés a dónde vas.
Viajes hace lo contrario: arranca de la **fecha + preferencias** y rankea destinos con badge
**Ideal / Bueno / Aceptable / Evitar** según el clima real del mes.

**3/** Una vez elegido, armás el itinerario con **IA** (BYOK Anthropic — usás tu propia key,
sin suscripción) o con un **borrador rápido sin IA** que reparte los destinos por las fechas.

**4/** Bonus para viajes en grupo: **gastos con split**. Cargás quién pagó qué, dividido entre
N viajeros, y te dice los balances + cómo saldar con la menor cantidad de transferencias.

**5/** Exportás todo a tu **calendario** (`.ics` → Google/Apple/Outlook) o a **PDF**
imprimible. Compartís el viaje por un **link** (que codifica el viaje entero en la URL — sin
servidor).

**6/** Lo más importante: **100% local**. Todo vive en tu navegador. Sin cuentas, sin
tracking, sin servidor. Las API keys nunca salen del cliente. **PWA** instalable que funciona
offline.

**7/** Es gratis y open source (MIT). Está hecha para el viajero hispano que vuela desde
LATAM — incluye horas de vuelo desde EZE e info de visa para argentinos en cada destino.

Repo: https://github.com/jmg/viajes
Feedback bienvenido 🙏

### Reddit — r/argentina

**Título:** Hice una app gratis para planear viajes que arranca por "a dónde voy" en vez de "qué reservo"

**Cuerpo:**
> Hola, soy [tu nombre]. Hace un tiempo que vengo trabajando en una app web open source
> llamada **Viajes**. La idea principal: en lugar de empezar por "ya sé que voy a Bali, qué
> reservo", arranca por "tengo estos días en julio, ¿a dónde me conviene ir?".
>
> **Qué hace:**
> - Recomendador de destinos según el clima del mes que elijas + filtros (playa, montaña,
>   ciudad, presupuesto, máx horas de vuelo desde EZE, visa para argentinos).
> - Itinerario día por día con IA (usás tu propia API key de Anthropic, así no hay
>   suscripción) o un borrador rápido sin IA.
> - Importás reservas pegando un mail (la IA extrae los datos).
> - Gastos compartidos con balances automáticos.
> - Exportá a Google Calendar o PDF. Compartí por link.
>
> **Por qué privacy-first:** todo vive en tu navegador. Sin cuentas, sin tracking, sin
> servidor. Es PWA, podés instalarla en el celu.
>
> Probarla: https://jmg.com.ar/viajes/
> Código: https://github.com/jmg/viajes (MIT)
>
> Feedback bienvenido, especialmente qué destinos agregar (ahora hay 220 curados).

### Reddit — r/travel / r/solotravel (en)

**Title:** I built a free travel planner that starts from the date, not from the destination

**Body:** *(traducción de la versión ES con tweaks)*
> Most travel apps assume you already know where you're going. I built one that starts from
> the opposite question: "I have these 12 days in March — where should I go?"
>
> [features bullets...]
>
> Free, open source, runs entirely in the browser, no signup. https://jmg.com.ar/viajes/
> Code: https://github.com/jmg/viajes

### Hacker News — Show HN

**Title:** Show HN: Viajes – A climate-first travel planner that runs entirely in the browser

**First comment:**
> Hi HN. This is a static SPA (Vite + React + TS) that starts trip planning from the
> date+preferences instead of the destination. 40 curated destinations have monthly climate
> normals; the recommender scores them and badges Ideal/Good/OK/Avoid for the chosen month,
> plus category match (beach, mountain, etc.), cost tier, max flight time, and visa for
> Argentine travelers.
>
> AI features are BYO Anthropic key — the SDK is dynamically imported and the key is stored
> in localStorage. The whole app is local-first; trips live in localStorage; sharing encodes
> the whole trip in a URL hash (no backend).
>
> A few things I'm somewhat proud of:
> - Lazy-loading both the AI SDK and Supabase (later removed) cut initial JS from ~177KB to
>   ~24KB gzip.
> - Calendar export is hand-rolled RFC 5545 .ics (verified CRLF, exclusive DTEND, field
>   escaping).
> - Moon phase + tide windows are computed client-side from the synodic period for any
>   coastal trip's date range — no API call.
>
> Honest gaps: no cloud sync (by choice), only 220 destinations, BYOK is friction for
> non-techies (there's a no-AI draft generator as fallback).
>
> Source: github.com/jmg/viajes (MIT). Roadmap: more destinations, a map view, Open-Meteo
> forecast for trips within 16 days.

### IndieHackers

**Title:** I shipped a free, local-first travel planner (BYOK AI, no signup)

**Body:**
> After getting frustrated with travel apps that assume you already know the destination, I
> built Viajes — a static SPA that starts from "when can you travel?" and recommends
> destinations based on actual climate for that month.
>
> **Stack:** Vite + React + TS, ~76KB gzip initial JS (heavy SDKs lazy-loaded), localStorage
> persistence, deployed to GitHub Pages.
>
> **Monetization (or lack thereof):** None for now — it's MIT and free. The AI features use
> BYO Anthropic key, so I don't pay for inference. There's a Booking.com / Skyscanner
> affiliate link section where users can plug in their own affiliate IDs.
>
> **What's working:** climate-based discovery is genuinely novel and gets people hooked. The
> no-AI draft fallback removes the BYOK friction for casual users.
>
> **What I'd love feedback on:** how to grow without a paid plan, and whether there's a path
> to add cloud sync without breaking the no-server ethos (maybe E2E-encrypted blob storage?).
>
> Link: https://jmg.com.ar/viajes/
> Code: https://github.com/jmg/viajes

### LinkedIn (post corto)

> 🚀 Lancé Viajes — un planeador de viajes que arranca por la pregunta correcta:
> "¿a dónde voy en marzo?".
>
> En lugar de asumir que ya sabés a dónde vas, te recomienda destinos según el **clima del
> mes** y tus preferencias. Después armás el itinerario con IA (BYOK), llevás los gastos del
> grupo, y exportás todo a calendario o PDF. **Sin cuentas, sin servidor, sin tracking.**
>
> Stack: React + Vite + TypeScript. 100% open source (MIT).
>
> 👉 https://jmg.com.ar/viajes/
> 📦 https://github.com/jmg/viajes
>
> Feedback bienvenido, especialmente de viajeros hispanos 🙏

---

## ❓ FAQ / objeciones probables

**"¿Por qué tengo que poner mi propia API key?"**
> Para que no haya suscripción ni paywall. Las keys de Anthropic son baratas
> (un itinerario cuesta unos centavos) y vos controlás el gasto. Si no querés
> usar IA, hay un borrador automático que arma el esqueleto del itinerario gratis.

**"¿Mis viajes se sincronizan entre celu y compu?"**
> No (todavía). Por elección de diseño: sin servidor = sin riesgo de leak de datos.
> Para mover viajes, usá el botón Compartir (link) o Export/Import (JSON).

**"¿Solo 220 destinos? ¿Es en serio?"**
> Sí, son destinos **curados con clima mensual real** — no scrape de Wikipedia. Estoy
> sumando más; sugerencias bienvenidas en GitHub.

**"¿De dónde sacan los datos de clima?"**
> Normales mensuales conocidas (medias históricas) hardcoded en el código. Para pronóstico
> real estoy evaluando integrar Open-Meteo (gratis, sin key).

**"¿Cuánto cuesta?"**
> Gratis. La app es open source MIT. Si querés generar itinerarios con IA, pagás directo a
> Anthropic (centavos por viaje).

---

## 📍 Dónde compartir (orden recomendado)

1. **Twitter / X** — primer ping a tu red. Usá el thread de arriba.
2. **LinkedIn** — versión más profesional, mismo mensaje.
3. **Reddit /r/argentina** — buena tracción en LATAM si el copy está en español.
4. **Reddit /r/travel** + /r/solotravel — mercado anglo grande.
5. **HackerNews Show HN** — público técnico; mejor lanzar martes-jueves 8-10 AM PT.
6. **IndieHackers** — community de makers, especialmente útil para feedback sobre el modelo.
7. **ProductHunt** — programá el lanzamiento para un martes/miércoles 00:01 PT.
8. **Foros de viajes argentinos** — Forosur, Mochileros, grupos de Facebook.
9. **Comunidades de español** — devs.com.ar / Slack de Frontend Argentina.

---

## 📸 Antes de lanzar

- [ ] Convertir `public/og.svg` → `og.png` (1200×630) para Twitter/X
- [ ] Tomar 3-4 capturas: home con onboarding, Descubrir con filtros, detalle de viaje con itinerario IA, modo viaje con día "HOY"
- [ ] Verificar el preview en [opengraph.xyz](https://opengraph.xyz)
- [ ] Submit del `sitemap.xml` a [Google Search Console](https://search.google.com/search-console)
- [ ] Agregar `meta name="google-site-verification"` cuando GSC te lo pida
- [ ] (Opcional) Configurar Plausible o PostHog endpoint en Settings → Analytics, para medir tráfico real
