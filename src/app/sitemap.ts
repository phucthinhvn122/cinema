import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cineva.vercel.app';
  
  const mainRoutes = ['', '/explore', '/schedule', '/favorites', '/watch-later', '/settings'];
  const categories = ['phim-bo', 'phim-le', 'hoat-hinh', 'tv-shows', 'phim-moi-cap-nhat'];

  const routeMaps = mainRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const categoryMaps = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...routeMaps, ...categoryMaps];
}
