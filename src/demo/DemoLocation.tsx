import { DEMO_DEFAULT_ADDRESS } from "./demoContent";
import type { DemoContent } from "./demoTypes";

interface Props {
  content: DemoContent;
}

const PinIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.62 6.54 11.54 6.82 11.79a1 1 0 0 0 1.36 0c.28-.25 6.82-6.17 6.82-11.79C19.5 5.36 16.14 2 12 2Zm0 10.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
  </svg>
);

/**
 * Sección "Ubicación": el cliente escribe su dirección real (texto libre,
 * sin necesidad de conseguir ningún link de Google Maps) y armamos el mapa
 * nosotros mismos con ella — sin API key ni servicio de geocodificación de
 * por medio, usando el modo "embed" que expone el propio buscador de Maps
 * a partir de una búsqueda de texto (gratis, sin registro, sin límites de
 * uso para este volumen).
 *
 * Mientras la dirección siga siendo la de muestra (no personalizada), se
 * muestra un mapa ilustrativo en vez de intentar geolocalizar una
 * dirección que no existe.
 */
export default function DemoLocation({ content }: Props) {
  const isCustomAddress =
    content.address.trim() && content.address.trim() !== DEMO_DEFAULT_ADDRESS;

  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    content.address,
  )}&z=15&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    content.address,
  )}`;

  return (
    <section id="demo-ubicacion" className="bg-black/[0.02] py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="font-display text-center text-3xl font-bold text-[var(--color-brand-dark)] sm:text-4xl">
          Ubicación
        </h2>
        <p className="mt-2 text-center text-black/60">{content.address}</p>

        {isCustomAddress ? (
          <>
            <div className="mt-8 overflow-hidden rounded-xl border border-black/10">
              <iframe
                title={`Mapa de ubicación de ${content.name}`}
                src={embedSrc}
                width="100%"
                height="420"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
              />
            </div>
            <div className="mt-4 text-center">
              <a
                href={mapsLink}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm font-medium text-[var(--color-brand)] hover:underline"
              >
                Ver en Google Maps →
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="relative mt-8 flex h-[320px] items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-white">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,black_1px,transparent_1px),linear-gradient(to_bottom,black_1px,transparent_1px)] [background-size:32px_32px]"
              />
              <div className="relative flex flex-col items-center gap-2 px-4 text-center">
                <span className="text-[var(--color-brand)]">
                  <PinIcon />
                </span>
                <p className="font-display font-semibold text-[var(--color-brand-dark)]">
                  {content.name}
                </p>
                <p className="text-sm text-black/50">{content.address}</p>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-black/40">
              Escribe tu dirección real en "Personaliza tu web" y aquí
              aparecerá el mapa de verdad.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
