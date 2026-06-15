import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSeconds(s: number): string {
  if (s < 1) return `${Math.round(s * 1000)}ms`;
  return `${s.toFixed(s % 1 === 0 ? 0 : 2)}s`;
}
