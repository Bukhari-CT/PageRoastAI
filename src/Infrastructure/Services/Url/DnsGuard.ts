import { promises as dns } from "node:dns";

import { isIpLiteral, isPublicIpAddress } from "./IpPolicy";

export type DnsGuardResult =
  | { ok: true; addresses: string[] }
  | { ok: false; reason: "unresolvable" | "blocked_host" };

/**
 * Injectable so tests can drive the resolver without touching real DNS.
 * Each function resolves the relevant record type or rejects.
 */
export interface HostResolver {
  resolve4(hostname: string): Promise<string[]>;
  resolve6(hostname: string): Promise<string[]>;
}

export const systemResolver: HostResolver = {
  resolve4: (hostname) => dns.resolve4(hostname),
  resolve6: (hostname) => dns.resolve6(hostname),
};

/**
 * Resolves every address a hostname points at and permits the request only if
 * **all** of them are public.
 *
 * Two deliberate properties:
 *
 *  - Every A and AAAA record is checked, not the first that happens to work.
 *    Cherry-picking a public answer while a private one exists is exactly the
 *    split-DNS trick this guard is meant to stop.
 *  - The full address set is returned so the caller can pin the connection to
 *    these validated addresses. Validating and then letting the HTTP client
 *    resolve the name again independently would leave a DNS-rebinding window.
 */
export async function resolvePublicAddresses(
  hostname: string,
  resolver: HostResolver = systemResolver
): Promise<DnsGuardResult> {
  const host = hostname.replace(/^\[|\]$/g, "");

  if (isIpLiteral(host)) {
    return isPublicIpAddress(host)
      ? { ok: true, addresses: [host] }
      : { ok: false, reason: "blocked_host" };
  }

  // A record type that does not exist is normal (an IPv4-only host has no
  // AAAA), so a rejection here is not an error — only "no addresses at all" is.
  const [v4, v6] = await Promise.all([
    resolver.resolve4(host).catch(() => [] as string[]),
    resolver.resolve6(host).catch(() => [] as string[]),
  ]);

  const addresses = [...v4, ...v6];
  if (addresses.length === 0) {
    return { ok: false, reason: "unresolvable" };
  }

  // All-or-nothing on purpose.
  if (!addresses.every(isPublicIpAddress)) {
    return { ok: false, reason: "blocked_host" };
  }

  return { ok: true, addresses };
}
