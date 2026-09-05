import type { DemoContent } from "./demoTypes";

interface Props {
  content: DemoContent;
}

export default function DemoHero({ content }: Props) {
  return (
    <section className="relative flex min-h-[70dvh] items-center justify-center overflow-hidden bg-[var(--color-brand-dark)] text-white">
      <img
        src={content.banner}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <h1 className="font-display text-4xl font-bold sm:text-6xl">
          {content.name}
        </h1>
        <p className="mt-4 text-lg text-white/90 sm:text-xl">
          {content.tagline}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-[var(--color-brand)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--color-brand-dark)]"
          >
            Reservar ahora
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border-2 border-white bg-white px-6 py-3 font-semibold text-[var(--color-brand-dark)] transition hover:bg-white/85"
          >
            Contáctanos
          </button>
        </div>
        <p className="mt-6 text-xs text-white/70">
          * Botones de muestra — en tu web real irían conectados a WhatsApp o
          a tu sistema de reservas.
        </p>
      </div>
    </section>
  );
}
