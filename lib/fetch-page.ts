import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// URLs come from strangers' YouTube descriptions, so never let them reach private/internal addresses (SSRF).
export function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    if (v.startsWith("::ffff:")) return isPrivateIp(v.slice(7));
    return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80");
  }
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

async function assertPublic(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("bad protocol");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const ips = isIP(host) ? [host] : (await lookup(host, { all: true })).map((r) => r.address);
  if (!ips.length || ips.some(isPrivateIp)) throw new Error("private address");
}

// Fetch a public page (max 3 redirects, 8s, 1 MB) and return its HTML, or null on any failure.
// ponytail: DNS is checked before fetch, not pinned; a rebinding attacker could still race it. Acceptable for public store pages.
export async function fetchPublicHtml(raw: string): Promise<{ url: string; html: string } | null> {
  try {
    let url = new URL(raw);
    for (let hop = 0; hop < 4; hop++) {
      await assertPublic(url);
      const res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
        headers: { "user-agent": "Mozilla/5.0 (compatible; NichesLibraryBot/1.0)", accept: "text/html" },
      });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        url = new URL(res.headers.get("location")!, url);
        continue;
      }
      if (!res.ok || !res.headers.get("content-type")?.includes("text/html")) return null;
      const html = (await res.text()).slice(0, 1_000_000);
      return { url: url.toString(), html };
    }
  } catch {
    // unreachable, private or too slow: treat as no page
  }
  return null;
}

export function htmlToText(html: string, max = 6000): string {
  return html
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#36;|&dollar;/g, "$")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
