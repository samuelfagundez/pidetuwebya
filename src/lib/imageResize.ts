/**
 * Redimensiona una imagen (File) en el propio navegador vía <canvas> y la
 * devuelve como data URL JPEG. Se usa en vez de leer el archivo tal cual
 * (FileReader.readAsDataURL) por dos razones:
 *
 * 1. Las fotos de cámara/celular reales pueden pesar varios MB cada una.
 *    Leer 4 de esas en simultáneo (Promise.all) podía agotar memoria o
 *    tardar tanto que el usuario creía que "no pasaba nada" — de ahí el
 *    bug de que seleccionar 4 fotos no guardaba ninguna.
 * 2. Ese mismo peso viaja después a localStorage y a los parámetros del
 *    correo (vía el Worker) — reducirlo evita tocar límites ahí también.
 */
const MAX_DIMENSION_BANNER = 1600;
const MAX_DIMENSION_GALLERY = 1400;
const JPEG_QUALITY = 0.85;

/** Límite razonable para una foto de cámara/celular actual (JPEG/HEIC de
 * gama alta ronda 3-6MB; 8MB da margen sin dejar pasar archivos que
 * tardarían demasiado en procesarse en el navegador). */
export const MAX_UPLOAD_SIZE_MB = 8;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export function resizeImageToDataUrl(
  file: File,
  maxDimension: number = MAX_DIMENSION_GALLERY,
  quality: number = JPEG_QUALITY,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error(`No se pudo procesar "${file.name}"`));
        return;
      }
      // Fondo blanco antes de dibujar: si el PNG original tiene
      // transparencia, JPEG no la soporta y quedaría negro sin esto.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`No se pudo leer "${file.name}"`));
    };

    img.src = objectUrl;
  });
}

export const IMAGE_MAX_DIMENSION = {
  banner: MAX_DIMENSION_BANNER,
  gallery: MAX_DIMENSION_GALLERY,
};
