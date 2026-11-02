import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/saved/', '/admin/'],
    },
    sitemap: 'https://ytniches.com/sitemap.xml',
  };
}
