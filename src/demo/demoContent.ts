import { placeholderImage } from "../lib/placeholderImage";
import type { DemoContent } from "./demoTypes";

export const DEMO_DEFAULT_PRIMARY = "#2c3a5e";
export const DEMO_DEFAULT_SECONDARY = "#1e2a47";
export const DEMO_DEFAULT_ADDRESS = "Calle Ejemplo 123, Tu Ciudad";

/**
 * Genera el contenido moqueado de la web de muestra a partir del nombre de
 * empresa que el cliente escribió en el Formulario 1. El nombre se sustituye
 * en todos los textos donde aparecería el nombre del negocio (título,
 * descripción, imágenes de muestra, footer, etc.), imitando la estructura
 * real del sitio "punk" pero con datos de relleno.
 */
export function buildDemoContent(
  companyName: string,
  phone = "",
  email = "",
): DemoContent {
  const name = companyName.trim() || "Tu Empresa";

  return {
    name,
    tagline: `${name} — así se vería tu nueva página web`,
    description: `Esta es una vista previa de cómo ${name} podría lucir en internet: una página rápida, moderna y lista para atraer clientes. Todo el contenido de esta demo es de muestra — personaliza los colores, la foto de portada y la galería en el panel de abajo para acercarte a tu idea, y pulsa "Solicitar web ya" cuando quieras que la hagamos realidad.`,
    phone,
    email,
    address: DEMO_DEFAULT_ADDRESS,
    hours: [
      { day: "Lunes a viernes", hours: "9:00 – 19:00" },
      { day: "Sábado", hours: "10:00 – 14:00" },
      { day: "Domingo", hours: "Cerrado" },
    ],
    banner: placeholderImage(`${name} — Foto de portada`, 0, 1600, 900),
    gallery: [0, 1, 2].map((i) => ({
      src: placeholderImage(`${name} — Foto ${i + 1}`, i, 800, 600),
      alt: `Imagen de muestra ${i + 1} de ${name}`,
    })),
    primaryColor: DEMO_DEFAULT_PRIMARY,
    secondaryColor: DEMO_DEFAULT_SECONDARY,
    sections: { about: true, gallery: true, hours: true, location: true },
  };
}
