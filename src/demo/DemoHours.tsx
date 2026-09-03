import type { DemoContent } from "./demoTypes";

interface Props {
  content: DemoContent;
}

export default function DemoHours({ content }: Props) {
  return (
    <section id="demo-horario" className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <h2 className="font-display text-center text-3xl font-bold text-[var(--color-brand-dark)] sm:text-4xl">
        Horario
      </h2>
      <dl className="mt-8 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {content.hours.map((h) => (
          <div
            key={h.day}
            className="flex items-center justify-between px-6 py-3"
          >
            <dt className="font-medium">{h.day}</dt>
            <dd
              className={
                h.hours === "Cerrado" ? "text-black/40" : "text-black/80"
              }
            >
              {h.hours}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
