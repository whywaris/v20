// Public site address for canonicals, sitemap and JSON-LD. On Vercel, falls back to the production domain
// Vercel sets automatically, so a missing/blank NEXT_PUBLIC_SITE_URL never ships localhost links.
export const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

// Thin niche pages stay noindex (and out of the sitemap) until they have this many channels.
export const MIN_INDEXABLE = 5;

export const TOOLS = [
  { href: "/tools/youtube-money-calculator", name: "YouTube Money Calculator", blurb: "Estimate earnings from daily views and your niche's RPM." },
  { href: "/tools/niche-finder", name: "YouTube Niche Finder", blurb: "Compare niches by RPM, competition, growth and how many channels sell products." },
  { href: "/tools/channel-stats-checker", name: "Channel Stats Checker", blurb: "Paste any channel link to see subscribers, views and videos." },
] as const;
