import { useContext } from "react";
import { LeadModalContext } from "./LeadModalContext";

export function useLeadModal() {
  const ctx = useContext(LeadModalContext);
  if (!ctx) {
    throw new Error("useLeadModal debe usarse dentro de <LeadModalProvider>");
  }
  return ctx;
}
