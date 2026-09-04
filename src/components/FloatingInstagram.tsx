import { content } from "../content";

/** Solo se muestra si hay un enlace de Instagram configurado en content.ts. */
export default function FloatingInstagram() {
  if (!content.social.instagram) return null;

  return (
    <a
      href={content.social.instagram}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Síguenos en Instagram"
      className="fixed right-5 bottom-[88px] z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d62976]"
      style={{
        background:
          "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        aria-hidden="true"
      >
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
    </a>
  );
}
