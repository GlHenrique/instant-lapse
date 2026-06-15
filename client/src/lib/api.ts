import type { Frame, ResolutionKey } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export interface Limits {
  maxFiles: number;
  maxFileSizeMb: number;
}

export const DEFAULT_LIMITS: Limits = { maxFiles: 1000, maxFileSizeMb: 30 };

export async function fetchLimits(): Promise<Limits> {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) return DEFAULT_LIMITS;
    const data = await res.json();
    return {
      maxFiles: Number(data?.maxFiles) || DEFAULT_LIMITS.maxFiles,
      maxFileSizeMb: Number(data?.maxFileSizeMb) || DEFAULT_LIMITS.maxFileSizeMb,
    };
  } catch {
    return DEFAULT_LIMITS;
  }
}

export async function renderTimelapse(
  frames: Frame[],
  fps: number,
  resolution: ResolutionKey
): Promise<Blob> {
  const fd = new FormData();
  frames.forEach((f, i) => {
    const ext = f.file.name.split(".").pop()?.toLowerCase() || "png";
    fd.append("frames", f.file, `${String(i).padStart(5, "0")}.${ext}`);
  });
  fd.append("durations", JSON.stringify(frames.map((f) => f.duration)));
  fd.append("fps", String(fps));
  fd.append("resolution", resolution);

  const res = await fetch(`${API_BASE}/api/render`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    let message = "Falha ao gerar o vídeo.";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      message = "Falha ao gerar o vídeo.";
    }
    throw new Error(message);
  }

  return await res.blob();
}
