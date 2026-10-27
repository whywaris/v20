// Public site address for canonicals, sitemap and JSON-LD. On Vercel production, a missing, blank or
// localhost NEXT_PUBLIC_SITE_URL falls back to the production domain Vercel sets, so we never ship localhost links.
const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const vercelProd = process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL;
const useEnv = !!fromEnv && !(vercelProd && /localhost|127\.0\.0\.1/.test(fromEnv));

export const SITE_SOURCE = useEnv ? "NEXT_PUBLIC_SITE_URL" : vercelProd ? "VERCEL_PROJECT_PRODUCTION_URL" : "default";
export const SITE = (useEnv ? fromEnv! : vercelProd ? `https://${vercelProd}` : "http://localhost:3000").replace(/\/$/, "");

// Thin niche pages stay noindex (and out of the sitemap) until they have this many channels.
export const MIN_INDEXABLE = 5;

export const TOOLS = [
  { href: "/tools/youtube-money-calculator", name: "YouTube Money Calculator", blurb: "Estimate earnings from daily views and your niche's RPM." },
  { href: "/tools/niche-finder", name: "YouTube Niche Finder", blurb: "Compare niches by RPM, competition, growth and how many channels sell products." },
  { href: "/tools/channel-stats-checker", name: "Channel Stats Checker", blurb: "Paste any channel link to see subscribers, views and videos." },
] as const;
