export function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

export async function toJpegIfHeic(file: File): Promise<File> {
  if (!isHeic(file)) return file;

  const { heicTo } = await import("heic-to");
  const blob = await heicTo({
    blob: file,
    type: "image/jpeg",
    quality: 0.92,
  });

  const name = file.name.replace(/\.(heic|heif)$/i, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}
