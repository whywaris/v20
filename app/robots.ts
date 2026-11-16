import { MetadataRoute } from 'next';

// Every public page is open to Google Search and the AdSense crawler; the admin area and APIs are not.
export default function robots(): MetadataRoute.Robots {
  const disallow = ['/admin', '/api/'];
  return {
    rules: [
      { userAgent: 'Googlebot', allow: '/', disallow },
      { userAgent: 'Mediapartners-Google', allow: '/', disallow },
      { userAgent: '*', allow: '/', disallow },
    ],
    sitemap: 'https://ytniches.com/sitemap.xml',
  };
}
