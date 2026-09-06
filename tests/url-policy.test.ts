import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { evaluateUrlPolicy } from "../src/Infrastructure/Services/Url/UrlPolicy";
import { isPublicIpAddress } from "../src/Infrastructure/Services/Url/IpPolicy";

function reject(raw: string): string {
  const result = evaluateUrlPolicy(raw);
  assert.equal(result.ok, false, `expected ${raw} to be rejected`);
  return (result as { ok: false; reason: string }).reason;
}

function allow(raw: string): URL {
  const result = evaluateUrlPolicy(raw);
  assert.equal(result.ok, true, `expected ${raw} to be allowed`);
  return (result as { ok: true; url: URL }).url;
}

describe("URL policy — loopback and unspecified", () => {
  it("rejects localhost by name and by address", () => {
    for (const url of [
      "http://localhost",
      "http://localhost:80/",
      "http://LOCALHOST/",
      "http://foo.localhost",
      "http://127.0.0.1",
      "http://127.1.2.3",
      "http://0.0.0.0",
    ]) {
      assert.equal(reject(url), "blocked_host", url);
    }
  });
});

describe("URL policy — private and non-routable IPv4", () => {
  it("rejects RFC1918, link-local and CGNAT", () => {
    for (const url of [
      "http://10.0.0.1",
      "http://10.255.255.255",
      "http://172.16.0.1",
      "http://172.31.255.1",
      "http://192.168.1.1",
      // The cloud metadata endpoint — the single most valuable SSRF target.
      "http://169.254.169.254",
      "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
      "http://100.64.0.1",
      "http://255.255.255.255",
      "http://224.0.0.1",
    ]) {
      assert.equal(reject(url), "blocked_host", url);
    }
  });

  it("allows genuinely public IPv4 literals", () => {
    assert.ok(allow("http://8.8.8.8"));
    assert.ok(allow("https://1.1.1.1"));
  });
});

describe("URL policy — IPv6", () => {
  it("rejects loopback, unspecified, link-local, ULA and multicast", () => {
    for (const url of [
      "http://[::1]",
      "http://[::]",
      "http://[fe80::1]",
      "http://[fc00::1]",
      "http://[fd12:3456:789a::1]",
      "http://[ff02::1]",
    ]) {
      assert.equal(reject(url), "blocked_host", url);
    }
  });

  it("rejects IPv4-mapped private addresses rather than trusting the notation", () => {
    for (const url of ["http://[::ffff:127.0.0.1]", "http://[::ffff:10.0.0.1]", "http://[::ffff:192.168.0.1]"]) {
      assert.equal(reject(url), "blocked_host", url);
    }
  });

  it("allows public IPv6", () => {
    assert.ok(allow("https://[2606:4700:4700::1111]"));
  });
});

describe("URL policy — scheme, credentials and ports", () => {
  it("allows only http and https", () => {
    for (const url of [
      "ftp://example.com",
      "file:///etc/passwd",
      "gopher://example.com",
      "data:text/html,x",
      "javascript:alert(1)",
    ]) {
      assert.equal(reject(url), "unsupported_scheme", url);
    }
  });

  it("rejects embedded credentials", () => {
    assert.equal(reject("http://user:pass@example.com"), "credentials_in_url");
    assert.equal(reject("https://admin@example.com/"), "credentials_in_url");
  });

  it("rejects non-standard ports", () => {
    for (const url of ["http://example.com:8080", "https://example.com:22", "http://example.com:3000"]) {
      assert.equal(reject(url), "unsupported_port", url);
    }
  });

  it("allows default and explicit standard ports", () => {
    assert.ok(allow("http://example.com:80/"));
    assert.ok(allow("https://example.com:443/"));
    assert.ok(allow("https://example.com/"));
  });
});

describe("URL policy — internal-looking hostnames", () => {
  it("rejects non-public name suffixes and bare hostnames", () => {
    for (const url of [
      "http://printer.local",
      "http://api.internal",
      "http://wiki.intranet",
      "http://nas.lan",
      "http://router.home.arpa",
      "http://intranet",
      "http://db",
    ]) {
      assert.equal(reject(url), "blocked_host", url);
    }
  });

  it("does not over-match legitimate public hostnames", () => {
    // Suffix matching is on a label boundary, so these must survive.
    for (const url of ["https://notlocalhost.com", "https://mylocal.dev", "https://internal-tools.example.com"]) {
      assert.ok(allow(url), url);
    }
  });

  it("normalizes a bare domain to https", () => {
    assert.equal(allow("example.com").toString(), "https://example.com/");
  });

  it("rejects unparseable input", () => {
    assert.equal(reject(""), "invalid_url");
    assert.equal(reject("   "), "invalid_url");
  });
});

describe("IP classification", () => {
  it("permits only globally routable unicast addresses", () => {
    assert.equal(isPublicIpAddress("8.8.8.8"), true);
    assert.equal(isPublicIpAddress("2606:4700:4700::1111"), true);

    for (const address of [
      "127.0.0.1", "10.0.0.1", "172.16.0.1", "192.168.1.1",
      "169.254.169.254", "100.64.0.1", "0.0.0.0", "224.0.0.1",
      "::1", "::", "fe80::1", "fc00::1", "ff02::1", "::ffff:10.0.0.1",
    ]) {
      assert.equal(isPublicIpAddress(address), false, address);
    }
  });

  it("rejects values that are not addresses at all", () => {
    assert.equal(isPublicIpAddress("not-an-ip"), false);
    assert.equal(isPublicIpAddress(""), false);
  });
});
