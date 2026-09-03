// ---------------------------------------------------------------------------
// Respaldo local de leads en localStorage. Esta app no tiene backend, así
// que el correo (EmailJS) es la vía principal para enterarnos de una
// solicitud — este storage es sólo una red de seguridad adicional: si
// EmailJS falla o no está configurado, el lead no se pierde del todo y
// queda disponible en el navegador del propio visitante (localStorage.getItem
// desde la consola: "ptw_leads").
//
// IMPORTANTE: esto NO sustituye un backend/CRM real. Es un parche razonable
// para una landing sin servidor; para un volumen serio de leads conviene
// integrar un backend, hoja de cálculo (Google Sheets API) o CRM.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "ptw_leads";

export interface LeadEntry {
  type: "lead_captured" | "web_request";
  companyName: string;
  phone?: string;
  email?: string;
  [key: string]: unknown;
}

export function saveLeadLocally(entry: LeadEntry): void {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: LeadEntry[] = raw ? JSON.parse(raw) : [];
    list.push({ ...entry, capturedAt: new Date().toISOString() });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // localStorage no disponible (modo privado, cuota llena, etc.) — no es
    // crítico, el correo sigue siendo la vía principal de aviso.
  }
}

export function getLastLead(): LeadEntry | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const list: LeadEntry[] = JSON.parse(raw);
    return list.length > 0 ? (list[list.length - 1] ?? null) : null;
  } catch {
    return null;
  }
}
