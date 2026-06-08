import React from 'react';
import { notFound } from 'next/navigation';
import { Star, Clock, Calendar, User, Film, Tag, Play, Heart, Share2, ChevronRight } from 'lucide-react';
import { getMovieDetail, getCategoryList, getImageUrl } from '@/lib/kkphim';
import { getTMDBEnrichedData } from '@/lib/tmdb';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import DetailResumeButton from '@/components/detail-resume-button';
import DetailFavoriteButton from '@/components/detail-favorite-button';
import DetailEpisodeList from '@/components/detail-episode-list';
import CinematicMovieCard from '@/components/cinematic-movie-card';

export const revalidate = 600;

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;

  const kkData = await getMovieDetail(slug);
  if (!kkData) {
    notFound();
  }

  const movie = kkData.movie;
  const servers = kkData.episodes || [];
  const movieId = movie._id;

  // Enriched data
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
    console.warn('Prisma cache lookup skipped:', dbError);
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
        console.warn('Prisma cache write skipped:', dbError);
      }
    }
  }

  const backdropUrl = enriched?.backdropUrl || getImageUrl(movie.thumb_url || movie.poster_url);
  const posterUrl = enriched?.posterUrl || getImageUrl(movie.poster_url || movie.thumb_url);
  const rating = enriched?.rating || 7.8;
  const overview = enriched?.overview || movie.content || 'Chưa có tóm tắt nội dung.';
  const cast = enriched?.cast || (movie.actor && movie.actor.filter((a: string) => a && a.trim() !== '')) || [];
  const genres = enriched?.genres || movie.category?.map((c) => c.name) || [];

  let recommendations: any[] = [];
  if (enriched?.recommendations && enriched.recommendations.length > 0) {
    recommendations = enriched.recommendations;
  } else {
    let catType: 'phim-bo' | 'phim-le' | 'hoat-hinh' | 'tv-shows' = 'phim-bo';
    if (movie.type === 'single') catType = 'phim-le';
    if (movie.type === 'hoathinh') catType = 'hoat-hinh';
    if (movie.type === 'tvshows') catType = 'tv-shows';

    const catData = await getCategoryList(catType, 1);
    recommendations = catData.items.filter((item) => item.slug !== slug).slice(0, 6);
  }

  const firstEpisodeSlug = servers[0]?.server_data[0]?.slug || 'full';

  return (
    <div className="flex flex-col w-full relative">
      {/* 1. Full Backdrop Hero */}
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
        <img
          src={backdropUrl}
          alt={movie.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-void/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-radial-accent" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-void/60 to-transparent" />
      </div>

      {/* 2. Content Overlay */}
      <div className="relative z-10 -mt-[15vh] md:-mt-[20vh] lg:-mt-[25vh] px-4 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-14">
          {/* Floating Poster */}
          <div className="w-40 md:w-52 lg:w-64 flex-shrink-0 self-center md:self-start">
            <div className="relative rounded-2xl overflow-hidden shadow-cinematic animate-float group">
              <img
                src={posterUrl}
                alt={movie.name}
                className="w-full h-auto aspect-[2/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="spotlight-border absolute inset-0 rounded-2xl pointer-events-none" />
            </div>
          </div>

          {/* Glass Panel Info */}
          <div className="flex-1 min-w-0">
            <div className="glass-panel rounded-2xl p-5 md:p-8 lg:p-10">
              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[0.95] mb-2 text-balance">
                {movie.name}
              </h1>

              {movie.origin_name && movie.origin_name !== movie.name && (
                <h2 className="text-base md:text-lg text-text-secondary font-medium mb-5">
                  {movie.origin_name}
                </h2>
              )}

              {/* Meta badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold">{rating.toFixed(1)}</span>
                </div>

                <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{movie.year || '2026'}</span>
                </div>

                {movie.time && (
                  <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{movie.time}</span>
                  </div>
                )}

                {movie.quality && (
                  <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10">
                    {movie.quality}
                  </span>
                )}

                {movie.lang && (
                  <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10">
                    {movie.lang}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <DetailResumeButton movieId={slug} defaultEpisodeSlug={firstEpisodeSlug} />
                <DetailFavoriteButton movieId={slug} movieTitle={movie.name} posterUrl={movie.poster_url || movie.thumb_url} />
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/10">
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Chia sẻ</span>
                </button>
              </div>

              {/* Synopsis */}
              <div className="mb-6">
                <p className="text-sm md:text-base text-text-secondary leading-relaxed font-medium">
                  {overview.replace(/<\/?[^>]+(>|$)/g, '')}
                </p>
              </div>

              {/* Genres & Cast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs border-t border-white/5 pt-5">
                <div>
                  <span className="text-text-muted font-bold block mb-2 text-[10px] uppercase tracking-wider">Thể loại</span>
                  <div className="flex flex-wrap gap-1.5">
                    {genres.map((g: string) => (
                      <span
                        key={g}
                        className="bg-white/5 border border-white/10 text-text-secondary px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {movie.director && movie.director.length > 0 && movie.director[0] !== '' && (
                  <div>
                    <span className="text-text-muted font-bold block mb-2 text-[10px] uppercase tracking-wider">Đạo diễn</span>
                    <span className="text-white font-medium text-xs block">{movie.director.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Details Sections */}
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-8 lg:px-12 mt-10 md:mt-14 space-y-10 md:space-y-14">
        {/* Trailer */}
        {enriched?.trailerUrl && (
          <section>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight mb-4">Trailer chính thức</h3>
            <div className="relative aspect-video w-full max-w-4xl rounded-2xl overflow-hidden bg-cinema-900 border border-white/5 shadow-cinematic">
              <iframe
                src={enriched.trailerUrl}
                title={`${movie.name} Official Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </section>
        )}

        {/* Episodes */}
        <section>
          <h3 className="text-lg md:text-xl font-bold text-white tracking-tight mb-4">Tập phim</h3>
          <DetailEpisodeList movieId={slug} servers={servers} />
        </section>

        {/* Cast */}
        {cast.length > 0 && (
          <section>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight mb-4">Diễn viên</h3>
            <div className="flex flex-wrap gap-2">
              {cast.map((actor: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-text-secondary font-semibold hover:bg-white/10 hover:text-white transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-accent" />
                  <span>{actor}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight mb-4">Nội dung tương tự</h3>
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {recommendations.map((item, idx) => (
                <CinematicMovieCard
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
                  size="md"
                />
              ))}
            </div>
          </section>
        )}

        {/* Comments placeholder */}
        <section className="glass-panel rounded-2xl p-5 md:p-8">
          <h3 className="text-lg font-bold text-white mb-4">Bình luận</h3>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center font-bold text-accent text-sm flex-shrink-0">
              U
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Chia sẻ suy nghĩ của bạn về bộ phim này..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-accent/50 text-white placeholder:text-text-muted resize-none"
              />
              <button className="mt-2 bg-white/10 hover:bg-accent text-white hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/10 hover:border-accent/50">
                Gửi bình luận
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
