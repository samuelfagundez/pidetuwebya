import { content } from "../content";

export default function Footer() {
  const year = new Date().getFullYear();
  const socialLinks = Object.entries(content.social).filter(([, v]) => v);

  return (
    <footer id="contacto" className="bg-[var(--color-brand-dark)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg font-bold">{content.name}</p>
            <p className="mt-2 text-sm text-white/80">{content.tagline}</p>
          </div>
          <div>
            <p className="font-semibold">Contacto</p>
            {content.phone ? (
              <p className="mt-2 text-sm text-white/80">
                <a href={`tel:${content.phone.replace(/\s/g, "")}`}>
                  {content.phoneDisplay}
                </a>
              </p>
            ) : (
              <p className="mt-2 text-sm text-white/50">
                Teléfono pendiente
              </p>
            )}
            {content.email ? (
              <p className="text-sm text-white/80">
                <a href={`mailto:${content.email}`}>{content.email}</a>
              </p>
            ) : (
              <p className="text-sm text-white/50">Correo pendiente</p>
            )}
          </div>
          <div>
            <p className="font-semibold">Síguenos</p>
            <div className="mt-2 flex gap-4 text-sm text-white/80">
              {socialLinks.length === 0 && (
                <span className="text-white/50">Próximamente</span>
              )}
              {socialLinks.map(([key, href]) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="capitalize hover:text-white"
                >
                  {key}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-8 border-t border-white/10 pt-6 text-xs text-white/60">
          © {year} {content.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
