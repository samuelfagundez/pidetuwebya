import { content, contactHref } from "../content";
import { useLeadModal } from "../context/useLeadModal";

export default function Hero() {
  const { open } = useLeadModal();

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-[var(--color-brand-dark)] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(109,94,240,0.55),transparent_55%),radial-gradient(circle_at_80%_75%,rgba(242,177,52,0.35),transparent_50%)]"
      />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <p className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold tracking-wide text-white/80 uppercase">
          Páginas web prehechas
        </p>
        <h1 className="font-display text-4xl font-bold sm:text-6xl">
          {content.name}
        </h1>
        <p className="mt-4 text-lg text-white/90 sm:text-xl">
          {content.tagline}
        </p>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/70 sm:text-base">
          Dinos el nombre de tu empresa y verás al instante una vista previa
          de tu web, lista para personalizar con tus colores y tus fotos.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button type="button" onClick={open} className="btn-accent">
            Pide tu web ya
          </button>
          <a
            href={contactHref()}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-whatsapp border-white bg-white hover:bg-[#25D366]"
          >
            Contáctanos
          </a>
        </div>
      </div>
    </section>
  );
}
