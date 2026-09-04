import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface Suggestion {
  display_name: string;
}

const MIN_CHARS = 3;
const DEBOUNCE_MS = 400;

/**
 * Autocompletado de direcciones sin API key ni cuenta de pago: usa el
 * buscador público de OpenStreetMap (Nominatim). No es tan completo como
 * el autocompletado de Google Places (que exige facturación habilitada en
 * Google Cloud), pero cubre bien direcciones reales sin costo ni
 * configuración — coherente con el resto del proyecto (Resend, el Worker
 * de Cloudflare: todo en niveles gratuitos, sin tarjeta).
 */
export default function AddressAutocomplete({
  id,
  value,
  onChange,
  placeholder,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Limpia el timeout pendiente si el componente se desmonta a mitad de
    // la espera del debounce (evita setState en un componente ya fuera).
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    onChange(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (next.trim().length < MIN_CHARS) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(next)}`,
        );
        if (!res.ok) throw new Error("bad response");
        const data = (await res.json()) as Suggestion[];
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        // Sin conexión, servicio caído, etc. — el cliente igual puede
        // seguir escribiendo la dirección a mano, no bloquea nada.
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }

  function selectSuggestion(s: Suggestion) {
    onChange(s.display_name);
    setOpen(false);
    setSuggestions([]);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoComplete="off"
        className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        placeholder={placeholder}
      />
      {loading && (
        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-black/30">
          Buscando…
        </span>
      )}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-black/15 bg-white text-sm shadow-lg">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => selectSuggestion(s)}
                className="block w-full px-3 py-2.5 text-left leading-snug hover:bg-black/5"
              >
                {s.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
