import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/watch/'],
    },
    sitemap: 'https://cineva.vercel.app/sitemap.xml',
  };
}
