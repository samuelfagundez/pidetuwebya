import type { DemoContent } from "./demoTypes";

interface Props {
  content: DemoContent;
}

export default function DemoFooter({ content }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-brand-dark)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="font-display text-lg font-bold">{content.name}</p>
            <p className="mt-2 text-sm text-white/80">{content.tagline}</p>
          </div>
          <div>
            <p className="font-semibold">Contacto</p>
            <p className="mt-2 text-sm text-white/80">{content.address}</p>
            {content.phone && (
              <p className="text-sm text-white/80">{content.phone}</p>
            )}
            {content.email && (
              <p className="text-sm text-white/80">{content.email}</p>
            )}
          </div>
        </div>
        <p className="mt-8 border-t border-white/10 pt-6 text-xs text-white/60">
          © {year} {content.name}. Sitio de muestra generado por
          PideTuWebYa — todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
