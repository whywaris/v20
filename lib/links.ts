// Find and classify outbound links in channel/video descriptions. Pure functions, no I/O.

export type LinkKind = "store" | "affiliate" | "link_hub" | "membership" | "social" | "youtube" | "site";
export type FoundLink = { url: string; domain: string; kind: LinkKind; platform: string | null; source: "about" | "description"; count: number };

// domain suffix -> [kind, platform]
const KNOWN: [string, LinkKind, string][] = [
  ["gumroad.com", "store", "Gumroad"], ["stan.store", "store", "Stan"], ["whop.com", "store", "Whop"],
  ["payhip.com", "store", "Payhip"], ["lemonsqueezy.com", "store", "Lemon Squeezy"], ["sellfy.com", "store", "Sellfy"],
  ["etsy.com", "store", "Etsy"], ["myshopify.com", "store", "Shopify"], ["teachable.com", "store", "Teachable"],
  ["kajabi.com", "store", "Kajabi"], ["podia.com", "store", "Podia"], ["thinkific.com", "store", "Thinkific"],
  ["buy.stripe.com", "store", "Stripe"], ["clickbank.net", "affiliate", "ClickBank"], ["hop.clickbank.net", "affiliate", "ClickBank"],
  ["skool.com", "membership", "Skool"], ["patreon.com", "membership", "Patreon"], ["buymeacoffee.com", "membership", "Buy Me a Coffee"],
  ["ko-fi.com", "membership", "Ko-fi"], ["substack.com", "membership", "Substack"],
  ["amzn.to", "affiliate", "Amazon"], ["amazon.com", "affiliate", "Amazon"], ["geni.us", "affiliate", "Geniuslink"],
  ["linktr.ee", "link_hub", "Linktree"], ["beacons.ai", "link_hub", "Beacons"], ["bio.link", "link_hub", "bio.link"],
  ["linkin.bio", "link_hub", "Later"], ["campsite.bio", "link_hub", "Campsite"],
  ["instagram.com", "social", "Instagram"], ["tiktok.com", "social", "TikTok"], ["facebook.com", "social", "Facebook"],
  ["twitter.com", "social", "X"], ["x.com", "social", "X"], ["threads.net", "social", "Threads"], ["pinterest.com", "social", "Pinterest"],
  ["discord.gg", "social", "Discord"], ["discord.com", "social", "Discord"], ["t.me", "social", "Telegram"], ["linkedin.com", "social", "LinkedIn"],
  ["youtube.com", "youtube", "YouTube"], ["youtu.be", "youtube", "YouTube"],
];

export function classify(url: string): Pick<FoundLink, "domain" | "kind" | "platform"> | null {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
  // Amazon affiliate links carry a tag=; plain amazon.com links are still treated as affiliate-ish.
  const hit = KNOWN.find(([d]) => host === d || host.endsWith(`.${d}`));
  return { domain: host, kind: hit?.[1] ?? "site", platform: hit?.[2] ?? null };
}

export function extractUrls(text: string): string[] {
  return [...text.matchAll(/https?:\/\/[^\s<>"')\]]+/gi)].map((m) => m[0].replace(/[.,;:!?]+$/, ""));
}

// Merge links from the About text and recent video descriptions, counting how many descriptions use each domain.
export function collectLinks(about: string, descriptions: string[]): FoundLink[] {
  const byDomain = new Map<string, FoundLink>();
  const add = (url: string, source: FoundLink["source"]) => {
    const c = classify(url);
    if (!c) return;
    const prev = byDomain.get(c.domain);
    if (prev) prev.count += source === "description" ? 1 : 0;
    else byDomain.set(c.domain, { url, ...c, source, count: source === "description" ? 1 : 0 });
  };
  extractUrls(about).forEach((u) => add(u, "about"));
  for (const d of descriptions) new Set(extractUrls(d)).forEach((u) => add(u, "description"));
  return [...byDomain.values()].sort((a, b) => b.count - a.count);
}

// The link the channel pushes viewers to: a store/membership/own site, most-used first.
export function pickLanding(links: FoundLink[]): FoundLink | null {
  const rank: Record<LinkKind, number> = { store: 0, membership: 1, site: 2, link_hub: 3, affiliate: 4, social: 9, youtube: 9 };
  return [...links].filter((l) => rank[l.kind] < 9).sort((a, b) => rank[a.kind] - rank[b.kind] || b.count - a.count)[0] ?? null;
}
