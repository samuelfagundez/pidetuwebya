import { createContext, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";

export interface LeadModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const LeadModalContext = createContext<LeadModalContextValue | null>(
  null,
);

/**
 * Controla la apertura del modal "Pide tu web ya" (Formulario 1). Se
 * consume desde Header y Hero (vía useLeadModal, en ./useLeadModal) para
 * que ambos botones abran el mismo modal.
 */
export function LeadModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(
    () => ({ isOpen, open, close }),
    [isOpen, open, close],
  );

  return (
    <LeadModalContext.Provider value={value}>
      {children}
    </LeadModalContext.Provider>
  );
}
