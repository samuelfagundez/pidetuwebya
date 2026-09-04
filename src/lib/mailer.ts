// ---------------------------------------------------------------------------
// Envío de correo sin backend "de verdad" en el navegador: la web llama a
// un Worker propio de Cloudflare (ver /worker/mailer.js), que es quien
// tiene la clave real de Resend (RESEND_API_KEY) y la usa para enviar el
// correo. A diferencia de EmailJS, la clave nunca llega al navegador y el
// Worker rechaza cualquier petición que no venga de pidetuwebya.es.
//
// La URL del Worker se lee de VITE_MAILER_URL — no es secreta (el propio
// Worker es quien filtra por dominio), pero igual va por variable de
// entorno para no tener que tocar código si cambia. En producción
// (GitHub Pages) la inyecta el workflow de deploy desde una Variable del
// repositorio (ver .github/workflows/deploy.yml); en local se lee de
// ".env.local" (gitignored — ver .env.example). Si no está configurada,
// se hace un no-op silencioso con aviso en consola, igual que antes con
// EmailJS, para que el sitio nunca se rompa por esto.
// ---------------------------------------------------------------------------

const MAILER_URL = import.meta.env.VITE_MAILER_URL;

export interface MailAttachment {
  /** Nombre de archivo tal como lo verá quien reciba el correo. */
  filename: string;
  /** Data URL completa ("data:image/jpeg;base64,...") tal como la generan
   * resizeImageToDataUrl/lib/imageResize.ts. */
  dataUrl: string;
}

export interface MailParams {
  name: string;
  email: string;
  title: string;
  message: string;
  /** Fotos subidas por el cliente (banner + galería) — se mandan como
   * adjuntos reales del correo, nunca embebidas en el cuerpo (Gmail y
   * otros bloquean imágenes en base64 dentro del HTML). */
  attachments?: MailAttachment[];
}

export interface MailResult {
  ok: boolean;
  skipped?: boolean;
  error?: unknown;
}

async function sendMail(params: MailParams): Promise<MailResult> {
  if (!MAILER_URL) {
    console.warn(
      "[mailer] VITE_MAILER_URL no está configurada (revisa .env.local). " +
        "No se envió el correo, pero el lead se guardó localmente.",
      params,
    );
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch(MAILER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      console.error("[mailer] Error enviando el correo:", await res.text());
      return { ok: false, error: await res.text().catch(() => undefined) };
    }
    return { ok: true };
  } catch (error) {
    console.error("[mailer] No se pudo contactar al servicio de correo:", error);
    return { ok: false, error };
  }
}

/** Formulario 1: "Pide tu web ya" — nombre de empresa + teléfono/correo. */
export function sendLeadCapturedEmail(params: MailParams): Promise<MailResult> {
  return sendMail(params);
}

/** Formulario 2: "Solicitar web ya" — colores, secciones, y las fotos que
 * el cliente subió (banner + hasta 3 de galería) como adjuntos. */
export function sendWebRequestEmail(params: MailParams): Promise<MailResult> {
  return sendMail(params);
}
