'use client';

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { KKMovieShort, getImageUrl } from '@/lib/kkphim';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: KKMovieShort;
  index: number;
  className?: string;
}

export default function MovieCard({ movie, index, className }: MovieCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const imageUrl = getImageUrl(movie.poster_url || movie.thumb_url);

  // Fallback title matching
  const displayTitle = movie.name;
  const subTitle = movie.origin_name;
  const statusBadge = movie.episode_current || '';

  return (
    <Link
      id={`movie-card-${movie.slug}-${index}`}
      href={`/movie/${movie.slug}`}
      className={cn(
        'group relative flex flex-col rounded-xl overflow-hidden bg-card border border-neutral-900/60 transition-all duration-300 w-full tv-focusable',
        className
      )}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
        {/* Play Button Overlay on Hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/50 scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 text-white fill-current ml-0.5" />
          </div>
        </div>

        {/* Poster Image */}
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={displayTitle}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-neutral-900 border-b border-neutral-800">
            <span className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">No Poster</span>
            <span className="text-white text-sm font-bold line-clamp-2">{displayTitle}</span>
          </div>
        )}

        {/* Quality Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {movie.quality && (
            <span className="bg-accent text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow">
              {movie.quality}
            </span>
          )}
          {movie.lang && (
            <span className="bg-black/80 backdrop-blur-sm text-[8px] font-bold px-1.5 py-0.5 rounded border border-white/10 shadow">
              {movie.lang}
            </span>
          )}
        </div>

        {/* Episode/Release status on top right */}
        {statusBadge && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-neutral-950/80 backdrop-blur-sm text-white text-[9px] font-semibold px-2 py-0.5 rounded border border-white/5 shadow">
              {statusBadge}
            </span>
          </div>
        )}
      </div>

      {/* Title & Metadata Details */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-white group-hover:text-accent transition-colors duration-200 line-clamp-1 mb-0.5">
          {displayTitle}
        </h3>
        
        {subTitle && subTitle !== displayTitle && (
          <p className="text-[10px] text-text-secondary line-clamp-1 mb-1.5 font-medium">
            {subTitle}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between text-[10px] text-text-muted font-semibold">
          <span>{movie.year || '2026'}</span>
          <span>{movie.episode_current ? 'Cập nhật' : 'Bản Đẹp'}</span>
        </div>
      </div>
    </Link>
  );
}
