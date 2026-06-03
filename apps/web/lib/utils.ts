import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSkeletonKeys(
  length: number,
  prefix = "skeleton"
): string[] {
  return Array.from({ length }, (_, i) => `${prefix}-${i}`);
}
