import { supabase } from "./supabaseClient";

const BUCKET_NAME = "por-mini";

export async function uploadPhoto(file, nombre, carpeta) {
  if (!file || !nombre || !carpeta) {
    console.warn("⚠️ Faltan parámetros para subir la imagen.");
    return null;
  }

  try {
    const ext = file.name.split(".").pop();
    const safeNombre = nombre.replace(/\s+/g, "_");
    const filePath = `${carpeta}/${safeNombre}_${Date.now()}.${ext}`;

    console.log("📤 Subiendo imagen...");
    console.log("📁 Carpeta:", carpeta);
    console.log("📂 Ruta generada:", filePath);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("❌ Error subiendo imagen:", error.message);
    return null;
  }
}

export async function deletePhoto(url) {
  if (!url) {
    console.warn("⚠️ No se proporcionó URL para eliminar.");
    return false;
  }

  try {
    const parts = url.split("/");
    const filePath = parts.slice(parts.indexOf("por-mini") + 1).join("/");

    console.log("🗑 Eliminando imagen:", filePath);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("❌ Error eliminando imagen:", error.message);
    return false;
  }
}
