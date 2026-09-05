import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { buildDemoContent } from "../demo/demoContent";
import type { DemoContent } from "../demo/demoTypes";
import DemoHeader from "../demo/DemoHeader";
import DemoHero from "../demo/DemoHero";
import DemoAbout from "../demo/DemoAbout";
import DemoGallery from "../demo/DemoGallery";
import DemoHours from "../demo/DemoHours";
import DemoLocation from "../demo/DemoLocation";
import DemoFooter from "../demo/DemoFooter";
import CustomizePanel from "../demo/CustomizePanel";
import { getLastLead } from "../lib/storage";

interface LeadState {
  companyName: string;
  phone: string;
  email: string;
}

/**
 * Página del botón "Pide tu web ya": genera una web de muestra con
 * estructura y estilo casi idénticos al sitio real de referencia ("punk"),
 * pero con el nombre de la empresa del cliente y contenido moqueado.
 * Incluye el panel de personalización (Formulario 2).
 */
export default function DemoBuilder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // El lead llega por parámetros de la URL (?company=&phone=&email=) desde
  // el Formulario 1, que ahora abre esta página en una pestaña nueva — una
  // pestaña nueva no comparte el historial/state de React Router con la
  // que la abrió, así que la URL es la única forma confiable de pasar los
  // datos. Si el usuario entra sin esos parámetros (por ejemplo, recarga
  // tras haberlos perdido de algún modo), se recupera el último lead
  // guardado en localStorage; si tampoco hay nada, se manda al inicio.
  const lead = useMemo<LeadState | null>(() => {
    const company = searchParams.get("company");
    if (company && company.trim()) {
      return {
        companyName: company,
        phone: searchParams.get("phone") ?? "",
        email: searchParams.get("email") ?? "",
      };
    }

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

  // Refuerzo contra el salto de scroll al abrir la pestaña nueva en
  // móvil: "instant" ignora el scroll-behavior:smooth global, así que
  // esto no se ve como una animación — es solo asegurar que arranca en 0.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const [applied, setApplied] = useState<DemoContent | null>(() =>
    lead ? buildDemoContent(lead.companyName, lead.phone, lead.email) : null,
  );

  if (!lead || !applied) return null;

  const themeVars = {
    "--color-brand": applied.primaryColor,
    "--color-brand-dark": applied.secondaryColor,
  } as CSSProperties;

  return (
    <div className="min-h-dvh bg-white">
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

      <CustomizePanel lead={lead} base={applied} onApply={setApplied} />

      <div style={themeVars}>
        <DemoHeader content={applied} />
        <DemoHero content={applied} />
        {applied.sections.about && <DemoAbout content={applied} />}
        {applied.sections.gallery && <DemoGallery content={applied} />}
        {applied.sections.hours && <DemoHours content={applied} />}
        {applied.sections.location && <DemoLocation content={applied} />}
        <DemoFooter content={applied} />
      </div>
    </div>
  );
}
