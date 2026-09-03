// ---------------------------------------------------------------------------
// Envío de correo sin backend, vía EmailJS (https://www.emailjs.com).
//
// Service ID, Template ID y Public Key se leen SIEMPRE de variables de
// entorno (VITE_EMAILJS_*) — nunca hardcodeadas en el código-fuente, para
// que no queden en el repo ni en el historial de git. En producción
// (GitHub Pages) las inyecta el workflow de deploy a partir de GitHub
// Secrets (ver .github/workflows/deploy.yml); en local se leen de
// ".env.local" (gitignored — ver .env.example).
//
// Aviso importante: esto es una SPA sin backend, así que estos valores
// terminan igualmente incrustados en el JS que descarga cualquier
// visitante una vez compilado — GitHub Secrets evita que vivan en el
// código-fuente/historial del repo, pero NO los oculta del sitio ya
// publicado (eso es inherente a EmailJS funcionando 100% desde el
// navegador, no un descuido de esta app). La mitigación real contra abuso
// es restringir los dominios permitidos para el Public Key desde el
// dashboard de EmailJS (Account -> Security -> Allowed origins).
//
// Por ahora sólo existe UN template en EmailJS, así que se usa para los
// dos correos (lead capturado y solicitud de web),
// diferenciados por el "title" (asunto) y el "message" (cuerpo) que le
// mandamos. El día que se cree un segundo template específico para el
// Formulario 2, basta con definir VITE_EMAILJS_TEMPLATE_REQUEST.
// ---------------------------------------------------------------------------
import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const TEMPLATE_LEAD = import.meta.env.VITE_EMAILJS_TEMPLATE_LEAD;
const TEMPLATE_REQUEST = import.meta.env.VITE_EMAILJS_TEMPLATE_REQUEST;

export interface EmailResult {
  ok: boolean;
  skipped?: boolean;
  error?: unknown;
}

let initialized = false;
function ensureInit(): void {
  if (!initialized && PUBLIC_KEY) {
    emailjs.init({ publicKey: PUBLIC_KEY });
    initialized = true;
  }
}

async function sendEmail(
  templateId: string | undefined,
  params: Record<string, string>,
): Promise<EmailResult> {
  if (!SERVICE_ID || !templateId || !PUBLIC_KEY) {
    console.warn(
      "[EmailJS] Configuración incompleta (revisa las variables VITE_EMAILJS_* " +
        "en tu .env.local). No se envió el correo, pero el lead se guardó " +
        "localmente.",
      params,
    );
    return { ok: false, skipped: true };
  }

  ensureInit();
  try {
    await emailjs.send(SERVICE_ID, templateId, params);
    return { ok: true };
  } catch (error) {
    console.error("[EmailJS] Error enviando el correo:", error);
    return { ok: false, error };
  }
}

/**
 * Formulario 1: "Pide tu web ya" — nombre de empresa + teléfono/correo.
 *
 * `params` debe incluir "name", "email" y "title": el template configurado
 * en EmailJS los usa como From Name / Reply To / Subject respectivamente
 * (más "message" para el cuerpo del correo — ver buildLeadMessage en
 * LeadFormModal.tsx).
 */
export function sendLeadCapturedEmail(
  params: Record<string, string>,
): Promise<EmailResult> {
  return sendEmail(TEMPLATE_LEAD, params);
}

/**
 * Formulario 2: "Solicitar web ya" — colores, imágenes, secciones.
 * Mismo formato de `params` que sendLeadCapturedEmail (name/email/title/message).
 */
export function sendWebRequestEmail(
  params: Record<string, string>,
): Promise<EmailResult> {
  return sendEmail(TEMPLATE_REQUEST, params);
}
