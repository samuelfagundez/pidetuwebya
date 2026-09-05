import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import FloatingInstagram from "../components/FloatingInstagram";
import LeadFormModal from "../components/LeadFormModal";
import { LeadModalProvider } from "../context/LeadModalContext";
import { useLeadModal } from "../context/useLeadModal";

interface HomeLocationState {
  autoOpenLead?: boolean;
}

/** Si /pide-tu-web nos manda de vuelta sin datos, reabrimos el modal. */
function AutoOpenLeadModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const { open } = useLeadModal();

  useEffect(() => {
    const state = location.state as HomeLocationState | null;
    if (state?.autoOpenLead) {
      open();
      // Limpia el state para no reabrir el modal en cada re-render/back.
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  return null;
}

export default function MarketingLayout() {
  return (
    <LeadModalProvider>
      <div className="flex min-h-dvh flex-col">
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <AutoOpenLeadModal />
        <Header />
        <main id="contenido" className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <FloatingInstagram />
        <FloatingWhatsApp />
        <LeadFormModal />
      </div>
    </LeadModalProvider>
  );
}
