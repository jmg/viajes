import type { ChecklistItem, Trip } from "../types";

export type TemplateId = "blank" | "beach" | "city" | "road" | "ski" | "hiking";

export type Template = {
  id: TemplateId;
  label: string;
  emoji: string;
  coastal?: boolean;
  checklist: ChecklistItem[];
};

export const TEMPLATES: Template[] = [
  {
    id: "blank",
    label: "En blanco",
    emoji: "📋",
    checklist: [],
  },
  {
    id: "beach",
    label: "Playa",
    emoji: "🏖",
    coastal: true,
    checklist: [
      { label: "Pasaporte / DNI", category: "Documentos" },
      { label: "Protector solar", category: "Equipo" },
      { label: "Traje de baño", category: "Equipo" },
      { label: "Toalla rápida", category: "Equipo" },
      { label: "Zapatillas de agua", category: "Equipo" },
      { label: "Anteojos de sol", category: "Equipo" },
      { label: "Snorkel / antiparras (opcional)", category: "Equipo" },
      { label: "Repelente", category: "Equipo" },
      { label: "Adaptador de enchufe", category: "Equipo" },
      { label: "Plata local en efectivo", category: "Plata" },
    ],
  },
  {
    id: "city",
    label: "City break",
    emoji: "🏛",
    checklist: [
      { label: "Pasaporte / DNI", category: "Documentos" },
      { label: "Tarjetas de crédito sin recargo internacional", category: "Plata" },
      { label: "Plata local en efectivo", category: "Plata" },
      { label: "Zapatillas cómodas para caminar", category: "Equipo" },
      { label: "Mochila day pack", category: "Equipo" },
      { label: "Adaptador de enchufe", category: "Equipo" },
      { label: "Cargador portátil", category: "Equipo" },
      { label: "App de transporte público del destino", category: "Equipo" },
      { label: "Tarjeta SIM o eSIM", category: "Equipo" },
    ],
  },
  {
    id: "road",
    label: "Carretera",
    emoji: "🚗",
    checklist: [
      { label: "Registro de conducir + internacional", category: "Documentos" },
      { label: "Reserva del auto", category: "Documentos" },
      { label: "Seguro del auto", category: "Documentos" },
      { label: "Cargador de celular para el auto", category: "Equipo" },
      { label: "Soporte para celular", category: "Equipo" },
      { label: "Mapas descargados offline", category: "Equipo" },
      { label: "Cooler para comida", category: "Equipo" },
      { label: "Almohada de viaje", category: "Equipo" },
      { label: "Playlist larga", category: "Equipo" },
    ],
  },
  {
    id: "ski",
    label: "Nieve / ski",
    emoji: "⛷",
    checklist: [
      { label: "Pasaporte / DNI", category: "Documentos" },
      { label: "Seguro médico con cobertura ski", category: "Documentos" },
      { label: "Ropa térmica (varias capas)", category: "Equipo" },
      { label: "Guantes / mitones", category: "Equipo" },
      { label: "Antiparras", category: "Equipo" },
      { label: "Cuello buff", category: "Equipo" },
      { label: "Pantalón de nieve", category: "Equipo" },
      { label: "Botas (si no las alquilás)", category: "Equipo" },
      { label: "Protector solar y labial", category: "Equipo" },
    ],
  },
  {
    id: "hiking",
    label: "Trekking",
    emoji: "🥾",
    checklist: [
      { label: "Botas de trekking ya usadas (no estrenar)", category: "Equipo" },
      { label: "Mochila de día + cubre lluvia", category: "Equipo" },
      { label: "Campera impermeable", category: "Equipo" },
      { label: "Botella o camelback", category: "Equipo" },
      { label: "Barras energéticas / frutos secos", category: "Equipo" },
      { label: "Linterna frontal", category: "Equipo" },
      { label: "Botiquín mínimo", category: "Equipo" },
      { label: "Mapa offline / GPS", category: "Equipo" },
      { label: "Bastones (opcional)", category: "Equipo" },
    ],
  },
];

export function applyTemplate(template: Template): Partial<Trip> {
  return {
    coastal: template.coastal,
    checklist: [...template.checklist],
  };
}
