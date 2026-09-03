import { useRef } from "react";
import type { DemoContent } from "./demoTypes";

interface Props {
  content: DemoContent;
}

/** Carrusel simple con scroll-snap nativo — sin dependencias extra. */
export default function DemoGallery({ content }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 16 : track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  return (
    <section id="demo-galeria" className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="font-display text-center text-3xl font-bold text-[var(--color-brand-dark)] sm:text-4xl">
          Galería
        </h2>

        <div className="relative mt-10">
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
          >
            {content.gallery.map((photo, i) => (
              <div
                key={photo.src + i}
                data-card
                className="aspect-[4/3] w-[80%] shrink-0 snap-center overflow-hidden rounded-xl bg-black/5 sm:w-[45%]"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white sm:flex"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Foto siguiente"
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white sm:flex"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
