# Viajes — app web

Planeador y recomendador de viajes: descubrí destinos por clima, planeá día por día
(con IA opcional), llevá presupuesto y gastos compartidos, y sincronizá entre dispositivos.

## Correr en local

```bash
cd app
npm install
npm run dev
```

Abrir http://localhost:5173

## Funcionalidades

- **Mis viajes**: CRUD completo, estados automáticos, countdown, checklist, presupuesto multi-moneda, links, mareas/luna.
- **Descubrir destinos**: recomendador por clima del mes + preferencias (70 destinos curados).
- **Itinerario con IA** (opcional): genera el día a día con tu API key de Anthropic.
- **Importar reserva** (opcional): pegás un mail de confirmación y la IA extrae los datos.
- **Gastos con split**: balances y settlement entre viajeros.
- **Reservar**: deep links a Google Flights / Skyscanner / Booking / GetYourGuide (con afiliado opcional).
- **Compartir por link**: link de solo lectura (sin servidor).
- **PWA**: instalable y offline.

Los datos se guardan localmente (localStorage). Para mover viajes entre dispositivos
usá Export/Import (JSON) o el link de compartir.

## Configuración (todo opcional, en ⚙ Configuración)

### IA — itinerarios e import de reservas
Pegá tu **API key de Anthropic** (console.anthropic.com). Se guarda solo en tu navegador
y se usa directo contra la API de Anthropic. Elegí modelo (Opus/Sonnet/Haiku).

### Afiliados (revenue, opcional)
Cargá tu `aid` de Booking.com y/o tu associate ID de Skyscanner; los deep links de la
pestaña **Reservar** los incluyen.

## Agregar un viaje "de fábrica" (seed)

1. Crear `src/trips/<id>.ts` exportando un `Trip`.
2. Agregarlo a `src/trips/index.ts`.

## Estructura

```
src/
├── types.ts                 # Modelo de Trip / Expense / etc.
├── trips/                   # Viajes seed (ejemplos)
├── destinations/            # Catálogo + tipos del recomendador
├── lib/
│   ├── ai.ts                # Anthropic SDK: itinerario + parse de reservas
│   ├── booking.ts           # Deep links de reserva (afiliados)
│   ├── recommender.ts       # Scoring por clima
│   ├── share.ts             # Compartir por URL
│   └── ...
├── shims/                   # Stubs browser de node builtins (para el SDK)
├── components/
└── App.tsx
```

## Comandos

```bash
npm run dev        # dev server
npm run build      # bundle producción
npm run preview    # servir el build
npm run typecheck  # tsc sin emit
```
