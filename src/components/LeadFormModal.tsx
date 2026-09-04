import { useState } from "react";
import type { FormEvent } from "react";
import Modal from "./Modal";
import { useLeadModal } from "../context/useLeadModal";
import { sendLeadCapturedEmail } from "../lib/mailer";
import { saveLeadLocally } from "../lib/storage";

/**
 * Formulario 1 — "Pide tu web ya": pide el nombre de la empresa, el
 * teléfono y el correo de contacto (los tres son obligatorios). Al enviar:
 *  1. Se guarda el lead en localStorage (respaldo sin backend).
 *  2. Se dispara un correo a nosotros vía el Worker de correo (mailer.ts).
 *  3. Se abre /pide-tu-web en una pestaña nueva, con los datos del lead
 *     como parámetros de la URL (no por router state, para que la nueva
 *     pestaña — que no comparte el historial de navegación — pueda leerlos
 *     igual), donde se genera la vista previa de la web con el nombre de
 *     la empresa.
 */
export default function LeadFormModal() {
  const { isOpen, close } = useLeadModal();

  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function resetForm() {
    setCompanyName("");
    setPhone("");
    setEmail("");
    setError(null);
    setSending(false);
  }

  function handleClose() {
    setError(null);
    close();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!companyName.trim()) {
      setError("Cuéntanos el nombre de tu empresa para continuar.");
      return;
    }
    if (!phone.trim()) {
      setError("El teléfono es obligatorio para poder contactarte.");
      return;
    }
    if (!email.trim()) {
      setError("El correo es obligatorio para poder contactarte.");
      return;
    }

    setError(null);
    setSending(true);

    const lead = {
      companyName: companyName.trim(),
      phone: phone.trim(),
      email: email.trim(),
    };

    saveLeadLocally({ type: "lead_captured", ...lead });

    // El envío no bloquea la apertura de la pestaña: si el Worker no está
    // configurado o falla, el lead ya quedó guardado localmente.
    // "name"/"email"/"title" alimentan From Name / Reply To / Subject del
    // Worker/Resend; "message" es el cuerpo con el detalle completo.
    void sendLeadCapturedEmail({
      name: lead.companyName,
      email: lead.email,
      title: `🌐 Nuevo lead: ${lead.companyName} — Pide tu web ya`,
      message: [
        "Nueva solicitud desde el Formulario 1 (Pide tu web ya):",
        `Empresa: ${lead.companyName}`,
        `Teléfono: ${lead.phone}`,
        `Correo: ${lead.email}`,
      ].join("\n"),
    });

    const params = new URLSearchParams({
      company: lead.companyName,
      phone: lead.phone,
      email: lead.email,
    });
    window.open(`/pide-tu-web?${params.toString()}`, "_blank", "noopener,noreferrer");

    setSending(false);
    close();
    resetForm();
  }

  return (
    <Modal open={isOpen} onClose={handleClose} titleId="lead-form-title">
      <h2 id="lead-form-title" className="section-title text-2xl">
        ¡Pide tu web ya!
      </h2>
      <p className="mt-2 text-sm text-[var(--color-ink)]/70">
        Dinos el nombre de tu empresa y te mostramos al instante cómo podría
        lucir tu nueva página web (se abre en una pestaña nueva).
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium">
            Nombre de tu empresa *
          </label>
          <input
            id="companyName"
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 focus:border-[var(--color-brand)] focus:outline-none"
            placeholder="Ej. Barbería Central"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Teléfono / WhatsApp *
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 focus:border-[var(--color-brand)] focus:outline-none"
            placeholder="Ej. 600 000 000"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Correo electrónico *
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 focus:border-[var(--color-brand)] focus:outline-none"
            placeholder="Ej. tu@empresa.com"
          />
        </div>

        <p className="text-xs text-[var(--color-ink)]/50">
          * Todos los campos son obligatorios.
        </p>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="btn-accent flex-1"
            disabled={sending}
          >
            {sending ? "Enviando..." : "Ver mi web de muestra"}
          </button>
          <button type="button" className="btn-secondary" onClick={handleClose}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
