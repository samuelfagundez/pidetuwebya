/**
 * Worker de Cloudflare que reemplaza a EmailJS: recibe los datos de los
 * formularios (y las fotos que el cliente sube en "Personaliza tu web",
 * como adjuntos) y los manda por correo vía Resend.
 *
 * Por qué esto y no EmailJS: EmailJS en el plan gratis no permite
 * restringir qué dominios pueden usar la Public Key, así que cualquiera
 * que la copiara del código fuente podía mandar correos "en nuestro
 * nombre" usando nuestra cuota. Acá la clave real de Resend
 * (RESEND_API_KEY) vive SOLO en este Worker, como "Secret" — nunca llega
 * al navegador — y el propio Worker rechaza cualquier petición que no
 * venga del dominio del sitio.
 *
 * DESPLIEGUE: este archivo es la fuente de verdad, pero Cloudflare no lo
 * lee del repo directamente — hay que copiar/pegar su contenido en el
 * editor del Worker (Workers & Pages -> pidetuwebya-mailer -> Edit code)
 * cada vez que cambie, y darle "Deploy". El secreto RESEND_API_KEY se
 * configura aparte, en Settings -> Variables and Secrets.
 */

// Dominios desde los que se acepta una petición. El de producción es el
// único que importa en la práctica; los de localhost son solo para poder
// probar en local durante desarrollo (npm run dev / npm run preview).
const ALLOWED_ORIGINS = [
  "https://pidetuwebya.es",
  "http://localhost:5173",
  "http://localhost:4173",
];

const FROM = "PideTuWebYa <notificaciones@pidetuwebya.es>";
const TO = "contacto@pidetuwebya.es";

// Cuántas imágenes como máximo se aceptan por correo (banner + 3 de
// galería, como ya limita el panel de personalización) y cuánto puede
// pesar cada una en base64 — protege contra pedidos abusivos aunque el
// sitio ya valide esto antes de llegar aquí.
const MAX_ATTACHMENTS = 4;
const MAX_ATTACHMENT_BASE64_CHARS = 12_000_000; // ~9MB decodificado

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
      ? origin
      : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers });
    }

    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response("Forbidden", { status: 403, headers });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Bad request", { status: 400, headers });
    }

    const { email, title, message, attachments } = body || {};

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return new Response("Missing fields", { status: 400, headers });
    }

    const resendAttachments = Array.isArray(attachments)
      ? attachments
          .filter(
            (a) =>
              a &&
              typeof a.filename === "string" &&
              typeof a.dataUrl === "string" &&
              a.dataUrl.includes(","),
          )
          .slice(0, MAX_ATTACHMENTS)
          .map((a) => ({
            filename: a.filename,
            content: a.dataUrl.split(",")[1].slice(0, MAX_ATTACHMENT_BASE64_CHARS),
          }))
      : [];

    const resendPayload = {
      from: FROM,
      to: [TO],
      subject: title,
      text: message,
    };
    if (typeof email === "string" && email.trim()) {
      resendPayload.reply_to = email.trim();
    }
    if (resendAttachments.length > 0) {
      resendPayload.attachments = resendAttachments;
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", errText);
      return new Response("No se pudo enviar el correo", {
        status: 502,
        headers,
      });
    }

    return new Response("OK", { status: 200, headers });
  },
};
