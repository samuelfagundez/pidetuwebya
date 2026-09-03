import type { DemoContent } from "./demoTypes";

interface Props {
  content: DemoContent;
}

const NAV = [
  { href: "#demo-nosotros", label: "Nosotros" },
  { href: "#demo-galeria", label: "Galería" },
  { href: "#demo-horario", label: "Horario" },
];

export default function DemoHeader({ content }: Props) {
  return (
    <header className="border-b border-black/5 bg-white/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <span className="shrink-0 font-display text-xl font-bold text-[var(--color-brand-dark)]">
          {content.name}
        </span>

        <nav className="hidden gap-6 lg:flex" aria-label="Principal (demo)">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-black/80 transition hover:text-[var(--color-brand)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {content.phone && (
            <a
              href={`tel:${content.phone.replace(/\s/g, "")}`}
              className="rounded-md border-2 border-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-brand)]"
            >
              Llamar
            </a>
          )}
          <span className="rounded-md bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white opacity-90">
            Reservar
          </span>
        </div>
      </div>
    </header>
  );
}
