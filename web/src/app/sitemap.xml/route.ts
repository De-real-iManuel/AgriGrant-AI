import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://www.agrigrant.xyz';
  const currentDate = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { path: '', changefreq: 'daily', priority: '1.0' },
    { path: '/about-us', changefreq: 'monthly', priority: '0.8' },
    { path: '/sign-up-login-screen', changefreq: 'monthly', priority: '0.8' },
    { path: '/privacy-policy', changefreq: 'monthly', priority: '0.5' },
    { path: '/terms-of-service', changefreq: 'monthly', priority: '0.5' },
    { path: '/cookie-policy', changefreq: 'monthly', priority: '0.5' },
  ];

  const urlElements = staticRoutes
    .map(
      (route) => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
