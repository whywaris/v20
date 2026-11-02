import fs from 'node:fs';
import path from 'node:path';
import { MetadataRoute } from 'next';
import { BLOG_POSTS } from './blog/page';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ytniches.com';
  const dataDir = path.join(process.cwd(), 'data');

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/niche`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/outliers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/cookies`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  // Blog posts
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Niches (index all 2,706 niches)
  let nicheRoutes: MetadataRoute.Sitemap = [];
  const nichesFile = path.join(dataDir, 'unified_niches.json');
  try {
    if (fs.existsSync(nichesFile)) {
      const niches = JSON.parse(fs.readFileSync(nichesFile, 'utf8'));
      nicheRoutes = niches.map((n: any) => ({
        url: `${baseUrl}/niche/${n.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error('Error reading niches for sitemap:', e);
  }

  // Top Channels (index up to 5,000 top channels)
  let channelRoutes: MetadataRoute.Sitemap = [];
  const channelsFile = path.join(dataDir, 'unified_channels.json');
  try {
    if (fs.existsSync(channelsFile)) {
      const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));
      channelRoutes = channels.slice(0, 5000).map((c: any) => ({
        url: `${baseUrl}/channel/${c.id || c.handle.replace('@', '')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    }
  } catch (e) {
    console.error('Error reading channels for sitemap:', e);
  }

  return [...staticRoutes, ...blogRoutes, ...nicheRoutes, ...channelRoutes];
}
