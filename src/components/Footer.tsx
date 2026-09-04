import type { ReactNode } from "react";
import { content } from "../content";

type SocialKey = keyof typeof content.social;

/** Iconos de redes sociales (trazo simple, heredan el color del texto). */
const SOCIAL_ICONS: Record<SocialKey, ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.5 8.5h2V5.2c-.35-.05-1.54-.15-2.94-.15-2.91 0-4.9 1.78-4.9 5.04v2.66H6.5v3.7h2.66V21h3.7v-4.55h2.77l.44-3.7h-3.21V10.4c0-1.07.29-1.9 1.64-1.9Z"
        fill="currentColor"
      />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16.6 3h-2.9v12.2a2.6 2.6 0 1 1-1.9-2.5v-2.9a5.5 5.5 0 1 0 4.8 5.46V9.1a7.2 7.2 0 0 0 4.2 1.35V7.55A4.3 4.3 0 0 1 16.6 3Z"
        fill="currentColor"
      />
    </svg>
  ),
};

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
            <div className="mt-3 flex gap-3">
              {socialLinks.length === 0 && (
                <span className="text-sm text-white/50">Próximamente</span>
              )}
              {socialLinks.map(([key, href]) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Síguenos en ${key} (se abre en una pestaña nueva)`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <span className="h-[18px] w-[18px]">
                    {SOCIAL_ICONS[key as SocialKey]}
                  </span>
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
