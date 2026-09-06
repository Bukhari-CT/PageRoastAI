import ipaddr from "ipaddr.js";

/**
 * Decides whether an IP address is a globally routable public internet address.
 *
 * Uses ipaddr.js rather than string prefixes: prefix matching gets IPv6 wrong
 * in ways that are easy to miss (`fc00::/7` unique-local, `::ffff:10.0.0.1`
 * IPv4-mapped, 6to4 and Teredo tunnels all look "public" to a naive check).
 *
 * The policy is an allow-list of exactly one classification — `unicast` — so a
 * range ipaddr.js knows about but we have not thought about is rejected by
 * default rather than permitted by default.
 */
export function isPublicIpAddress(address: string): boolean {
  let parsed: ipaddr.IPv4 | ipaddr.IPv6;
  try {
    parsed = ipaddr.parse(address);
  } catch {
    return false;
  }

  return isPublicParsedAddress(parsed);
}

function isPublicParsedAddress(parsed: ipaddr.IPv4 | ipaddr.IPv6): boolean {
  if (parsed.kind() === "ipv6") {
    const v6 = parsed as ipaddr.IPv6;

    // `::ffff:10.0.0.1` is an IPv4 destination wearing an IPv6 shape. Judge the
    // address that will actually be connected to, not its notation.
    if (v6.isIPv4MappedAddress()) {
      return isPublicParsedAddress(v6.toIPv4Address());
    }
  }

  // Everything else — loopback, private, linkLocal, carrierGradeNat,
  // unspecified, broadcast, multicast, uniqueLocal, reserved, 6to4, teredo,
  // rfc6052/rfc6145 translation ranges — is not a public destination.
  return parsed.range() === "unicast";
}

/** True when the string is an IP literal rather than a DNS hostname. */
export function isIpLiteral(host: string): boolean {
  return ipaddr.isValid(host);
}
