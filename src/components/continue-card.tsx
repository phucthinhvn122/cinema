'use client';

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { HistoryItem } from '@/hooks/useWatchHistory';
import { getImageUrl } from '@/lib/kkphim';
import { cn } from '@/lib/utils';

interface ContinueCardProps {
  item: HistoryItem;
  index: number;
  className?: string;
}

export default function ContinueCard({ item, index, className }: ContinueCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const imageUrl = getImageUrl(item.posterUrl || '');

  return (
    <Link
      id={`continue-card-${item.movieId}-${index}`}
      href={`/watch/${item.movieId}?ep=${item.episodeId}`}
      className={cn(
        'group relative flex flex-col rounded-xl overflow-hidden bg-card border border-neutral-900/60 transition-all duration-300 w-72 flex-shrink-0 tv-focusable',
        className
      )}
    >
      {/* Landscape Backdrop Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
        {/* Play Button Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/50 scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-4 h-4 text-white fill-current ml-0.5" />
          </div>
        </div>

        {/* Backdrop Image */}
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={item.movieTitle}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-3 bg-neutral-900 border-b border-neutral-800">
            <span className="text-white text-xs font-bold line-clamp-1 mb-1">{item.movieTitle}</span>
            <span className="text-accent text-[10px] font-semibold uppercase">{item.episodeName}</span>
          </div>
        )}

        {/* Progress Bar Container */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-800 z-10">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
          />
        </div>
      </div>

      {/* Title & Metadata Details */}
      <div className="p-3">
        <h3 className="text-xs font-bold text-white group-hover:text-accent transition-colors duration-200 line-clamp-1">
          {item.movieTitle}
        </h3>
        <p className="text-[10px] text-text-secondary mt-0.5 font-medium">
          {item.episodeName} • {Math.round(item.percentage)}% Hoàn thành
        </p>
      </div>
    </Link>
  );
}
