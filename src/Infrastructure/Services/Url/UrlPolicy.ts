import { isIpLiteral, isPublicIpAddress } from "./IpPolicy";

export type UrlRejectionReason =
  | "invalid_url"
  | "unsupported_scheme"
  | "credentials_in_url"
  | "unsupported_port"
  | "blocked_host";

export type UrlPolicyResult =
  | { ok: true; url: URL }
  | { ok: false; reason: UrlRejectionReason };

/** Landing pages live on the default web ports; anything else is a smell. */
const ALLOWED_PORTS = new Set(["", "80", "443"]);

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Hostnames that never denote a public site. Matched as exact names or as
 * suffixes on a label boundary, so `notlocalhost.com` is not caught by
 * `localhost` and `evil.com.internal.attacker.net` is not caught by `.internal`.
 */
const BLOCKED_HOST_SUFFIXES = [
  "localhost",
  ".localhost",
  ".local",
  ".internal",
  ".intranet",
  ".lan",
  ".home.arpa",
  ".in-addr.arpa",
  ".ip6.arpa",
];

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");

  for (const suffix of BLOCKED_HOST_SUFFIXES) {
    if (suffix.startsWith(".")) {
      if (host.endsWith(suffix)) return true;
    } else if (host === suffix) {
      return true;
    }
  }

  // A hostname with no dot is a bare local name (`intranet`, `db`, `router`),
  // never a public site. IP literals are handled separately below.
  return !host.includes(".") && !isIpLiteral(host);
}

/**
 * Applies the public-web-only URL policy.
 *
 * This is the cheap, purely local half of SSRF defence: it runs before any DNS
 * query or socket. The other half — resolving the hostname and refusing any
 * non-public address — lives in DnsGuard, and both are re-applied to every
 * redirect hop.
 */
export function evaluateUrlPolicy(raw: string): UrlPolicyResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: "invalid_url" };

  // Only prepend a scheme when the input genuinely lacks one. Testing for a
  // literal "http" prefix instead would turn "ftp://example.com" into
  // "https://ftp://example.com", which parses as the host "ftp" and gets
  // rejected as a blocked host — right outcome, misleading reason, and it would
  // hide the scheme check entirely.
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);

  let url: URL;
  try {
    url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return { ok: false, reason: "unsupported_scheme" };
  }

  // `http://user:pass@internal-host/` is a classic way to smuggle credentials
  // to an internal service, and no public landing page needs them.
  if (url.username || url.password) {
    return { ok: false, reason: "credentials_in_url" };
  }

  if (!ALLOWED_PORTS.has(url.port)) {
    return { ok: false, reason: "unsupported_port" };
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (!hostname) return { ok: false, reason: "invalid_url" };

  if (isIpLiteral(hostname)) {
    // A literal address skips DNS entirely, so judge it here.
    return isPublicIpAddress(hostname)
      ? { ok: true, url }
      : { ok: false, reason: "blocked_host" };
  }

  if (isBlockedHostname(hostname)) {
    return { ok: false, reason: "blocked_host" };
  }

  return { ok: true, url };
}
