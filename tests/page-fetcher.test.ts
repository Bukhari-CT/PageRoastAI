import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { describe, it } from "node:test";

import {
  MAX_RESPONSE_BYTES,
  PageFetchError,
  createPinnedLookup,
  fetchPageText,
  readCappedBody,
  type HttpResponseLike,
  type RequestImpl,
} from "../src/Infrastructure/Services/PageFetcher";
import {
  resolvePublicAddresses,
  type HostResolver,
} from "../src/Infrastructure/Services/Url/DnsGuard";

/** Resolver that maps hostnames to fixed answers, so no real DNS is used. */
function stubResolver(map: Record<string, { v4?: string[]; v6?: string[] }>): HostResolver {
  return {
    async resolve4(hostname) {
      const entry = map[hostname];
      if (!entry?.v4?.length) throw new Error("ENODATA");
      return entry.v4;
    },
    async resolve6(hostname) {
      const entry = map[hostname];
      if (!entry?.v6?.length) throw new Error("ENODATA");
      return entry.v6;
    },
  };
}

function response(options: {
  status?: number;
  headers?: Record<string, string>;
  body?: Buffer | string;
}): HttpResponseLike {
  const stream = Readable.from([
    Buffer.isBuffer(options.body) ? options.body : Buffer.from(options.body ?? ""),
  ]) as unknown as HttpResponseLike;

  stream.statusCode = options.status ?? 200;
  stream.headers = options.headers ?? { "content-type": "text/html" };
  return stream;
}

// ─────────────────────────────────────────────────────────────────────────────

describe("DNS guard", () => {
  it("allows a hostname whose addresses are all public", async () => {
    const result = await resolvePublicAddresses(
      "example.com",
      stubResolver({ "example.com": { v4: ["93.184.216.34"], v6: ["2606:2800:220:1::1"] } })
    );

    assert.equal(result.ok, true);
    assert.deepEqual(
      (result as { ok: true; addresses: string[] }).addresses,
      ["93.184.216.34", "2606:2800:220:1::1"]
    );
  });

  it("rejects when ANY address is private, never cherry-picking the public one", async () => {
    // The split-DNS trick: one good answer alongside one internal answer.
    const result = await resolvePublicAddresses(
      "evil.example",
      stubResolver({ "evil.example": { v4: ["93.184.216.34", "10.0.0.5"] } })
    );

    assert.equal(result.ok, false);
    assert.equal((result as { ok: false; reason: string }).reason, "blocked_host");
  });

  it("rejects an all-private hostname", async () => {
    const result = await resolvePublicAddresses(
      "internal.example",
      stubResolver({ "internal.example": { v4: ["192.168.1.10"] } })
    );
    assert.equal(result.ok, false);
  });

  it("rejects an IPv4-mapped private answer", async () => {
    const result = await resolvePublicAddresses(
      "sneaky.example",
      stubResolver({ "sneaky.example": { v6: ["::ffff:169.254.169.254"] } })
    );
    assert.equal(result.ok, false);
    assert.equal((result as { ok: false; reason: string }).reason, "blocked_host");
  });

  it("reports an unresolvable host distinctly from a blocked one", async () => {
    const result = await resolvePublicAddresses("nowhere.example", stubResolver({}));
    assert.equal(result.ok, false);
    assert.equal((result as { ok: false; reason: string }).reason, "unresolvable");
  });
});

describe("connection pinning", () => {
  it("returns only the validated addresses, never re-resolving the name", async () => {
    const lookup = createPinnedLookup(["93.184.216.34", "2606:2800:220:1::1"]);

    const single = await new Promise<{ address: unknown; family: unknown }>((resolve) => {
      lookup("example.com", {}, (_err, address, family) =>
        resolve({ address, family })
      );
    });
    assert.equal(single.address, "93.184.216.34");
    assert.equal(single.family, 4);

    const all = await new Promise<unknown>((resolve) => {
      lookup("example.com", { all: true }, (_err, addresses) => resolve(addresses));
    });
    assert.deepEqual(all, [
      { address: "93.184.216.34", family: 4 },
      { address: "2606:2800:220:1::1", family: 6 },
    ]);
  });

  it("honours a requested address family", async () => {
    const lookup = createPinnedLookup(["93.184.216.34", "2606:2800:220:1::1"]);
    const v6 = await new Promise<unknown>((resolve) => {
      lookup("example.com", { family: 6, all: true }, (_err, addresses) => resolve(addresses));
    });
    assert.deepEqual(v6, [{ address: "2606:2800:220:1::1", family: 6 }]);
  });
});

describe("response body cap", () => {
  it("stops reading and destroys the stream once the cap is reached", async () => {
    let destroyed = false;
    let bytesProduced = 0;

    // Ten times the cap, produced lazily so we can prove the rest is never read.
    const stream = new Readable({
      read() {
        if (bytesProduced >= MAX_RESPONSE_BYTES * 10) return this.push(null);
        const chunk = Buffer.alloc(64 * 1024, "a");
        bytesProduced += chunk.length;
        this.push(chunk);
      },
    }) as unknown as HttpResponseLike;
    stream.statusCode = 200;
    stream.headers = { "content-type": "text/html" };
    const originalDestroy = (stream as unknown as Readable).destroy.bind(stream);
    stream.destroy = () => {
      destroyed = true;
      originalDestroy();
    };

    const body = await readCappedBody(stream, MAX_RESPONSE_BYTES);

    assert.equal(body.length, MAX_RESPONSE_BYTES, "must buffer exactly the cap");
    assert.equal(destroyed, true, "must cancel the transfer");
    assert.ok(
      bytesProduced < MAX_RESPONSE_BYTES * 10,
      "must not have pulled the whole body"
    );
  });

  it("returns short bodies untouched", async () => {
    const body = await readCappedBody(response({ body: "<html>hi</html>" }), MAX_RESPONSE_BYTES);
    assert.equal(body.toString(), "<html>hi</html>");
  });
});

describe("fetch pipeline", () => {
  const publicDns = stubResolver({
    "example.com": { v4: ["93.184.216.34"] },
    "redirector.example": { v4: ["93.184.216.34"] },
    "internal.example": { v4: ["10.0.0.5"] },
  });

  it("extracts title and text from an HTML response", async () => {
    const requestImpl: RequestImpl = async () =>
      response({ body: "<html><head><title>Hi &amp; bye</title></head><body><p>Some copy</p><script>ignored()</script></body></html>" });

    const page = await fetchPageText("https://example.com", { resolver: publicDns, requestImpl });
    assert.equal(page.title, "Hi & bye");
    assert.ok(page.text.includes("Some copy"));
    assert.ok(!page.text.includes("ignored"), "script contents must be stripped");
    assert.equal(page.finalUrl, "https://example.com/");
  });

  it("blocks a public host that redirects into a private network", async () => {
    // The classic bypass: the first hop passes every check, the second is
    // internal. Validation must run again on the redirect target.
    const requestImpl: RequestImpl = async (url) => {
      if (url.hostname === "redirector.example") {
        return response({ status: 302, headers: { location: "http://internal.example/admin" } });
      }
      throw new Error("must never connect to the redirect target");
    };

    await assert.rejects(
      () => fetchPageText("https://redirector.example", { resolver: publicDns, requestImpl }),
      (error: unknown) => {
        assert.ok(error instanceof PageFetchError);
        assert.equal(error.code, "unsupported_url");
        return true;
      }
    );
  });

  it("blocks a redirect to a private IP literal", async () => {
    const requestImpl: RequestImpl = async (url) => {
      if (url.hostname === "example.com") {
        return response({ status: 301, headers: { location: "http://169.254.169.254/latest/meta-data/" } });
      }
      throw new Error("must never connect to the metadata endpoint");
    };

    await assert.rejects(
      () => fetchPageText("https://example.com", { resolver: publicDns, requestImpl }),
      (error: unknown) => (error as PageFetchError).code === "unsupported_url"
    );
  });

  it("resolves relative redirects against the hop that issued them", async () => {
    const seen: string[] = [];
    const requestImpl: RequestImpl = async (url) => {
      seen.push(url.toString());
      if (url.pathname === "/") {
        return response({ status: 302, headers: { location: "/landing" } });
      }
      return response({ body: "<html><title>Landed</title></html>" });
    };

    const page = await fetchPageText("https://example.com", { resolver: publicDns, requestImpl });
    assert.deepEqual(seen, ["https://example.com/", "https://example.com/landing"]);
    assert.equal(page.title, "Landed");
  });

  it("stops a redirect loop instead of spinning", async () => {
    const requestImpl: RequestImpl = async () =>
      response({ status: 302, headers: { location: "https://example.com/" } });

    await assert.rejects(
      () => fetchPageText("https://example.com", { resolver: publicDns, requestImpl }),
      (error: unknown) => (error as PageFetchError).code === "page_unreachable"
    );
  });

  it("gives up after too many redirects", async () => {
    let hop = 0;
    const requestImpl: RequestImpl = async () => {
      hop += 1;
      return response({ status: 302, headers: { location: `https://example.com/hop-${hop}` } });
    };

    await assert.rejects(
      () => fetchPageText("https://example.com", { resolver: publicDns, requestImpl }),
      (error: unknown) => (error as PageFetchError).code === "page_unreachable"
    );
    assert.ok(hop <= 7, `followed too many hops: ${hop}`);
  });

  it("refuses non-HTML content", async () => {
    const requestImpl: RequestImpl = async () =>
      response({ headers: { "content-type": "application/json" }, body: '{"secret":true}' });

    await assert.rejects(
      () => fetchPageText("https://example.com", { resolver: publicDns, requestImpl }),
      (error: unknown) => (error as PageFetchError).code === "unsupported_content"
    );
  });

  it("accepts an HTML content type with parameters", async () => {
    const requestImpl: RequestImpl = async () =>
      response({ headers: { "content-type": "text/html; charset=UTF-8" }, body: "<title>ok</title>" });

    const page = await fetchPageText("https://example.com", { resolver: publicDns, requestImpl });
    assert.equal(page.title, "ok");
  });

  it("rejects a blocked URL before any request is attempted", async () => {
    let attempted = false;
    const requestImpl: RequestImpl = async () => {
      attempted = true;
      return response({});
    };

    await assert.rejects(() =>
      fetchPageText("http://169.254.169.254/", { resolver: publicDns, requestImpl })
    );
    assert.equal(attempted, false, "policy must reject before the socket layer");
  });

  it("surfaces an origin error status as unreachable", async () => {
    const requestImpl: RequestImpl = async () => response({ status: 500 });
    await assert.rejects(
      () => fetchPageText("https://example.com", { resolver: publicDns, requestImpl }),
      (error: unknown) => (error as PageFetchError).code === "page_unreachable"
    );
  });
});
