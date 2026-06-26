import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.agrigrant.xyz';

  // Publicly crawlable pages
  const staticRoutes = [
    '',
    '/about-us',
    '/cookie-policy',
    '/privacy-policy',
    '/terms-of-service',
    '/sign-up-login-screen',
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
