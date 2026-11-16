import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'yt3.ggpht.com' },
      { protocol: 'https', hostname: 'yt3.googleusercontent.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Removed pages send visitors and Google to the homepage (which lists every article) instead of a 404:
  // the /blog list page, the old channel/niche/outlier directory and the four built-in template articles.
  async redirects() {
    const removed = [
      '/blog',
      '/channels', '/channel/:path*', '/niche', '/niche/:path*', '/outliers', '/swipe-file', '/saved', '/mcp',
      '/channels-sitemap.xml', '/niches-sitemap.xml',
      '/blog/top-high-rpm-youtube-niches-2026',
      '/blog/how-to-build-faceless-history-channel-ai',
      '/blog/viral-youtube-title-formulas-deconstructed',
      '/blog/monetizing-youtube-beyond-adsense-ebooks-funnels',
    ];
    return removed.map((source) => ({ source, destination: '/', permanent: true }));
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        // Vercel serves /sitemap.xml as a static file with its own generic headers; match the sub-sitemaps.
        source: '/sitemap.xml',
        headers: [
          { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' },
        ],
      },
    ];
  },
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
