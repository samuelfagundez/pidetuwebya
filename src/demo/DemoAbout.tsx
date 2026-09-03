import type { DemoContent } from "./demoTypes";

interface Props {
  content: DemoContent;
}

export default function DemoAbout({ content }: Props) {
  return (
    <section
      id="demo-nosotros"
      className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6"
    >
      <h2 className="font-display text-3xl font-bold text-[var(--color-brand-dark)] sm:text-4xl">
        Sobre nosotros
      </h2>
      <p className="mt-6 text-lg leading-relaxed text-black/80">
        {content.description}
      </p>
      <p className="mt-6 text-sm text-black/50">{content.address}</p>
    </section>
  );
}
