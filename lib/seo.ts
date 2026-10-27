export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Thin niche pages stay noindex (and out of the sitemap) until they have this many channels.
export const MIN_INDEXABLE = 5;
