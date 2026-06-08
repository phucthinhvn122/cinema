import React from 'react';
import { getLatestUpdates, getCategoryList } from '@/lib/kkphim';
import MovieSlider from '@/components/movie-slider';
import MovieCard from '@/components/movie-card';
import ContinueWatchingRow from '@/components/continue-watching-row';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const revalidate = 300; // Revalidate home page cache every 5 minutes

export default async function HomePage() {
  // Parallel Server Side Fetching
  const [latestData, seriesData, moviesData, animeData] = await Promise.all([
    getLatestUpdates(1),
    getCategoryList('phim-bo', 1),
    getCategoryList('phim-le', 1),
    getCategoryList('hoat-hinh', 1),
  ]);

  // Use top 5 items for the main hero slider carousel
  const sliderMovies = latestData.items.slice(0, 5);
  // Remaining items are used for the main updates grid
  const recentMovies = latestData.items.slice(5, 17);

  const seriesMovies = seriesData.items.slice(0, 12);
  const moviesMovies = moviesData.items.slice(0, 12);
  const animeMovies = animeData.items.slice(0, 12);

  return (
    <div className="flex flex-col w-full pb-10">
      {/* 1. Hero banner slider carousel */}
      {sliderMovies.length > 0 && <MovieSlider movies={sliderMovies} />}

      {/* 2. Client-side Continue Watching Row */}
      <ContinueWatchingRow />

      {/* 3. Recently updated grid section */}
      {recentMovies.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-white">
              Phim mới cập nhật
            </h2>
            <Link
              href="/category/phim-moi-cap-nhat"
              className="text-accent hover:text-accent/80 text-xs font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentMovies.map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* 4. Series (Phim bộ) shelf section */}
      {seriesMovies.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-white">
              Phim bộ mới nhất
            </h2>
            <Link
              href="/category/phim-bo"
              className="text-accent hover:text-accent/80 text-xs font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            {seriesMovies.map((movie, index) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                index={index}
                className="w-44 flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Movies (Phim lẻ) shelf section */}
      {moviesMovies.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-white">
              Phim lẻ đặc sắc
            </h2>
            <Link
              href="/category/phim-le"
              className="text-accent hover:text-accent/80 text-xs font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            {moviesMovies.map((movie, index) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                index={index}
                className="w-44 flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. Anime shelf section */}
      {animeMovies.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-white">
              Thế giới Anime
            </h2>
            <Link
              href="/category/hoat-hinh"
              className="text-accent hover:text-accent/80 text-xs font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            {animeMovies.map((movie, index) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                index={index}
                className="w-44 flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
