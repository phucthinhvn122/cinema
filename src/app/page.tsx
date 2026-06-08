import React from 'react';
import { getLatestUpdates, getCategoryList } from '@/lib/kkphim';
import CinematicHero from '@/components/cinematic-hero';
import ContentRow from '@/components/content-row';
import CinematicContinueWatching from '@/components/cinematic-continue-watching';
import AnimeSpotlight from '@/components/anime-spotlight';

export const revalidate = 300;

export default async function HomePage() {
  const [latestData, seriesData, moviesData, animeData] = await Promise.all([
    getLatestUpdates(1),
    getCategoryList('phim-bo', 1),
    getCategoryList('phim-le', 1),
    getCategoryList('hoat-hinh', 1),
  ]);

  const sliderMovies = latestData.items.slice(0, 5);
  const recentMovies = latestData.items.slice(5, 17);
  const seriesMovies = seriesData.items.slice(0, 12);
  const moviesMovies = moviesData.items.slice(0, 12);
  const animeMovies = animeData.items.slice(0, 8);
  const trendingMovies = latestData.items.slice(0, 10);

  return (
    <div className="flex flex-col w-full pb-10 lg:pb-0">
      {/* 1. Cinematic Hero - Full Screen */}
      {sliderMovies.length > 0 && <CinematicHero movies={sliderMovies} />}

      {/* 2. Continue Watching */}
      <div className="mt-8 md:mt-0">
        <CinematicContinueWatching />
      </div>

      {/* 3. Trending Now (Top 10 style) */}
      <ContentRow
        title="Thịnh hành ngay bây giờ"
        movies={trendingMovies}
        href="/category/phim-moi-cap-nhat"
        size="lg"
        trending
      />

      {/* 4. Anime Spotlight */}
      {animeMovies.length > 0 && <AnimeSpotlight movies={animeMovies.slice(0, 5)} />}

      {/* 5. Recently Updated */}
      <ContentRow
        title="Phim mới cập nhật"
        movies={recentMovies}
        href="/category/phim-moi-cap-nhat"
        size="md"
      />

      {/* 6. Series */}
      <ContentRow
        title="Phim bộ mới nhất"
        movies={seriesMovies}
        href="/category/phim-bo"
        size="md"
      />

      {/* 7. Movies */}
      <ContentRow
        title="Phim lẻ đặc sắc"
        movies={moviesMovies}
        href="/category/phim-le"
        size="md"
      />

      {/* 8. Anime Row */}
      <ContentRow
        title="Thế giới Anime"
        movies={animeMovies}
        href="/category/hoat-hinh"
        size="sm"
      />
    </div>
  );
}
