import React from 'react';
import { notFound } from 'next/navigation';
import { Star, Clock, Calendar, User, Film, Tag } from 'lucide-react';
import { getMovieDetail, getCategoryList, getImageUrl } from '@/lib/kkphim';
import { getTMDBEnrichedData } from '@/lib/tmdb';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import DetailResumeButton from '@/components/detail-resume-button';
import DetailFavoriteButton from '@/components/detail-favorite-button';
import DetailEpisodeList from '@/components/detail-episode-list';
import MovieCard from '@/components/movie-card';

export const revalidate = 600; // Cache individual details for 10 minutes

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;

  // 1. Fetch primary movie metadata from KKPhim
  const kkData = await getMovieDetail(slug);
  if (!kkData) {
    notFound();
  }

  const movie = kkData.movie;
  const servers = kkData.episodes || [];
  const movieId = movie._id;

  // 2. Try to get enriched details (DB cache first, then TMDB API)
  let enriched: any = null;

  try {
    const cached = await prisma.movieCache.findUnique({
      where: { kkphimId: movieId },
    });
    if (cached) {
      enriched = {
        backdropUrl: cached.backdropUrl || undefined,
        posterUrl: cached.posterUrl || undefined,
        rating: cached.rating || undefined,
        overview: cached.overview || undefined,
        cast: cached.cast ? (cached.cast as string[]) : undefined,
        genres: cached.genres ? (cached.genres as string[]) : undefined,
      };
    }
  } catch (dbError) {
    console.warn('Prisma cache lookup skipped during SSR details page: ', dbError);
  }

  if (!enriched && process.env.TMDB_API_KEY) {
    const tmdbData = await getTMDBEnrichedData(movie.name, movie.year, movie.type);
    if (tmdbData) {
      enriched = tmdbData;
      try {
        await prisma.movieCache.upsert({
          where: { kkphimId: movieId },
          update: {},
          create: {
            kkphimId: movieId,
            title: movie.name,
            backdropUrl: tmdbData.backdropUrl || null,
            posterUrl: tmdbData.posterUrl || null,
            overview: tmdbData.overview || null,
            cast: tmdbData.cast ? (tmdbData.cast as Prisma.InputJsonValue) : Prisma.JsonNull,
            genres: tmdbData.genres ? (tmdbData.genres as Prisma.InputJsonValue) : Prisma.JsonNull,
            rating: tmdbData.rating || null,
            year: movie.year || null,
            episodesCount: servers.length || 0,
          },
        });
      } catch (dbError) {
        console.warn('Prisma cache write skipped: ', dbError);
      }
    }
  }

  // Fallbacks if TMDB is not used
  const backdropUrl = enriched?.backdropUrl || getImageUrl(movie.thumb_url || movie.poster_url);
  const posterUrl = enriched?.posterUrl || getImageUrl(movie.poster_url || movie.thumb_url);
  const rating = enriched?.rating || 7.8; // default fallback rating
  const overview = enriched?.overview || movie.content || 'Chưa có tóm tắt nội dung.';
  const cast = enriched?.cast || (movie.actor && movie.actor.filter(a => a && a.trim() !== '')) || [];
  const genres = enriched?.genres || movie.category?.map((c) => c.name) || [];

  // 3. Query Recommendations (fetch similar type of content)
  let recommendations: any[] = [];
  if (enriched?.recommendations && enriched.recommendations.length > 0) {
    // TMDB provided recommendations
    recommendations = enriched.recommendations;
  } else {
    // Fallback: Fetch same category list (e.g. series, movie, or anime)
    let catType: 'phim-bo' | 'phim-le' | 'hoat-hinh' | 'tv-shows' = 'phim-bo';
    if (movie.type === 'single') catType = 'phim-le';
    if (movie.type === 'hoathinh') catType = 'hoat-hinh';
    if (movie.type === 'tvshows') catType = 'tv-shows';

    const catData = await getCategoryList(catType, 1);
    // Exclude current movie
    recommendations = catData.items
      .filter((item) => item.slug !== slug)
      .slice(0, 6);
  }

  // Get the first episode slug to start play
  const firstEpisodeSlug = servers[0]?.server_data[0]?.slug || 'full';

  return (
    <div className="flex flex-col w-full pb-20 relative -mt-20 -mx-4 md:-mx-6 lg:-mx-10 overflow-x-hidden">
      
      {/* 1. Backdrop Banner Background */}
      <div className="absolute top-0 left-0 right-0 h-[45vh] md:h-[55vh] lg:h-[60vh] z-0 overflow-hidden">
        <img
          src={backdropUrl}
          alt={movie.name}
          className="w-full h-full object-cover opacity-25 filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
      </div>

      {/* 2. Content Layout Details */}
      <div className="relative z-10 pt-28 md:pt-40 px-4 md:px-6 lg:px-10 flex flex-col md:flex-row gap-6 md:gap-10">
        
        {/* Left Side: Poster */}
        <div className="w-48 md:w-64 flex-shrink-0 self-center md:self-start bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <img
            src={posterUrl}
            alt={movie.name}
            className="w-full h-auto aspect-[2/3] object-cover"
          />
        </div>

        {/* Right Side: Movie metadata */}
        <div className="flex-1 flex flex-col pt-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-3">
            {movie.name}
          </h1>
          
          {movie.origin_name && movie.origin_name !== movie.name && (
            <h2 className="text-base md:text-lg text-text-secondary font-medium mb-4">
              {movie.origin_name}
            </h2>
          )}

          {/* Badges metadata bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-secondary mb-6">
            {/* TMDB Rating */}
            <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{rating.toFixed(1)}</span>
            </div>
            
            {/* Year */}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{movie.year || '2026'}</span>
            </div>

            {/* Run time */}
            {movie.time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{movie.time}</span>
              </div>
            )}

            {/* Quality badge */}
            {movie.quality && (
              <span className="bg-neutral-850 px-2 py-0.5 rounded border border-neutral-700 text-white">
                {movie.quality}
              </span>
            )}

            {/* Audio lang */}
            {movie.lang && (
              <span className="bg-neutral-850 px-2 py-0.5 rounded border border-neutral-700 text-white">
                {movie.lang}
              </span>
            )}
          </div>

          {/* Action buttons (Resume and Favorite triggers) */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <DetailResumeButton movieId={slug} defaultEpisodeSlug={firstEpisodeSlug} />
            <DetailFavoriteButton movieId={slug} movieTitle={movie.name} posterUrl={movie.poster_url || movie.thumb_url} />
          </div>

          {/* Film Synopsis */}
          <div className="mb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-2">
              Nội Dung Phim
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              {overview.replace(/<\/?[^>]+(>|$)/g, "") /* Clean HTML Tags if returned in content */}
            </p>
          </div>

          {/* Genres & Country list metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-neutral-900 pt-6">
            <div>
              <span className="text-text-muted font-bold block mb-1">Thể loại:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {genres.map((g: string) => (
                  <span key={g} className="bg-neutral-900 border border-neutral-800 text-text-secondary px-2.5 py-1 rounded-lg">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {movie.director && movie.director.length > 0 && movie.director[0] !== '' && (
              <div>
                <span className="text-text-muted font-bold block mb-1">Đạo diễn:</span>
                <span className="text-white font-medium block mt-1">
                  {movie.director.join(', ')}
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Subsections padding alignment wrapper */}
      <div className="px-4 md:px-6 lg:px-10 space-y-12 relative z-10 mt-12 w-full">
        {/* Trailer Section (If Trailer embed code exists) */}
        {enriched?.trailerUrl && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-white mb-4">
              Trailer chính thức
            </h3>
            <div className="relative aspect-video w-full max-w-4xl bg-neutral-900 border border-neutral-900/60 rounded-2xl overflow-hidden shadow-xl">
              <iframe
                src={enriched.trailerUrl}
                title={`${movie.name} Official Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        )}

        {/* 3. Server / Episode Selection Row */}
        <div>
          <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-white mb-4">
            Tập Phim
          </h3>
          <DetailEpisodeList movieId={slug} servers={servers} />
        </div>

        {/* 4. Cast details section */}
        {cast.length > 0 && (
          <div>
            <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-white mb-4">
              Diễn viên
            </h3>
            <div className="flex flex-wrap gap-2">
              {cast.map((actor: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-850 hover:border-neutral-800 text-xs text-text-secondary font-bold select-none transition-colors">
                  <User className="w-3.5 h-3.5 text-accent" />
                  <span>{actor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Recommended / Related movies list */}
        {recommendations.length > 0 && (
          <div>
            <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-white mb-4">
              Nội dung tương tự
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.map((item, idx) => (
                <MovieCard
                  key={item.slug || item.id}
                  movie={{
                    _id: item.id || item._id,
                    name: item.name || item.title,
                    slug: item.slug,
                    origin_name: item.origin_name || item.title,
                    poster_url: item.posterUrl || item.poster_url,
                    thumb_url: item.backdropUrl || item.thumb_url,
                    year: item.year || 2026,
                    quality: 'HD',
                    lang: 'Vietsub',
                  }}
                  index={idx}
                />
              ))}
            </div>
          </div>
        )}

        {/* 6. Comments section placeholder */}
        <div className="bg-card border border-neutral-900 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Bình luận</h3>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-accent">U</div>
            <div className="flex-1">
              <textarea
                placeholder="Chia sẻ suy nghĩ của bạn về bộ phim này..."
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs focus:outline-none focus:border-accent text-white"
              />
              <button className="mt-2 bg-neutral-800 text-white hover:bg-accent hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200">
                Gửi bình luận
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
