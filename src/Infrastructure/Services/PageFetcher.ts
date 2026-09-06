// No "server-only" marker here on purpose: this module imports node:http,
// node:https and node:dns, which Next.js already refuses to bundle into a
// client component, so the guardrail is redundant — and its presence would make
// the SSRF policy untestable outside a React Server Component.
import http, { type IncomingMessage } from "node:http";
import https from "node:https";
import net from "node:net";
import type { LookupAddress, LookupOptions } from "node:dns";

import { evaluateUrlPolicy, type UrlRejectionReason } from "./Url/UrlPolicy";
import {
  resolvePublicAddresses,
  systemResolver,
  type HostResolver,
} from "./Url/DnsGuard";

/**
 * Hard ceiling on decoded response bytes. 256 KB is far more than the ~6 KB of
 * text the prompt uses, while making an unbounded or infinite response
 * (zip-bomb style) a non-event. The socket is destroyed the moment the cap is
 * hit, so the remainder is never transferred, let alone buffered.
 */
export const MAX_RESPONSE_BYTES = 256 * 1024;

/** Extracted text handed to the model. */
export const MAX_TEXT_LENGTH = 6000;

export const MAX_REDIRECTS = 5;

/** Per-hop ceiling, so one slow host cannot stall the whole budget. */
export const HOP_TIMEOUT_MS = 8_000;

/**
 * Ceiling on the entire fetch operation including every redirect. Without it,
 * five hops at the per-hop timeout would compound to 40s and blow the audit's
 * duration budget.
 */
export const TOTAL_FETCH_BUDGET_MS = 15_000;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export type PageFetchErrorCode =
  | "invalid_url"
  | "unsupported_url"
  | "page_unreachable"
  | "unsupported_content";

/**
 * A fetch failure with a category the caller can map to user-facing copy.
 *
 * The message is for server logs only. It never contains resolved IPs — the
 * whole point of the guard is not to hand an attacker a scanning oracle.
 */
export class PageFetchError extends Error {
  constructor(readonly code: PageFetchErrorCode, message: string) {
    super(message);
    this.name = "PageFetchError";
  }
}

function urlPolicyErrorFor(reason: UrlRejectionReason): PageFetchError {
  if (reason === "invalid_url") {
    return new PageFetchError("invalid_url", "URL could not be parsed");
  }
  // Scheme, port, credentials and blocked hosts are all "we will not fetch
  // this", deliberately reported identically so the response cannot be used to
  // probe which internal names or ports exist.
  return new PageFetchError("unsupported_url", `URL rejected by policy: ${reason}`);
}

/**
 * The minimal response surface the fetch loop uses. Narrower than
 * `IncomingMessage` on purpose: tests can supply a readable stream with a
 * status and headers, so redirect handling and the body cap are exercised
 * through the real loop rather than re-implemented in a test double.
 */
export interface HttpResponseLike extends AsyncIterable<Buffer> {
  statusCode?: number;
  headers: Record<string, string | string[] | undefined>;
  destroy(): void;
}

export type RequestImpl = (
  url: URL,
  addresses: string[],
  timeoutMs: number
) => Promise<HttpResponseLike>;

export interface FetchPageDeps {
  resolver?: HostResolver;
  requestImpl?: RequestImpl;
}

export interface FetchedPage {
  title: string;
  text: string;
  /** The URL actually fetched, after any redirects. */
  finalUrl: string;
}

/**
 * Pins the connection to addresses that were already validated as public.
 *
 * This closes the DNS-rebinding gap: validating a hostname and then letting the
 * HTTP client resolve it again means the second lookup can return a private
 * address. Overriding only `lookup` keeps the Host header and the TLS SNI /
 * certificate check pointed at the real hostname, so this weakens nothing about
 * transport security — certificate verification stays fully on.
 */
export function createPinnedLookup(addresses: string[]): net.LookupFunction {
  const entries: LookupAddress[] = addresses.map((address) => ({
    address,
    family: net.isIPv6(address) ? 6 : 4,
  }));

  return (hostname: string, options: LookupOptions, callback) => {
    const wanted =
      options?.family === 4 || options?.family === 6
        ? entries.filter((entry) => entry.family === options.family)
        : entries;

    if (wanted.length === 0) {
      callback(new Error("no validated address available"), "", 4);
      return;
    }

    if (options?.all) {
      callback(null, wanted);
      return;
    }

    callback(null, wanted[0].address, wanted[0].family);
  };
}

function requestOnce(
  url: URL,
  addresses: string[],
  timeoutMs: number
): Promise<IncomingMessage> {
  const transport = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const request = transport.request(
      url,
      {
        method: "GET",
        lookup: createPinnedLookup(addresses),
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
          // Keep the body plain so the size cap counts real bytes rather than
          // compressed ones.
          "Accept-Encoding": "identity",
        },
        // Redirects are handled explicitly by the caller so every hop is
        // re-validated; nothing here may follow one on its own.
        timeout: timeoutMs,
      },
      (response) => resolve(response)
    );

    request.on("timeout", () => {
      request.destroy(new Error("request timed out"));
    });
    request.on("error", reject);
    request.end();
  });
}

/**
 * Reads at most `maxBytes`, then destroys the socket.
 *
 * The previous implementation awaited `response.text()`, which buffers the
 * entire body before any truncation — a large response was an out-of-memory
 * risk regardless of how little text we ultimately used.
 */
export async function readCappedBody(
  response: HttpResponseLike,
  maxBytes: number
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;

  try {
    for await (const chunk of response) {
      const buffer = chunk as Buffer;
      const remaining = maxBytes - total;

      if (buffer.length >= remaining) {
        chunks.push(buffer.subarray(0, remaining));
        total = maxBytes;
        response.destroy();
        break;
      }

      chunks.push(buffer);
      total += buffer.length;
    }
  } catch {
    // Destroying mid-stream surfaces as a premature-close error. We already
    // have everything we intended to read, so this is a normal stop.
  }

  return Buffer.concat(chunks, total);
}

function isHtml(contentType: string | undefined): boolean {
  if (!contentType) return false;
  // Tolerate parameters: "text/html; charset=utf-8".
  const mediaType = contentType.split(";")[0]!.trim().toLowerCase();
  return mediaType === "text/html" || mediaType === "application/xhtml+xml";
}

/**
 * Fetches a public web page and extracts a plain-text approximation of its
 * visible content for the roast prompt.
 *
 * Every hop passes the same gate: URL policy → DNS resolution with all
 * addresses public → connection pinned to those addresses. Redirects are
 * followed manually, capped, and re-validated in full, so a public hostname
 * cannot bounce the request into a private network.
 */
export async function fetchPageText(
  rawUrl: string,
  deps: FetchPageDeps = {}
): Promise<FetchedPage> {
  const resolver = deps.resolver ?? systemResolver;
  const sendRequest = deps.requestImpl ?? requestOnce;
  const deadline = Date.now() + TOTAL_FETCH_BUDGET_MS;
  const visited = new Set<string>();

  let target = rawUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const policy = evaluateUrlPolicy(target);
    if (!policy.ok) throw urlPolicyErrorFor(policy.reason);

    const url = policy.url;
    const key = url.toString();
    if (visited.has(key)) {
      throw new PageFetchError("page_unreachable", "redirect loop detected");
    }
    visited.add(key);

    const dnsResult = await resolvePublicAddresses(url.hostname, resolver);
    if (!dnsResult.ok) {
      throw dnsResult.reason === "unresolvable"
        ? new PageFetchError("page_unreachable", "host could not be resolved")
        : new PageFetchError("unsupported_url", "host resolves to a non-public address");
    }

    const remainingBudget = deadline - Date.now();
    if (remainingBudget <= 0) {
      throw new PageFetchError("page_unreachable", "fetch budget exhausted");
    }

    let response: HttpResponseLike;
    try {
      response = await sendRequest(
        url,
        dnsResult.addresses,
        Math.min(HOP_TIMEOUT_MS, remainingBudget)
      );
    } catch {
      // Never surface the underlying socket/DNS detail to the caller.
      throw new PageFetchError("page_unreachable", "request failed");
    }

    const status = response.statusCode ?? 0;

    if (REDIRECT_STATUSES.has(status)) {
      const rawLocation = response.headers.location;
      const location = Array.isArray(rawLocation) ? rawLocation[0] : rawLocation;
      response.destroy();

      if (!location) {
        throw new PageFetchError("page_unreachable", "redirect without a location");
      }

      // Relative redirects resolve against the hop that issued them; the next
      // loop iteration re-runs the entire policy + DNS gate on the result.
      try {
        target = new URL(location, url).toString();
      } catch {
        throw new PageFetchError("unsupported_url", "redirect target could not be parsed");
      }
      continue;
    }

    if (status < 200 || status >= 300) {
      response.destroy();
      throw new PageFetchError("page_unreachable", `origin responded with status ${status}`);
    }

    const contentType = response.headers["content-type"];
    if (!isHtml(Array.isArray(contentType) ? contentType[0] : contentType)) {
      response.destroy();
      throw new PageFetchError("unsupported_content", "response was not an HTML page");
    }

    const body = await readCappedBody(response, MAX_RESPONSE_BYTES);
    const html = body.toString("utf8");

    return { title: extractTitle(html), text: extractText(html), finalUrl: key };
  }

  throw new PageFetchError("page_unreachable", "too many redirects");
}

// ─── HTML text extraction ────────────────────────────────────────────────────
// Deliberately regex-based: good enough to ground an LLM roast, and avoids a
// DOM-parser dependency in the request path.

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1]).trim() : "";
}

function extractText(html: string): string {
  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const withoutTags = withoutNoise.replace(/<[^>]+>/g, " ");
  const decoded = decodeEntities(withoutTags);
  return decoded.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT_LENGTH);
}

function decodeEntities(str: string): string {
  return str
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
