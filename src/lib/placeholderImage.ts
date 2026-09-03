/**
 * Genera una imagen de muestra (SVG como data URI) para usar mientras no
 * hay fotos reales: fondo de color + etiqueta de texto centrada. No
 * requiere red ni assets — se genera 100% en el cliente.
 */
const PALETTE = ["#6D5EF0", "#241F4E", "#F2B134", "#128C4A", "#3E3F5B"];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function placeholderImage(
  label: string,
  seedIndex = 0,
  width = 800,
  height = 600,
): string {
  const bg = PALETTE[seedIndex % PALETTE.length];
  const fontSize = Math.round(width / 18);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="${bg}"/>
    <text x="50%" y="50%" font-family="Inter, system-ui, sans-serif" font-size="${fontSize}" font-weight="600" fill="#ffffff" fill-opacity="0.92" text-anchor="middle" dominant-baseline="middle">${escapeXml(label)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Iniciales para un avatar de muestra (máx. 2 letras). */
export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}
