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

/**
 * Ensures that the callbackUrl is a safe, relative path within the application.
 * Prevents open redirect vulnerabilities by blocking external/absolute URLs.
 */
export function sanitizeCallbackUrl(url?: string | null): string {
    if (!url) return "/dashboard";
    // Must be relative: starts with '/' and NOT with '//'
    if (url.startsWith("/") && !url.startsWith("//")) {
        return url;
    }
    return "/dashboard";
}

