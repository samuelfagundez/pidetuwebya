// ---------------------------------------------------------------------------
// Envío de correo sin backend, vía EmailJS (https://www.emailjs.com). El
// "public key" de EmailJS está pensado para exponerse en el cliente (no es
// un secreto), pero de todas formas se lee desde variables de entorno para
// no tener que tocar código al configurarlo.
//
// Mientras VITE_EMAILJS_* no esté configurado, el envío simplemente se
// omite (con un aviso en consola) y no rompe el flujo de la app: el lead
// sigue guardándose en localStorage (ver storage.ts).
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

/** Formulario 1: "Pide tu web ya" — nombre de empresa + teléfono/correo. */
export function sendLeadCapturedEmail(
  params: Record<string, string>,
): Promise<EmailResult> {
  return sendEmail(TEMPLATE_LEAD, params);
}

/** Formulario 2: "Solicitar web ya" — colores, imágenes, secciones. */
export function sendWebRequestEmail(
  params: Record<string, string>,
): Promise<EmailResult> {
  return sendEmail(TEMPLATE_REQUEST, params);
}
