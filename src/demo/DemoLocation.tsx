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
 * Sección "Ubicación". Los links de "Compartir" de Google Maps
 * (maps.app.goo.gl/...) no se pueden incrustar como iframe (Google los
 * bloquea), así que en vez de intentar embeberlos mostramos una tarjeta
 * con un botón directo a Maps. Sin link, mostramos un mapa ilustrativo
 * como preview de lo que iría en la web real.
 */
export default function DemoLocation({ content }: Props) {
  return (
    <section id="demo-ubicacion" className="bg-black/[0.02] py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="font-display text-center text-3xl font-bold text-[var(--color-brand-dark)] sm:text-4xl">
          Ubicación
        </h2>
        <p className="mt-2 text-center text-black/60">{content.address}</p>

        {content.mapLink ? (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-black/10 bg-white px-6 py-12 text-center">
            <span className="text-[var(--color-brand)]">
              <PinIcon />
            </span>
            <p className="font-display text-lg font-semibold text-[var(--color-brand-dark)]">
              {content.name}
            </p>
            <p className="text-sm text-black/50">{content.address}</p>
            <a
              href={content.mapLink}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 inline-flex items-center justify-center rounded-md bg-[var(--color-brand)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--color-brand-dark)]"
            >
              Ver ubicación en Google Maps →
            </a>
          </div>
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
              En tu web real aquí va un mapa interactivo con la ubicación
              exacta de tu negocio.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
