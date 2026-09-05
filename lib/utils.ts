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
 * Produces the single canonical form of an audited URL that gets persisted, so
 * "example.com", "https://example.com" and "https://EXAMPLE.com/" don't become
 * three different rows.
 *
 * Deliberately conservative: the scheme, path, query and fragment are left
 * exactly as given, because those change what page is actually fetched. Only
 * unambiguously case-insensitive or redundant parts are normalized — the host
 * is lowercased, a default port is dropped, and a bare origin gets its root
 * "/" path from the URL parser.
 *
 * Returns null when the input is not a usable URL.
 */
export function normalizeAuditUrl(val: string): string | null {
  const trimmed = val.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (!url.hostname.includes(".")) return null;
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  // The URL parser already lowercases the host and drops the default port.
  return url.toString();
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

