import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to conditionally merge Tailwind CSS classes.
 * Compatible with custom components and future shadcn/ui integration.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
