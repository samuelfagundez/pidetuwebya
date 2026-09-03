import { Route, Routes } from "react-router-dom";
import MarketingLayout from "./layouts/MarketingLayout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import DemoBuilder from "./pages/DemoBuilder";

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* El generador de la web de muestra vive fuera del layout principal:
          se ve y se comporta como un sitio propio (estilo "punk"), no como
          una sub-página de PideTuWebYa. */}
      <Route path="/pide-tu-web" element={<DemoBuilder />} />
    </Routes>
  );
}
