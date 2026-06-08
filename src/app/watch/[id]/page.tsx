import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Play, Server, List } from 'lucide-react';
import { getMovieDetail, getImageUrl } from '@/lib/kkphim';
import CustomVideoPlayer from '@/components/player/CustomVideoPlayer';
import MovieCard from '@/components/movie-card';
import prisma from '@/lib/prisma';
import WatchPageClient from '@/components/player/WatchPageClient';

interface WatchPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string; server?: string }>;
}

export const revalidate = 0; // Dynamic watch page containing play tokens/servers

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { id: slug } = await params;
  const { ep: queryEp, server: queryServer } = await searchParams;

  // 1. Fetch movie metadata from KKPhim
  const kkData = await getMovieDetail(slug);
  if (!kkData || !kkData.episodes || kkData.episodes.length === 0) {
    notFound();
  }

  const movie = kkData.movie;
  const servers = kkData.episodes;

  // Resolve active server index
  const activeServerIdx = parseInt(queryServer || '0', 10);
  const server = servers[activeServerIdx] || servers[0];
  const episodes = server?.server_data || [];

  // Resolve active episode slug
  const activeEpisodeSlug = queryEp || episodes[0]?.slug || 'full';
  const activeEpisode = episodes.find((e) => e.slug === activeEpisodeSlug) || episodes[0];

  if (!activeEpisode) {
    notFound();
  }

  // Find next episode details
  const activeEpIndex = episodes.findIndex((e) => e.slug === activeEpisode.slug);
  const nextEpisode = activeEpIndex !== -1 && activeEpIndex + 1 < episodes.length 
    ? episodes[activeEpIndex + 1] 
    : null;

  // Search local DB cache for TMDB enriched backdrop/poster
  let enriched: any = null;
  try {
    const cached = await prisma.movieCache.findUnique({
      where: { kkphimId: movie._id },
    });
    if (cached) {
      enriched = {
        backdropUrl: cached.backdropUrl || undefined,
        posterUrl: cached.posterUrl || undefined,
      };
    }
  } catch (dbError) {
    console.warn('Prisma cache skipped on watch page: ', dbError);
  }

  const posterUrl = enriched?.posterUrl || getImageUrl(movie.poster_url || movie.thumb_url);
  const streamUrl = activeEpisode.link_m3u8;

  // Recommendations: Get same category list to suggest
  let catType: 'phim-bo' | 'phim-le' | 'hoat-hinh' | 'tv-shows' = 'phim-bo';
  if (movie.type === 'single') catType = 'phim-le';
  if (movie.type === 'hoathinh') catType = 'hoat-hinh';
  if (movie.type === 'tvshows') catType = 'tv-shows';

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 pb-20 pt-4">
      {/* Left Column: Streaming Player and Info metadata */}
      <div className="flex-grow lg:w-3/4 flex flex-col">
        {/* Custom HLS Video Player Wrapper */}
        <WatchPageClient
          streamUrl={streamUrl}
          movieTitle={movie.name}
          movieId={slug}
          episodeId={activeEpisodeSlug}
          episodeName={activeEpisode.name === 'Full' ? 'Phim Thuyết Minh' : `Tập ${activeEpisode.name}`}
          posterUrl={movie.poster_url || movie.thumb_url}
          nextEpisodeSlug={nextEpisode?.slug}
          activeServerIdx={activeServerIdx}
        />

        {/* Video metadata titles */}
        <div className="mt-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
            {movie.name} - {activeEpisode.name === 'Full' ? 'Bản Đẹp' : `Tập ${activeEpisode.name}`}
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-semibold uppercase tracking-wider">
            {movie.origin_name || ''} ({movie.year || '2026'})
          </p>
          
          <div className="flex flex-wrap items-center gap-3 mt-4 border-b border-neutral-900 pb-4">
            <span className="bg-neutral-900 border border-neutral-800 text-[10px] font-bold px-2 py-1 rounded text-text-secondary">
              Định dạng: HLS (.m3u8)
            </span>
            <span className="bg-neutral-900 border border-neutral-800 text-[10px] font-bold px-2 py-1 rounded text-text-secondary">
              Server: {server.server_name}
            </span>
            {movie.quality && (
              <span className="bg-accent/15 border border-accent/20 text-[10px] font-bold px-2 py-1 rounded text-accent uppercase">
                Chất Lượng: {movie.quality}
              </span>
            )}
          </div>

          {/* Servers selection lists */}
          {servers.length > 1 && (
            <div className="mt-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">
                Đổi nguồn phát (Servers):
              </span>
              <div className="flex flex-wrap gap-2">
                {servers.map((s, idx) => (
                  <Link
                    key={s.server_name}
                    href={`/watch/${slug}?ep=${activeEpisodeSlug}&server=${idx}`}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 tv-focusable border ${
                      activeServerIdx === idx
                        ? 'bg-accent border-accent text-white shadow shadow-accent/20'
                        : 'bg-neutral-900 border-neutral-850 hover:border-neutral-800 text-text-secondary hover:text-white'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>{s.server_name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Synopsis */}
          <div className="mt-6 bg-card border border-neutral-900/60 rounded-2xl p-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-2">
              Tóm tắt tập phim
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              {movie.content?.replace(/<\/?[^>]+(>|$)/g, '') || 'Không có mô tả chi tiết cho tập phim này.'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Episode Selection Sidebar */}
      <div className="w-full lg:w-1/4 flex-shrink-0 flex flex-col bg-card border border-neutral-900/60 rounded-2xl p-4 h-fit max-h-[75vh]">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-900">
          <List className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
            Danh sách tập
          </h2>
        </div>

        <div className="overflow-y-auto pr-1 space-y-1.5 no-scrollbar">
          {episodes.map((ep, idx) => {
            const isActive = ep.slug === activeEpisodeSlug;
            return (
              <Link
                key={ep.slug}
                id={`watch-ep-btn-${ep.slug}`}
                href={`/watch/${slug}?ep=${ep.slug}&server=${activeServerIdx}`}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 tv-focusable group ${
                  isActive
                    ? 'bg-accent/15 border border-accent/20 text-white font-bold'
                    : 'bg-neutral-950/40 border border-neutral-900 text-text-secondary hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Play className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-accent fill-current' : 'text-neutral-500'}`} />
                  <span className="text-xs truncate font-bold">
                    {ep.name === 'Full' ? 'Bản Đầy Đủ' : `Tập ${ep.name}`}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 text-neutral-600 group-hover:text-white transition-colors ${isActive ? 'text-accent' : ''}`} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
