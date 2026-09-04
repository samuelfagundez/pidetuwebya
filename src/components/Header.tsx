import { useState } from "react";
import { content, contactHref } from "../content";
import { useLeadModal } from "../context/useLeadModal";

const NAV = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#equipo", label: "Equipo" },
  { href: "#contacto", label: "Contacto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { open: openLeadModal } = useLeadModal();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[var(--color-paper)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#" className="shrink-0" aria-label={content.name}>
          <img
            src="/brand/logo-horizontal.png"
            alt={content.name}
            className="h-8 w-auto sm:h-9"
          />
        </a>

        <nav className="hidden gap-6 lg:flex" aria-label="Principal">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium whitespace-nowrap text-[var(--color-ink)] transition hover:text-[var(--color-brand)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={openLeadModal}
            className="btn-accent-sm"
          >
            Pide tu web ya
          </button>
          <a
            href={contactHref()}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-whatsapp-sm"
          >
            Contáctanos
          </a>
        </div>

        <button
          type="button"
          className="inline-flex items-center rounded-md p-2 lg:hidden"
          aria-expanded={open}
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-black/5 px-4 pb-4 lg:hidden"
          aria-label="Principal móvil"
        >
          <ul className="flex flex-col gap-3 pt-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block py-1 text-base font-medium"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                className="btn-accent w-full"
                onClick={() => {
                  setOpen(false);
                  openLeadModal();
                }}
              >
                Pide tu web ya
              </button>
              <a
                href={contactHref()}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-whatsapp w-full"
                onClick={() => setOpen(false)}
              >
                Contáctanos
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
