# Viajes — app web

Planeador de viajes con vuelos, itinerario, fases lunares/mareas, presupuesto y checklist.

## Correr en local

```bash
cd app
npm install
npm run dev
```

Abrir http://localhost:5173

## Agregar un viaje nuevo

1. Crear `src/trips/<id-del-viaje>.ts` exportando un `Trip`.
2. Agregarlo a la lista en `src/trips/index.ts`.

Todos los campos del tipo `Trip` (excepto `id`, `title`, fechas, `origin`, `destinations`, `travelers`, `status`) son opcionales — la app se autoconfigura mostrando solo las pestañas con datos.

## Estructura

```
src/
├── types.ts                      # Modelo de un viaje
├── trips/
│   ├── index.ts                  # Registro de viajes
│   └── brasil-noviembre-2026.ts  # Primer viaje cargado
├── components/                   # Tabla de vuelos, itinerario, mareas, etc.
├── lib/format.ts                 # Helpers de fecha y luna
├── App.tsx
├── main.tsx
└── styles.css
```

## Comandos

```bash
npm run dev        # dev server
npm run build      # bundle producción
npm run preview    # servir el build
npm run typecheck  # tsc sin emit
```
