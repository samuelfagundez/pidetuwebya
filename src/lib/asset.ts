/**
 * Resuelve una ruta de /public (p. ej. "/team/ana.jpg") contra el base path
 * real del sitio. En GitHub Pages de proyecto el sitio vive en
 * "/<repo>/", así que una ruta absoluta escrita a mano ("/team/...")
 * apuntaría por error a la raíz del dominio si no se pasa por aquí.
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base + path;
}
