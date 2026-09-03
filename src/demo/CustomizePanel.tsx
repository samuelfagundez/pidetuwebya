import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { contactHref } from "../content";
import { sendWebRequestEmail } from "../lib/emailjs";
import { saveLeadLocally } from "../lib/storage";
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

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
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
  const [bannerFile, setBannerFile] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<DemoPhoto[] | null>(null);
  const [sections, setSections] = useState<DemoSections>(base.sections);
  const [phone, setPhone] = useState(lead.phone);
  const [email, setEmail] = useState(lead.email);
  const [status, setStatus] = useState<Status>("idle");

  async function handleBannerChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(await readAsDataUrl(file));
  }

  async function handleGalleryChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 4);
    if (files.length === 0) return;
    const photos = await Promise.all(
      files.map(async (file, i) => ({
        src: await readAsDataUrl(file),
        alt: `Foto ${i + 1} de ${base.name} subida por el cliente`,
      })),
    );
    setGalleryFiles(photos);
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
      banner: bannerFile ?? base.banner,
      gallery: galleryFiles ?? base.gallery,
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
      bannerUploaded: Boolean(bannerFile),
      galleryImagesUploaded: galleryFiles?.length ?? 0,
      sections,
    });

    await sendWebRequestEmail({
      company_name: base.name,
      phone: phone.trim() || "(no proporcionado)",
      email: email.trim() || "(no proporcionado)",
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      banner_uploaded: bannerFile ? "Sí" : "No (se usó imagen de muestra)",
      gallery_images: String(galleryFiles?.length ?? 0),
      sections_visibles: (
        Object.entries(sections) as [string, boolean][]
      )
        .filter(([, visible]) => visible)
        .map(([key]) => key)
        .join(", "),
      origin: "Formulario 2 - Solicitar web ya",
    });

    setStatus("done");
  }

  return (
    <div className="sticky bottom-0 z-[60] border-t-2 border-[var(--color-gold,#f2b134)] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-[var(--color-gold,#f2b134)]/10 px-4 py-3 text-left font-semibold sm:px-6"
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
                  className="mt-1 w-full text-sm"
                />
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
                  className="mt-1 w-full text-sm"
                />
              </div>

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
