import type { DemoContent } from "./demoTypes";

interface Props {
  content: DemoContent;
}

/**
 * Sección "Ubicación" — en la web real de un cliente iría un mapa
 * interactivo (Google Maps) con su dirección real. Aquí, como el negocio
 * es de muestra y no tenemos coordenadas reales, mostramos un mapa
 * ilustrativo con el nombre y la dirección de ejemplo.
 */
export default function DemoLocation({ content }: Props) {
  return (
    <section id="demo-ubicacion" className="bg-black/[0.02] py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="font-display text-center text-3xl font-bold text-[var(--color-brand-dark)] sm:text-4xl">
          Ubicación
        </h2>
        <p className="mt-2 text-center text-black/60">{content.address}</p>

        <div className="relative mt-8 flex h-[320px] items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,black_1px,transparent_1px),linear-gradient(to_bottom,black_1px,transparent_1px)] [background-size:32px_32px]"
          />
          <div className="relative flex flex-col items-center gap-2 px-4 text-center">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="var(--color-brand)"
              aria-hidden="true"
            >
              <path d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.62 6.54 11.54 6.82 11.79a1 1 0 0 0 1.36 0c.28-.25 6.82-6.17 6.82-11.79C19.5 5.36 16.14 2 12 2Zm0 10.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
            </svg>
            <p className="font-display font-semibold text-[var(--color-brand-dark)]">
              {content.name}
            </p>
            <p className="text-sm text-black/50">{content.address}</p>
          </div>
        </div>
        {content.mapLink ? (
          <div className="mt-4 text-center">
            <a
              href={content.mapLink}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm font-medium text-[var(--color-brand)] hover:underline"
            >
              Ver en Google Maps →
            </a>
          </div>
        ) : (
          <p className="mt-3 text-center text-xs text-black/40">
            En tu web real aquí va un mapa interactivo con la ubicación
            exacta de tu negocio.
          </p>
        )}
      </div>
    </section>
  );
}
