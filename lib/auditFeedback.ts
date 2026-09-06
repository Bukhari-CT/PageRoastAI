import type { RoastActionResult } from "@/app/actions/roast.actions";

/** Key for the URL a guest typed before being asked to sign in. */
const PENDING_AUDIT_KEY = "pageroast_pending_audit";

/**
 * Remembers the URL a signed-out visitor entered so it can be offered back
 * after they authenticate.
 *
 * Session storage rather than a guest session or a database row: it is a single
 * URL the user just typed, it is scoped to their tab, and it disappears on its
 * own. Nothing is audited or stored server-side until they are signed in.
 */
export function storePendingAuditUrl(url: string): void {
  try {
    sessionStorage.setItem(PENDING_AUDIT_KEY, url);
  } catch {
    // Private mode or blocked storage — carrying the URL is a nicety, not a
    // requirement, so losing it is fine.
  }
}

/** Reads and clears the pending URL, so it is only ever offered once. */
export function takePendingAuditUrl(): string | null {
  try {
    const value = sessionStorage.getItem(PENDING_AUDIT_KEY);
    if (value) sessionStorage.removeItem(PENDING_AUDIT_KEY);
    return value;
  } catch {
    return null;
  }
}

type FailureStatus = Exclude<RoastActionResult["status"], "success" | "auth_required">;

/**
 * User-facing copy for each failure category.
 *
 * Friendly and non-technical on purpose: the server already logged the detail,
 * and nothing here reveals a resolved address, a provider response or a
 * database error.
 */
const MESSAGES: Record<FailureStatus, string> = {
  invalid_url: "Enter a valid URL (e.g. https://example.com)",
  unsupported_url:
    "We can only audit public web pages over http or https on standard ports.",
  limit_reached: "You've used your audits for now.",
  audit_in_progress: "You already have an audit running — give it a moment.",
  page_unreachable: "Couldn't load that page — check the URL and try again.",
  unsupported_content: "That URL didn't return a web page we can audit.",
  analysis_failed: "We couldn't finish the analysis. Please try again.",
  persistence_failed: "We couldn't save your audit. Please try again in a moment.",
};

export function auditFailureMessage(status: FailureStatus): string {
  return MESSAGES[status] ?? "Something went wrong. Please try again.";
}
