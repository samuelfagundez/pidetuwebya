# PideTuWebYa

Landing page (SPA en React + Vite + TailwindCSS) para vender páginas web
prehechas. Estructura basada en el stack del repo [`punk`](https://github.com/samuelfagundez/punk).

## ¿Qué hace este sitio?

1. **Portada** con dos botones:
   - **"Pide tu web ya"** → abre un formulario (nombre de empresa + teléfono
     o correo, uno de los dos obligatorio) y genera al instante una **web
     de muestra** en `/pide-tu-web`, con estructura y estilo casi idénticos
     al sitio de referencia ("punk"), pero con el nombre de la empresa
     sustituido en todo el contenido y datos moqueados.
   - **"Contáctanos"** → enlace directo a WhatsApp.
2. **Sección de equipo** (`#equipo`): foto, nombre, cargo y descripción
   breve de cada persona (contenido en `src/content.ts`, pendiente de
   fotos/datos reales — ver lista de pendientes más abajo).
3. En la web de muestra, un **panel de personalización** permite elegir
   colores principales, subir una imagen de portada y hasta 4 imágenes para
   el carrusel, y mostrar/ocultar secciones. Los cambios sólo se aplican al
   pulsar **"Solicitar web ya"**, que también envía un correo de aviso.

## Captura de leads (sin backend propio)

No hay servidor propio para la SPA: el aviso de cada solicitud se envía
por correo llamando a un **Worker de Cloudflare** (`worker/mailer.js`),
que a su vez usa [Resend](https://resend.com) para mandar el correo.
Además se guarda una copia de respaldo en `localStorage` (clave
`ptw_leads`).

Se disparan **dos correos**:

- Al enviar el Formulario 1 ("Pide tu web ya"): nombre de empresa +
  teléfono y correo.
- Al pulsar "Solicitar web ya" en el panel de personalización: colores
  elegidos, secciones visibles, su contacto, y **el banner + hasta 3
  fotos de galería que haya subido, como adjuntos reales del correo**.

### Cómo está protegido (y por qué no es como EmailJS)

La clave real (`RESEND_API_KEY`) vive **solo dentro del Worker**, guardada
como *Secret* en Cloudflare — nunca llega al navegador ni al código de
este repo. El propio Worker además rechaza cualquier petición cuyo
`Origin` no sea `https://pidetuwebya.es` (ver `ALLOWED_ORIGINS` en
`worker/mailer.js`). Esto es justo lo que EmailJS no permitía hacer en su
plan gratuito (restringir por dominio quién puede usar la clave pública),
y la razón del cambio.

La URL del Worker (`VITE_MAILER_URL`) **no es secreta** — es pública y
está pensada para ser conocida, ya que la seguridad real la da la
validación de origen del propio Worker, no que la URL sea difícil de
adivinar. Por eso va como valor por defecto en `src/lib/mailer.ts`,
sobreescribible con una **Variable** (no Secret) del repo si el Worker
cambia de nombre/dominio.

### Desplegar el Worker

`worker/mailer.js` es la fuente de verdad, pero Cloudflare no lo lee del
repo automáticamente: hay que copiar su contenido al editor del Worker en
el dashboard de Cloudflare (Workers & Pages → el Worker → *Edit code*) y
darle *Deploy* cada vez que cambie. El secreto se configura aparte, en
*Settings → Variables and Secrets* del Worker (`RESEND_API_KEY`, tipo
*Secret*).

Mientras `VITE_MAILER_URL` no resuelva a un Worker desplegado y con el
secreto configurado, la app sigue funcionando con normalidad: sólo se
omite el envío de correo (se avisa por consola) y el lead queda guardado
en `localStorage`.

## Desarrollo

```bash
npm install
npm run dev
```

## Build / Deploy

```bash
npm run build
```

El workflow `.github/workflows/deploy.yml` construye y publica el sitio en
GitHub Pages en cada push a `main`.

## Estructura

```
src/
  content.ts          Contenido y datos del sitio principal (marca, equipo, WhatsApp)
  components/         Header, Hero, Team, Footer, FloatingWhatsApp, LeadFormModal (Formulario 1)
  layouts/             MarketingLayout (chrome del sitio principal)
  pages/
    Home.tsx           Portada
    DemoBuilder.tsx     Página de la web de muestra + panel de personalización
  demo/                Componentes y contenido de la web de muestra (estilo "punk")
  lib/                 mailer.ts, storage.ts, imageResize.ts, placeholderImage.ts, asset.ts
worker/
  mailer.js            Worker de Cloudflare que envía los correos vía Resend
```
