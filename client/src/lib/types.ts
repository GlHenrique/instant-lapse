export interface Frame {
  id: string;
  file: File;
  url: string;
  thumbUrl: string;
  duration: number;
}

export type ResolutionKey = "720p" | "1080p" | "square" | "vertical";

export const RESOLUTION_META: Record<
  ResolutionKey,
  { aspectLabel: string; w: number; h: number; aspect: number }
> = {
  "720p": { aspectLabel: "16:9", w: 1280, h: 720, aspect: 16 / 9 },
  "1080p": { aspectLabel: "16:9", w: 1920, h: 1080, aspect: 16 / 9 },
  square: { aspectLabel: "1:1", w: 1080, h: 1080, aspect: 1 },
  vertical: { aspectLabel: "9:16", w: 1080, h: 1920, aspect: 9 / 16 },
};
