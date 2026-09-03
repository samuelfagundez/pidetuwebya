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

## Captura de leads (sin backend)

No hay servidor: el aviso de cada solicitud se envía por correo con
[EmailJS](https://www.emailjs.com) desde el propio navegador, y además se
guarda una copia de respaldo en `localStorage` (clave `ptw_leads`).

Se disparan **dos correos**:

- Al enviar el Formulario 1 ("Pide tu web ya"): nombre de empresa + teléfono
  y/o correo.
- Al pulsar "Solicitar web ya" en el panel de personalización: colores
  elegidos, si subió banner/imágenes, secciones visibles y su contacto.

### Configurar EmailJS

**Todas las credenciales (Service ID, Template ID y Public Key) se leen
exclusivamente de variables de entorno — nunca están hardcodeadas en el
código ni en el repo.** En producción (GitHub Pages) las inyecta el
workflow de deploy desde **GitHub Secrets** del repositorio; en local se
leen de `.env.local` (gitignored, ver `.env.example`).

Para configurarlas en GitHub: **Settings → Secrets and variables →
Actions → New repository secret**, y crea:

```
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_PUBLIC_KEY
VITE_EMAILJS_TEMPLATE_LEAD        (por ahora, mismo valor que TEMPLATE_REQUEST)
VITE_EMAILJS_TEMPLATE_REQUEST
```

El template configurado en EmailJS usa estas variables:

```
From Name: {{name}}    Reply To: {{email}}    Subject: {{title}}
```

y su cuerpo debe incluir `{{message}}` para mostrar el detalle completo
que le manda el código (empresa, teléfono, colores, imágenes, secciones,
etc.). Por ahora sólo existe un template en EmailJS, así que se reutiliza
para los dos correos (lead inicial y solicitud final), diferenciados por
asunto y cuerpo.

**Aviso importante:** esta app es una SPA sin backend, así que estos
valores terminan igual incrustados en el JS que descarga cualquier
visitante una vez publicado el sitio — GitHub Secrets evita que vivan en
el código-fuente o el historial de git del repo, pero no los "esconde" del
sitio en producción (eso es inherente a que EmailJS funcione 100% desde el
navegador, no un descuido de esta app). La mitigación real contra abuso es
restringir los dominios permitidos para el Public Key desde el dashboard
de EmailJS (**Account → Security → Allowed origins**), limitándolo al
dominio real del sitio.

Mientras estas variables no estén configuradas, la app sigue funcionando
con normalidad: sólo se omite el envío de correo (se avisa por consola) y
el lead queda guardado en `localStorage`.

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
  lib/                 emailjs.ts, storage.ts, placeholderImage.ts, asset.ts
```
