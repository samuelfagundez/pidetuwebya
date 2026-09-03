// ---------------------------------------------------------------------------
// Contenido único de PideTuWebYa. Editar SOLO este archivo para actualizar
// nombre, equipo, WhatsApp, correo, redes, etc. Todo el sitio lee de aquí.
//
// Los campos marcados con "TODO(cliente)" están pendientes de la información
// real — mientras tanto usan un valor de muestra o vacío para que el sitio
// siga funcionando sin romperse.
// ---------------------------------------------------------------------------

export interface TeamMember {
  /** Ruta dentro de /public (ej. "/team/ana.jpg") o vacío para usar un
   * avatar de muestra generado automáticamente. */
  photo: string;
  name: string;
  role: string;
  bio: string;
}

// TODO(cliente): número de WhatsApp en formato internacional, SIN "+"
// (el formato que exige wa.me). Ejemplo España: 34600000000.
// Se puede definir también con la variable de entorno VITE_WHATSAPP_NUMBER
// (ver .env.example) para no tocar código en cada despliegue.
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "34600000000";

export const content = {
  name: "PideTuWebYa",
  shortName: "PideTuWebYa",
  tagline: "Páginas web prehechas, listas para vender desde hoy.",
  description:
    "En PideTuWebYa creamos páginas web profesionales y prediseñadas para negocios que necesitan presencia online ya, sin esperar semanas ni pagar desarrollos a medida desde cero. Elige un estilo, pide tu web y en segundos verás una vista previa personalizada con el nombre y los colores de tu negocio antes de confirmar nada.",
  metaDescription:
    "PideTuWebYa: páginas web prehechas para tu negocio. Pide tu web, personalízala con tus colores y fotos, y recíbela lista para vender.",
  keywords: [
    "páginas web prehechas",
    "crear página web rápido",
    "landing page para negocios",
    "web para restaurantes",
    "web para tiendas",
    "diseño web económico",
  ],

  whatsappNumber: WHATSAPP_NUMBER,
  // TODO(cliente): teléfono de contacto visible en pantalla (formato local).
  phone: "",
  phoneDisplay: "Pendiente",
  // TODO(cliente): correo de contacto público del negocio.
  email: "",

  // TODO: ajustar al dominio/URL final del sitio cuando se publique.
  siteUrl: "https://samuelfagundez.github.io/pidetuwebya/",

  social: {
    // TODO(cliente): enlaces de redes sociales (dejar vacío si no aplica).
    instagram: "",
    facebook: "",
    tiktok: "",
  },

  // -------------------------------------------------------------------
  // Equipo — TODO(cliente): reemplazar con las fotos, nombres, cargos y
  // descripciones reales. Mientras no haya foto, se genera un avatar de
  // muestra automáticamente (ver Team.tsx). Añade o quita objetos según
  // el número real de personas del equipo.
  // -------------------------------------------------------------------
  team: [
    {
      photo: "",
      name: "Nombre pendiente",
      role: "Cargo pendiente",
      bio: "Descripción breve pendiente — cuéntanos en 1-2 frases qué hace en el equipo.",
    },
    {
      photo: "",
      name: "Nombre pendiente",
      role: "Cargo pendiente",
      bio: "Descripción breve pendiente — cuéntanos en 1-2 frases qué hace en el equipo.",
    },
    {
      photo: "",
      name: "Nombre pendiente",
      role: "Cargo pendiente",
      bio: "Descripción breve pendiente — cuéntanos en 1-2 frases qué hace en el equipo.",
    },
  ] as TeamMember[],
};

/** Link de WhatsApp click-to-chat con mensaje predefinido. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${content.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_CONTACT_MESSAGE =
  "¡Hola! Vengo de la web de PideTuWebYa y quiero más información sobre las páginas web prehechas.";

/** Href del botón "Contáctanos": siempre WhatsApp directo. */
export function contactHref(): string {
  return whatsappLink(WHATSAPP_CONTACT_MESSAGE);
}
