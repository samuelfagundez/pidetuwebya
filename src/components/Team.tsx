import { content } from "../content";
import { assetUrl } from "../lib/asset";
import { placeholderImage } from "../lib/placeholderImage";

export default function Team() {
  return (
    <section id="equipo" className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="section-title text-center">Nuestro equipo</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--color-ink)]/70">
          Las personas detrás de PideTuWebYa.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {content.team.map((member, i) => (
            <div
              key={member.name + i}
              className="flex flex-col items-center rounded-xl border border-black/5 p-6 text-center shadow-sm"
            >
              <img
                src={
                  member.photo
                    ? assetUrl(member.photo)
                    : placeholderImage(member.name, i, 300, 300)
                }
                alt={`Foto de ${member.name}`}
                loading="lazy"
                className="h-28 w-28 rounded-full object-cover"
                width={112}
                height={112}
              />
              <h3 className="mt-4 font-display text-lg font-bold text-[var(--color-brand-dark)]">
                {member.name}
              </h3>
              <p className="text-sm font-medium text-[var(--color-brand)]">
                {member.role}
              </p>
              <p className="mt-3 text-sm text-[var(--color-ink)]/70">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
