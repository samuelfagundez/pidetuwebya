import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { contactHref } from "../content";
import { sendWebRequestEmail } from "../lib/emailjs";
import { saveLeadLocally } from "../lib/storage";
import { IMAGE_MAX_DIMENSION, resizeImageToDataUrl } from "../lib/imageResize";
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

/**
 * Formulario 2 — panel de personalización de la web de muestra: colores,
 * imagen de portada, hasta 4 imágenes de carrusel y qué secciones mostrar
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
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerProcessing, setBannerProcessing] = useState(false);
  const [galleryPreviews, setGalleryPreviews] = useState<DemoPhoto[]>([]);
  const [galleryProcessing, setGalleryProcessing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [sections, setSections] = useState<DemoSections>(base.sections);
  const [phone, setPhone] = useState(lead.phone);
  const [email, setEmail] = useState(lead.email);
  const [status, setStatus] = useState<Status>("idle");

  async function handleBannerChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Limpia el input: permite volver a elegir el mismo archivo más tarde
    // (por ejemplo, tras quitarlo) y dispara onChange igual la próxima vez.
    e.target.value = "";
    if (!file) return;

    setImageError(null);
    setBannerProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(
        file,
        IMAGE_MAX_DIMENSION.banner,
      );
      setBannerPreview(dataUrl);
    } catch {
      setImageError(
        `No se pudo cargar "${file.name}". Prueba con otra imagen (JPG o PNG).`,
      );
    } finally {
      setBannerProcessing(false);
    }
  }

  function removeBanner() {
    setBannerPreview(null);
  }

  async function handleGalleryChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 4);
    e.target.value = "";
    if (files.length === 0) return;

    setImageError(null);
    setGalleryProcessing(true);

    // allSettled en vez de all: si una sola foto falla (formato raro, muy
    // pesada, corrupta), las demás igual se guardan — antes, una falla
    // tiraba abajo las 4 sin avisar nada.
    const results = await Promise.allSettled(
      files.map((file, i) =>
        resizeImageToDataUrl(file, IMAGE_MAX_DIMENSION.gallery).then(
          (src): DemoPhoto => ({
            src,
            alt: `Foto ${i + 1} de ${base.name} subida por el cliente`,
          }),
        ),
      ),
    );

    const photos: DemoPhoto[] = [];
    const failedNames: string[] = [];
    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        photos.push(result.value);
      } else {
        failedNames.push(files[i].name);
      }
    });

    setGalleryPreviews(photos);
    setGalleryProcessing(false);
    if (failedNames.length > 0) {
      setImageError(
        `No se pudieron cargar ${failedNames.length} de ${files.length} imágenes: ${failedNames.join(", ")}.`,
      );
    }
  }

  function removeGalleryPhoto(index: number) {
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function clearGallery() {
    setGalleryPreviews([]);
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

    const next: DemoContent = {
      ...base,
      primaryColor,
      secondaryColor,
      banner: bannerPreview ?? base.banner,
      gallery: galleryPreviews.length > 0 ? galleryPreviews : base.gallery,
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
      bannerUploaded: Boolean(bannerPreview),
      galleryImagesUploaded: galleryPreviews.length,
      sections,
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
        `Banner subido: ${bannerPreview ? "Sí" : "No (se usó imagen de muestra)"}`,
        `Imágenes de carrusel subidas: ${galleryPreviews.length}`,
        `Secciones visibles: ${sectionsVisibles}`,
      ].join("\n"),
    });

    setStatus("done");
  }

  return (
    <div className="sticky bottom-0 z-[60] border-t-2 border-[var(--color-gold,#d9a73b)] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-[var(--color-gold,#d9a73b)]/10 px-4 py-3 text-left font-semibold transition hover:bg-[var(--color-gold,#d9a73b)]/20 sm:px-6"
      >
        <span>🎨 Personaliza tu web {open ? "▾" : "▸"}</span>
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
                <label className="block text-sm font-medium" htmlFor="banner">
                  Imagen de portada (banner)
                </label>
                <input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  disabled={bannerProcessing}
                  className="mt-1 w-full text-sm"
                />
                {bannerProcessing && (
                  <p className="mt-2 text-xs text-black/50">
                    Procesando imagen...
                  </p>
                )}
                {bannerPreview && !bannerProcessing && (
                  <div className="relative mt-2 inline-block">
                    <img
                      src={bannerPreview}
                      alt="Vista previa del banner"
                      className="h-20 w-32 rounded-md border border-black/10 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeBanner}
                      aria-label="Quitar imagen de portada"
                      title="Quitar"
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white transition hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium" htmlFor="gallery">
                  Imágenes para el carrusel (máx. 4)
                </label>
                <input
                  id="gallery"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  disabled={galleryProcessing}
                  className="mt-1 w-full text-sm"
                />
                {galleryProcessing && (
                  <p className="mt-2 text-xs text-black/50">
                    Procesando imágenes...
                  </p>
                )}
                {galleryPreviews.length > 0 && !galleryProcessing && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {galleryPreviews.map((photo, i) => (
                        <div key={photo.src + i} className="relative">
                          <img
                            src={photo.src}
                            alt={photo.alt}
                            className="h-16 w-16 rounded-md border border-black/10 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryPhoto(i)}
                            aria-label={`Quitar imagen ${i + 1} del carrusel`}
                            title="Quitar"
                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white transition hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={clearGallery}
                      className="mt-2 text-xs font-medium text-black/50 underline transition hover:text-red-600"
                    >
                      Quitar todas
                    </button>
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
                </div>
              </fieldset>

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
