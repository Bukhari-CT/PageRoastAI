import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidUrl(val: string): boolean {
  try {
    const u = new URL(val.startsWith("http") ? val : "https://" + val);
    return u.hostname.includes(".");
  } catch {
    return false;
  }
}

