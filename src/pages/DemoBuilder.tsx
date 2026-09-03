import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { buildDemoContent } from "../demo/demoContent";
import type { DemoContent } from "../demo/demoTypes";
import DemoHeader from "../demo/DemoHeader";
import DemoHero from "../demo/DemoHero";
import DemoAbout from "../demo/DemoAbout";
import DemoGallery from "../demo/DemoGallery";
import DemoHours from "../demo/DemoHours";
import DemoFooter from "../demo/DemoFooter";
import CustomizePanel from "../demo/CustomizePanel";
import { getLastLead } from "../lib/storage";

interface LeadState {
  companyName: string;
  phone: string;
  email: string;
}

function readLeadFromLocation(state: unknown): LeadState | null {
  if (
    state &&
    typeof state === "object" &&
    "companyName" in state &&
    typeof (state as LeadState).companyName === "string" &&
    (state as LeadState).companyName.trim()
  ) {
    const s = state as LeadState;
    return { companyName: s.companyName, phone: s.phone ?? "", email: s.email ?? "" };
  }
  return null;
}

/**
 * Página del botón "Pide tu web ya": genera una web de muestra con
 * estructura y estilo casi idénticos al sitio real de referencia ("punk"),
 * pero con el nombre de la empresa del cliente y contenido moqueado.
 * Incluye el panel de personalización (Formulario 2).
 */
export default function DemoBuilder() {
  const location = useLocation();
  const navigate = useNavigate();

  // El lead llega por navigate(state) desde el Formulario 1. Si el usuario
  // recarga la página o entra directo por URL, se recupera el último lead
  // guardado en localStorage; si no hay ninguno, se manda de vuelta al
  // inicio para que rellene el formulario.
  const lead = useMemo<LeadState | null>(() => {
    const fromNav = readLeadFromLocation(location.state);
    if (fromNav) return fromNav;

    const stored = getLastLead();
    if (stored?.companyName) {
      return {
        companyName: stored.companyName,
        phone: typeof stored.phone === "string" ? stored.phone : "",
        email: typeof stored.email === "string" ? stored.email : "",
      };
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lead) {
      navigate("/", { replace: true, state: { autoOpenLead: true } });
    }
  }, [lead, navigate]);

  const [applied, setApplied] = useState<DemoContent | null>(() =>
    lead ? buildDemoContent(lead.companyName, lead.phone, lead.email) : null,
  );

  if (!lead || !applied) return null;

  const themeVars = {
    "--color-brand": applied.primaryColor,
    "--color-brand-dark": applied.secondaryColor,
  } as CSSProperties;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-[70] flex flex-wrap items-center justify-between gap-2 bg-black px-4 py-2 text-xs text-white sm:text-sm">
        <span>
          🔧 Vista previa de <strong>{applied.name}</strong> — este
          contenido es de muestra.
        </span>
        <Link
          to="/"
          className="underline underline-offset-2 hover:text-white/80"
        >
          ← Volver a PideTuWebYa
        </Link>
      </div>

      <div style={themeVars}>
        <DemoHeader content={applied} />
        <DemoHero content={applied} />
        {applied.sections.about && <DemoAbout content={applied} />}
        {applied.sections.gallery && <DemoGallery content={applied} />}
        {applied.sections.hours && <DemoHours content={applied} />}
        <DemoFooter content={applied} />
      </div>

      <CustomizePanel lead={lead} base={applied} onApply={setApplied} />
    </div>
  );
}
