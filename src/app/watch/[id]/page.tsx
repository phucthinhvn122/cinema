import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Play, Server, List, Film } from 'lucide-react';
import { getMovieDetail, getImageUrl } from '@/lib/kkphim';
import WatchPageClient from '@/components/player/WatchPageClient';
import CinematicMovieCard from '@/components/cinematic-movie-card';
import prisma from '@/lib/prisma';

interface WatchPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string; server?: string }>;
}

export const revalidate = 0;

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { id: slug } = await params;
  const { ep: queryEp, server: queryServer } = await searchParams;

  const kkData = await getMovieDetail(slug);
  if (!kkData || !kkData.episodes || kkData.episodes.length === 0) {
    notFound();
  }

  const movie = kkData.movie;
  const servers = kkData.episodes;

  const activeServerIdx = parseInt(queryServer || '0', 10);
  const server = servers[activeServerIdx] || servers[0];
  const episodes = server?.server_data || [];

  const activeEpisodeSlug = queryEp || episodes[0]?.slug || 'full';
  const activeEpisode = episodes.find((e) => e.slug === activeEpisodeSlug) || episodes[0];

  if (!activeEpisode) {
    notFound();
  }

  const activeEpIndex = episodes.findIndex((e) => e.slug === activeEpisode.slug);
  const nextEpisode = activeEpIndex !== -1 && activeEpIndex + 1 < episodes.length
    ? episodes[activeEpIndex + 1]
    : null;

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
    console.warn('Prisma cache skipped:', dbError);
  }

  const posterUrl = enriched?.posterUrl || getImageUrl(movie.poster_url || movie.thumb_url);
  const streamUrl = activeEpisode.link_m3u8;

  let catType: 'phim-bo' | 'phim-le' | 'hoat-hinh' | 'tv-shows' = 'phim-bo';
  if (movie.type === 'single') catType = 'phim-le';
  if (movie.type === 'hoathinh') catType = 'hoat-hinh';
  if (movie.type === 'tvshows') catType = 'tv-shows';

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 pb-20 pt-4">
      {/* Left: Player */}
      <div className="flex-grow lg:w-3/4 flex flex-col">
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

        {/* Meta */}
        <div className="mt-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
            {movie.name} - {activeEpisode.name === 'Full' ? 'Bản Đẹp' : `Tập ${activeEpisode.name}`}
          </h1>
          <p className="text-xs text-text-muted mt-1 font-semibold uppercase tracking-wider">
            {movie.origin_name || ''} ({movie.year || '2026'})
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4 border-b border-white/5 pb-4">
            <span className="bg-white/5 border border-white/10 text-[10px] font-bold px-2 py-1 rounded text-text-muted">
              HLS (.m3u8)
            </span>
            <span className="bg-white/5 border border-white/10 text-[10px] font-bold px-2 py-1 rounded text-text-muted">
              {server.server_name}
            </span>
            {movie.quality && (
              <span className="bg-accent-soft border border-accent/20 text-[10px] font-bold px-2 py-1 rounded text-accent uppercase">
                {movie.quality}
              </span>
            )}
          </div>

          {/* Servers */}
          {servers.length > 1 && (
            <div className="mt-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">
                Đổi nguồn phát:
              </span>
              <div className="flex flex-wrap gap-2">
                {servers.map((s, idx) => (
                  <Link
                    key={s.server_name}
                    href={`/watch/${slug}?ep=${activeEpisodeSlug}&server=${idx}`}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      activeServerIdx === idx
                        ? 'bg-accent border-accent text-white shadow-glow-accent'
                        : 'bg-white/5 border-white/10 text-text-muted hover:text-white hover:bg-white/10'
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
          <div className="mt-6 glass-card rounded-2xl p-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-2">
              Tóm tắt
            </h3>
            <p className="text-xs text-text-muted leading-relaxed font-medium">
              {movie.content?.replace(/<\/?[^>]+(>|$)/g, '') || 'Không có mô tả chi tiết.'}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Episode List */}
      <div className="w-full lg:w-1/4 flex-shrink-0 flex flex-col glass-card rounded-2xl p-4 h-fit max-h-[75vh]">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
          <List className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
            Danh sách tập
          </h2>
        </div>

        <div className="overflow-y-auto pr-1 space-y-1.5 no-scrollbar">
          {episodes.map((ep) => {
            const isActive = ep.slug === activeEpisodeSlug;
            return (
              <Link
                key={ep.slug}
                href={`/watch/${slug}?ep=${ep.slug}&server=${activeServerIdx}`}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-accent-soft border border-accent/20 text-white font-bold'
                    : 'bg-white/5 border border-white/5 text-text-muted hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Play className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-accent fill-current' : 'text-text-muted'}`} />
                  <span className="text-xs truncate font-bold">
                    {ep.name === 'Full' ? 'Bản Đầy Đủ' : `Tập ${ep.name}`}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 text-text-muted group-hover:text-white transition-colors ${isActive ? 'text-accent' : ''}`} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
