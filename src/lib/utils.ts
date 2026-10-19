import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// `text-total` é tamanho do tema; sem isso o tailwind-merge o trata como cor e o descarta.
const twMerge = extendTailwindMerge({ extend: { theme: { text: ["total"] } } });

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
