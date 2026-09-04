import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { contactHref } from "../content";
import { sendWebRequestEmail } from "../lib/emailjs";
import { saveLeadLocally } from "../lib/storage";
import {
  IMAGE_MAX_DIMENSION,
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_MB,
  resizeImageToDataUrl,
} from "../lib/imageResize";
import type { DemoContent, DemoPhoto, DemoSections } from "./demoTypes";

interface LeadState {
  companyName: string;
  phone: string;
  email: string;
}

interface CustomizePanelProps {
  lead: LeadState;
  base: DemoContent;
  onApply: (next: DemoContent) => void;
}

type Status = "idle" | "sending" | "done" | "error";

/** Imagen ya subida y lista para usar, con su nombre original para
 * mostrárselo al usuario (DemoPhoto/banner solo guardan la data URL). */
interface UploadedImage {
  src: string;
  name: string;
}

const GALLERY_LIMIT = 3;

/**
 * Formulario 2 — panel de personalización de la web de muestra: colores,
 * imagen de portada, hasta 3 imágenes de carrusel y qué secciones mostrar
 * ("agregar o eliminar elementos"). Los cambios NO se aplican en vivo:
 * sólo se reflejan en la vista previa al pulsar "Solicitar web ya", que
 * además dispara el segundo correo de aviso (EmailJS) con todo lo que el
 * usuario configuró.
 */
export default function CustomizePanel({
  lead,
  base,
  onApply,
}: CustomizePanelProps) {
  const [open, setOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(base.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(base.secondaryColor);
  const [bannerUpload, setBannerUpload] = useState<UploadedImage | null>(
    null,
  );
  const [bannerProcessing, setBannerProcessing] = useState(false);
  const [galleryUploads, setGalleryUploads] = useState<UploadedImage[]>([]);
  const [galleryProcessing, setGalleryProcessing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [sections, setSections] = useState<DemoSections>(base.sections);
  const [otherSection, setOtherSection] = useState("");
  const [phone, setPhone] = useState(lead.phone);
  const [email, setEmail] = useState(lead.email);
  const [status, setStatus] = useState<Status>("idle");

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function handleBannerChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Limpia el input: permite volver a elegir el mismo archivo más tarde
    // (por ejemplo, tras quitarlo) y dispara onChange igual la próxima vez.
    e.target.value = "";
    if (!file) return;

    setImageError(null);

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setImageError(
        `"${file.name}" pesa demasiado (máx. ${MAX_UPLOAD_SIZE_MB}MB). Prueba con otra foto.`,
      );
      return;
    }

    setBannerProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(
        file,
        IMAGE_MAX_DIMENSION.banner,
      );
      setBannerUpload({ src: dataUrl, name: file.name });
    } catch {
      setImageError(
        `No se pudo cargar "${file.name}". Prueba con otra imagen (JPG o PNG).`,
      );
    } finally {
      setBannerProcessing(false);
    }
  }

  function removeBanner() {
    setBannerUpload(null);
  }

  async function handleGalleryChange(e: ChangeEvent<HTMLInputElement>) {
    const allFiles = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (allFiles.length === 0) return;

    setImageError(null);

    const remainingSlots = GALLERY_LIMIT - galleryUploads.length;
    const files = allFiles.slice(0, remainingSlots);
    const tooMany = allFiles.length > remainingSlots;

    const oversized = files.filter((f) => f.size > MAX_UPLOAD_SIZE_BYTES);
    const toProcess = files.filter((f) => f.size <= MAX_UPLOAD_SIZE_BYTES);

    setGalleryProcessing(true);

    // allSettled en vez de all: si una sola foto falla (formato raro,
    // corrupta), las demás igual se guardan — antes, una falla tiraba
    // abajo todas sin avisar nada.
    const results = await Promise.allSettled(
      toProcess.map((file) =>
        resizeImageToDataUrl(file, IMAGE_MAX_DIMENSION.gallery).then(
          (src): UploadedImage => ({ src, name: file.name }),
        ),
      ),
    );

    const uploaded: UploadedImage[] = [];
    const failedNames: string[] = [];
    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        uploaded.push(result.value);
      } else {
        failedNames.push(toProcess[i].name);
      }
    });

    setGalleryUploads((prev) => [...prev, ...uploaded]);
    setGalleryProcessing(false);

    const errors: string[] = [];
    if (oversized.length > 0) {
      errors.push(
        `${oversized.length === 1 ? "Esta foto pesa" : "Estas fotos pesan"} más de ${MAX_UPLOAD_SIZE_MB}MB: ${oversized.map((f) => f.name).join(", ")}.`,
      );
    }
    if (failedNames.length > 0) {
      errors.push(
        `No se pudieron cargar: ${failedNames.join(", ")}.`,
      );
    }
    if (tooMany) {
      errors.push(
        `Solo puedes subir hasta ${GALLERY_LIMIT} fotos para el carrusel — se ignoraron las demás.`,
      );
    }
    if (errors.length > 0) setImageError(errors.join(" "));
  }

  function removeGalleryPhoto(index: number) {
    setGalleryUploads((prev) => prev.filter((_, i) => i !== index));
  }

  function clearGallery() {
    setGalleryUploads([]);
  }

  function toggleSection(key: keyof DemoSections, checked: boolean) {
    setSections((prev) => ({ ...prev, [key]: checked }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!phone.trim() && !email.trim()) {
      setStatus("error");
      return;
    }

    setStatus("sending");

    const gallery: DemoPhoto[] =
      galleryUploads.length > 0
        ? galleryUploads.map((u, i) => ({
            src: u.src,
            alt: `Foto ${i + 1} de ${base.name} subida por el cliente`,
          }))
        : base.gallery;

    const next: DemoContent = {
      ...base,
      primaryColor,
      secondaryColor,
      banner: bannerUpload?.src ?? base.banner,
      gallery,
      sections,
      phone: phone.trim(),
      email: email.trim(),
    };
    // Se actualiza la vista previa al instante, al pulsar "Solicitar web ya".
    onApply(next);

    saveLeadLocally({
      type: "web_request",
      companyName: base.name,
      phone: phone.trim(),
      email: email.trim(),
      primaryColor,
      secondaryColor,
      bannerUploaded: Boolean(bannerUpload),
      galleryImagesUploaded: galleryUploads.length,
      sections,
      otherSectionRequest: otherSection.trim(),
    });

    const sectionsVisibles = (Object.entries(sections) as [string, boolean][])
      .filter(([, visible]) => visible)
      .map(([key]) => key)
      .join(", ");

    // "name"/"email"/"title" alimentan From Name / Reply To / Subject del
    // template de EmailJS; "message" es el cuerpo con el detalle completo.
    await sendWebRequestEmail({
      name: base.name,
      email: email.trim(),
      title: `🎨 Solicitud de web: ${base.name} — Solicitar web ya`,
      message: [
        "Nueva solicitud desde el Formulario 2 (Solicitar web ya):",
        `Empresa: ${base.name}`,
        `Teléfono: ${phone.trim() || "(no proporcionado)"}`,
        `Correo: ${email.trim() || "(no proporcionado)"}`,
        `Color principal: ${primaryColor}`,
        `Color secundario: ${secondaryColor}`,
        `Banner subido: ${bannerUpload ? "Sí" : "No (se usó imagen de muestra)"}`,
        `Imágenes de carrusel subidas: ${galleryUploads.length}`,
        `Secciones visibles: ${sectionsVisibles}`,
        `Otra sección solicitada: ${otherSection.trim() || "(ninguna)"}`,
      ].join("\n"),
    });

    setStatus("done");
  }

  return (
    <div className="z-[60] border-b-2 border-[var(--color-gold,#d9a73b)] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-[var(--color-gold,#d9a73b)]/10 px-4 py-3 text-left font-semibold transition hover:bg-[var(--color-gold,#d9a73b)]/20 sm:px-6"
      >
        <span>🎨 Click aquí para personalizar tu web {open ? "▾" : "▸"}</span>
        {status === "done" && (
          <span className="text-sm font-normal text-green-600">
            ¡Solicitud enviada!
          </span>
        )}
      </button>

      {open && (
        <div className="max-h-[70vh] overflow-y-auto px-4 pb-6 sm:px-6">
          {status === "done" ? (
            <div className="mx-auto max-w-md py-6 text-center">
              <p className="text-lg font-semibold text-[var(--color-brand-dark)]">
                ¡Perfecto! Ya vimos cómo quieres tu web 🎉
              </p>
              <p className="mt-2 text-sm text-black/70">
                Nuestro equipo revisará tu solicitud y se pondrá en contacto
                contigo muy pronto para afinar los últimos detalles.
              </p>
              <a
                href={contactHref()}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-whatsapp mt-4 inline-flex"
              >
                Hablar por WhatsApp ahora
              </a>
            </div>
          ) : (
            <form
              className="mx-auto grid max-w-3xl gap-5 py-4 sm:grid-cols-2"
              onSubmit={handleSubmit}
            >
              <div>
                <label
                  className="block text-sm font-medium"
                  htmlFor="primaryColor"
                >
                  Color principal
                </label>
                <input
                  id="primaryColor"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-black/15"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium"
                  htmlFor="secondaryColor"
                >
                  Color secundario
                </label>
                <input
                  id="secondaryColor"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-black/15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Imagen de portada (banner)
                </label>

                {!bannerUpload ? (
                  <label
                    htmlFor="banner"
                    className="group mt-1 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[var(--color-brand)]/30 bg-[var(--color-brand)]/5 px-4 py-6 text-center transition hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/10"
                  >
                    <span className="text-2xl transition-transform group-hover:scale-110">
                      📷
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-brand-dark)]">
                      Subir foto de portada
                    </span>
                    <span className="text-xs text-black/40">
                      JPG o PNG, máx. {MAX_UPLOAD_SIZE_MB}MB
                    </span>
                  </label>
                ) : (
                  <div className="animate-fade-in-up mt-1 flex items-center gap-3 rounded-lg border border-black/10 bg-white p-2 shadow-sm">
                    <img
                      src={bannerUpload.src}
                      alt="Vista previa del banner"
                      className="h-14 w-20 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {bannerUpload.name}
                      </p>
                      <p className="text-xs text-green-600">
                        ✓ Listo para usar
                      </p>
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="text-xs font-medium text-[var(--color-brand)] underline"
                      >
                        Cambiar
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={removeBanner}
                      aria-label="Quitar imagen de portada"
                      title="Quitar"
                      className="shrink-0 rounded-full p-1.5 text-black/40 transition hover:bg-red-50 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {bannerProcessing && (
                  <p className="mt-2 text-xs text-black/50">
                    Procesando imagen...
                  </p>
                )}
                <input
                  ref={bannerInputRef}
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  disabled={bannerProcessing}
                  className="sr-only"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Fotos para el carrusel (máx. {GALLERY_LIMIT})
                </label>

                {galleryUploads.length < GALLERY_LIMIT && (
                  <label
                    htmlFor="gallery"
                    className="group mt-1 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[var(--color-brand)]/30 bg-[var(--color-brand)]/5 px-4 py-6 text-center transition hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/10"
                  >
                    <span className="text-2xl transition-transform group-hover:scale-110">
                      🖼️
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-brand-dark)]">
                      {galleryUploads.length === 0
                        ? "Subir fotos"
                        : "Agregar más fotos"}
                    </span>
                    <span className="text-xs text-black/40">
                      Hasta {GALLERY_LIMIT - galleryUploads.length} más · JPG
                      o PNG, máx. {MAX_UPLOAD_SIZE_MB}MB c/u
                    </span>
                  </label>
                )}
                {galleryProcessing && (
                  <p className="mt-2 text-xs text-black/50">
                    Procesando imágenes...
                  </p>
                )}
                <input
                  ref={galleryInputRef}
                  id="gallery"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  disabled={galleryProcessing}
                  className="sr-only"
                />

                {galleryUploads.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {galleryUploads.map((photo, i) => (
                      <div
                        key={photo.src + i}
                        className="animate-fade-in-up flex items-center gap-3 rounded-lg border border-black/10 bg-white p-2 shadow-sm"
                      >
                        <img
                          src={photo.src}
                          alt={`Vista previa ${i + 1}`}
                          className="h-12 w-12 shrink-0 rounded-md object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {photo.name}
                          </p>
                          <p className="text-xs text-green-600">
                            ✓ Listo para usar
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGalleryPhoto(i)}
                          aria-label={`Quitar foto ${i + 1} del carrusel`}
                          title="Quitar"
                          className="shrink-0 rounded-full p-1.5 text-black/40 transition hover:bg-red-50 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {galleryUploads.length > 1 && (
                      <button
                        type="button"
                        onClick={clearGallery}
                        className="text-xs font-medium text-black/50 underline transition hover:text-red-600"
                      >
                        Quitar todas
                      </button>
                    )}
                  </div>
                )}
              </div>

              {imageError && (
                <p
                  role="alert"
                  className="text-sm font-medium text-red-600 sm:col-span-2"
                >
                  {imageError}
                </p>
              )}

              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-medium">
                  Secciones a mostrar
                </legend>
                <div className="mt-2 flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={sections.about}
                      onChange={(e) =>
                        toggleSection("about", e.target.checked)
                      }
                    />
                    Sobre nosotros
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={sections.gallery}
                      onChange={(e) =>
                        toggleSection("gallery", e.target.checked)
                      }
                    />
                    Galería
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={sections.hours}
                      onChange={(e) =>
                        toggleSection("hours", e.target.checked)
                      }
                    />
                    Horario
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={sections.location}
                      onChange={(e) =>
                        toggleSection("location", e.target.checked)
                      }
                    />
                    Ubicación
                  </label>
                </div>
              </fieldset>

              <div className="sm:col-span-2">
                <label
                  className="block text-sm font-medium"
                  htmlFor="otherSection"
                >
                  ¿Alguna otra sección que te gustaría agregar?
                </label>
                <textarea
                  id="otherSection"
                  value={otherSection}
                  onChange={(e) => setOtherSection(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
                  placeholder="Ej. Testimonios de clientes, preguntas frecuentes, blog..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium" htmlFor="panelPhone">
                  Teléfono de contacto
                </label>
                <input
                  id="panelPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-md border border-black/15 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium" htmlFor="panelEmail">
                  Correo de contacto
                </label>
                <input
                  id="panelEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-black/15 px-3 py-2"
                />
              </div>

              {status === "error" && (
                <p
                  role="alert"
                  className="text-sm font-medium text-red-600 sm:col-span-2"
                >
                  Déjanos un teléfono o un correo para poder contactarte.
                </p>
              )}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="btn-accent w-full"
                  disabled={status === "sending"}
                >
                  {status === "sending"
                    ? "Enviando solicitud..."
                    : "Solicitar web ya"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
