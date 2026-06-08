'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Server } from 'lucide-react';
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
      <div className="glass-card rounded-2xl p-8 text-center text-text-muted">
        Chưa có tập phim nào được cập nhật.
      </div>
    );
  }

  const currentServer = servers[activeServerIdx];
  const episodes = currentServer?.server_data || [];

  return (
    <div className="flex flex-col w-full glass-card rounded-2xl p-5 md:p-6">
      {/* Server Tabs */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-2 flex-shrink-0">
          Máy Chủ:
        </span>
        {servers.map((server, idx) => (
          <button
            key={server.server_name}
            onClick={() => setActiveServerIdx(idx)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5',
              activeServerIdx === idx
                ? 'bg-accent text-white shadow-glow-accent'
                : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10'
            )}
          >
            <Server className="w-3 h-3" />
            {server.server_name}
          </button>
        ))}
      </div>

      {/* Episode Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Danh sách tập ({episodes.length})
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
          {episodes.map((episode) => {
            const isSingleEp = episodes.length === 1 && episode.slug === 'full';
            const buttonText = isSingleEp ? 'Xem Ngay' : episode.name;

            return (
              <Link
                key={episode.slug}
                href={`/watch/${movieId}?ep=${episode.slug}&server=${activeServerIdx}`}
                className={cn(
                  'flex items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:border-accent/40 text-xs font-bold text-center transition-all text-text-muted hover:text-white',
                  isSingleEp ? 'col-span-4 sm:col-span-3 text-accent bg-accent-soft border-accent/20' : ''
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
