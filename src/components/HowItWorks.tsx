import { useLeadModal } from "../context/useLeadModal";

const STEPS = [
  {
    number: "1",
    title: "Pide tu web ya",
    description:
      "Dinos el nombre de tu empresa y un teléfono o correo de contacto. En segundos generamos una vista previa con tu nombre.",
  },
  {
    number: "2",
    title: "Personalízala",
    description:
      "Elige tus colores principales, súbenos una foto de portada y hasta 4 imágenes para el carrusel, y elige qué secciones mostrar.",
  },
  {
    number: "3",
    title: "Solicítala",
    description:
      "Pulsa \"Solicitar web ya\" y nuestro equipo se pondrá en contacto contigo para afinar los últimos detalles y publicarla.",
  },
];

export default function HowItWorks() {
  const { open } = useLeadModal();

  return (
    <section id="como-funciona" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <h2 className="section-title text-center">Cómo funciona</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--color-ink)]/70">
        De la idea a una vista previa de tu web en menos de un minuto, sin
        compromiso.
      </p>

      <ol className="mt-12 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step) => (
          <li
            key={step.number}
            className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)] font-display text-lg font-bold text-white">
              {step.number}
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-[var(--color-brand-dark)]">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-ink)]/70">
              {step.description}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-10 text-center">
        <button type="button" onClick={open} className="btn-accent">
          Pide tu web ya
        </button>
      </div>
    </section>
  );
}
