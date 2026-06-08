'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { KKEpisodeServer } from '@/lib/kkphim';
import { cn } from '@/lib/utils';

interface DetailEpisodeListProps {
  movieId: string;
  servers: KKEpisodeServer[];
}

export default function DetailEpisodeList({ movieId, servers }: DetailEpisodeListProps) {
  const [activeServerIdx, setActiveServerIdx] = useState(0);

  if (!servers || servers.length === 0) {
    return (
      <div className="bg-card border border-neutral-900 rounded-2xl p-8 text-center text-text-secondary">
        Chưa có tập phim nào được cập nhật cho phim này.
      </div>
    );
  }

  const currentServer = servers[activeServerIdx];
  const episodes = currentServer?.server_data || [];

  return (
    <div className="flex flex-col w-full bg-card border border-neutral-900/60 rounded-2xl p-6 mb-10">
      {/* Server Selection Tabs */}
      <div className="flex items-center gap-3 border-b border-neutral-900 pb-4 mb-6 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider mr-2">
          Chọn Máy Chủ:
        </span>
        {servers.map((server, idx) => (
          <button
            key={server.server_name}
            id={`server-tab-${idx}`}
            onClick={() => setActiveServerIdx(idx)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 tv-focusable whitespace-nowrap',
              activeServerIdx === idx
                ? 'bg-accent text-white shadow shadow-accent/20'
                : 'bg-neutral-900 text-text-secondary hover:text-white'
            )}
          >
            {server.server_name}
          </button>
        ))}
      </div>

      {/* Episode Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            Danh sách tập ({episodes.length})
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-[350px] overflow-y-auto pr-1">
          {episodes.map((episode, idx) => {
            const isSingleEp = episodes.length === 1 && episode.slug === 'full';
            const buttonText = isSingleEp ? 'Xem Ngay' : episode.name;
            
            return (
              <Link
                key={episode.slug}
                id={`episode-btn-${episode.slug}`}
                href={`/watch/${movieId}?ep=${episode.slug}&server=${activeServerIdx}`}
                className={cn(
                  'flex items-center justify-center p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-accent/40 text-xs font-bold text-center transition-all duration-200 tv-focusable text-text-secondary hover:text-white',
                  isSingleEp ? 'col-span-4 sm:col-span-3 text-accent bg-accent/5 border-accent/20' : ''
                )}
              >
                {isSingleEp && <Play className="w-3.5 h-3.5 fill-current mr-1.5" />}
                <span className="line-clamp-1">{buttonText}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
