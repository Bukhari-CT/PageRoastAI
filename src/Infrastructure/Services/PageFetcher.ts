import 'server-only';

const FETCH_TIMEOUT_MS = 10_000;
const MAX_TEXT_LENGTH = 6000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

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

/**
 * Fetches a public URL and extracts a plain-text approximation of its
 * visible content, for feeding into the roast prompt. Deliberately simple
 * (regex-based, no headless browser / DOM parser dependency) — good enough
 * to ground an LLM roast, not a full renderer.
 */
export async function fetchPageText(url: string): Promise<{ title: string; text: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: controller.signal,
      redirect: "follow",
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Timed out fetching ${url}`);
    }
    throw new Error(`Could not reach ${url}: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`${url} responded with status ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    throw new Error(`${url} did not return an HTML page (content-type: ${contentType || "unknown"})`);
  }

  const html = await res.text();
  return { title: extractTitle(html), text: extractText(html) };
}
