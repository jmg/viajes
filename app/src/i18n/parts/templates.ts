import type { Part } from "../dict";

// Etiquetas visibles de los estilos de viaje (TEMPLATES). El catálogo guarda
// labels en español; acá traducimos solo lo que se muestra al usuario.
export const templates: Part = {
  es: {
    tpl: {
      blank: "En blanco",
      beach: "Playa",
      city: "City break",
      road: "Carretera",
      ski: "Nieve / ski",
      hiking: "Trekking",
    },
  },
  pt: {
    tpl: {
      blank: "Em branco",
      beach: "Praia",
      city: "City break",
      road: "Estrada",
      ski: "Neve / ski",
      hiking: "Trekking",
    },
  },
  en: {
    tpl: {
      blank: "Blank",
      beach: "Beach",
      city: "City break",
      road: "Road trip",
      ski: "Snow / ski",
      hiking: "Hiking",
    },
  },
};
