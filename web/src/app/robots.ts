import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/farmer-portal/'],
    },
    sitemap: 'https://www.agrigrant.xyz/sitemap.xml',
  };
}
