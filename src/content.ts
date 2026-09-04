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

// Número de WhatsApp en formato internacional, SIN "+" (el formato que
// exige wa.me). Sobreescribible con la variable de entorno
// VITE_WHATSAPP_NUMBER (ver .env.example) para no tocar código si cambia.
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "34614032089";

export const content = {
  name: "PideTuWebYa",
  shortName: "PideTuWebYa",
  tagline: "Páginas web prehechas, listas para vender desde hoy.",
  description:
    "En PideTuWebYa creamos páginas web profesionales y prediseñadas para negocios que necesitan presencia online ya, sin esperar semanas ni pagar desarrollos a medida desde cero. Elige un estilo, pide tu web y en segundos verás una vista previa personalizada con el nombre y los colores de tu negocio antes de confirmar nada.",
  // NOTA: este campo no está conectado a ningún <meta> todavía (el sitio
  // es de una sola ruta indexable, así que el meta description real vive
  // fijo en index.html — mantenlos sincronizados si editas uno). Si algún
  // día se agregan más páginas indexables, aquí es donde debería
  // conectarse un componente tipo <Seo> dinámico.
  metaDescription:
    "PideTuWebYa: páginas web prehechas para tu negocio. Pide tu web, personalízala con tus colores y fotos, y recíbela lista para vender en minutos.",
  keywords: [
    "páginas web prehechas",
    "crear página web rápido",
    "landing page para negocios",
    "web para restaurantes",
    "web para tiendas",
    "diseño web económico",
  ],

  whatsappNumber: WHATSAPP_NUMBER,
  phone: "+34614032089",
  phoneDisplay: "+34 614 03 20 89",
  email: "contacto@pidetuwebya.es",

  // TODO: ajustar al dominio/URL final del sitio cuando se publique.
  siteUrl: "https://pidetuwebya.es/",

  social: {
    // TODO(cliente): enlaces de redes sociales (dejar vacío si no aplica).
    instagram: "",
    facebook: "",
    tiktok: "",
  },

  // -------------------------------------------------------------------
  // Equipo. Las fotos van en /public/team/<archivo> — TODO(cliente): subir
  // los 3 archivos ahí con estos nombres exactos (vía GitHub, Add file ->
  // Upload files, en la carpeta public/team/); en cuanto existan, el sitio
  // los toma automáticamente en el siguiente deploy. Mientras no exista el
  // archivo, se muestra un avatar de muestra generado con las iniciales
  // (ver Team.tsx).
  // -------------------------------------------------------------------
  team: [
    {
      photo: "/team/carlos-torres.jpg",
      name: "Carlos Torres",
      role: "Ingeniero de Infraestructura y Rendimiento",
      bio: "Ingeniero de Telecomunicaciones especializado en redes de alta disponibilidad para proveedores de internet. En PideTuWebYa aplica esa misma exigencia técnica para que tu web cargue rápido y esté siempre en línea, sin caídas ni sorpresas.",
    },
    {
      photo: "/team/daniela-oliveira.jpg",
      name: "Daniela Oliveira",
      role: "Coordinadora de Proyectos y Producción",
      bio: "Ingeniera de Materiales especializada en convertir requerimientos técnicos complejos en soluciones eficientes y de calidad. Coordina cada solicitud para que tu web se entregue a tiempo y con el estándar que tu marca merece.",
    },
    {
      photo: "/team/samuel-fagundez.jpg",
      name: "Samuel Fagundez",
      role: "Fundador & Líder Técnico",
      bio: "Ingeniero de software con más de 8 años construyendo aplicaciones web escalables para empresas internacionales. Lidera el equipo técnico de PideTuWebYa para que cada página se entregue rápida, confiable y lista para vender desde el primer día.",
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
