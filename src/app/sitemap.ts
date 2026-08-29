import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/challenges', '/learn', '/leaderboard', '/pricing'];
  return ['en', 'fr'].flatMap((locale) => routes.map((route) => ({
    url: `https://securityshowdown.tech/${locale}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  })));
}
