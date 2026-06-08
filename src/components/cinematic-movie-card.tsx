'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import { KKMovieShort, getImageUrl } from '@/lib/kkphim';
import { cn } from '@/lib/utils';

interface CinematicMovieCardProps {
  movie: KKMovieShort;
  index: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CinematicMovieCard({ movie, index, className, size = 'md' }: CinematicMovieCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = getImageUrl(movie.poster_url || movie.thumb_url);

  const sizeClasses = {
    sm: 'w-36 md:w-40',
    md: 'w-44 md:w-52',
    lg: 'w-52 md:w-64',
  };

  return (
    <Link
      href={`/movie/${movie.slug}`}
      className={cn(
        'group relative flex flex-col rounded-xl overflow-hidden flex-shrink-0 transition-all duration-500',
        sizeClasses[size],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-cinema-800"
        animate={{
          scale: isHovered ? 1.05 : 1,
          y: isHovered ? -8 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Spotlight border effect */}
        <div className="spotlight-border absolute inset-0 rounded-xl z-20 pointer-events-none" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
          <motion.div
            initial={{ scale: 0.6 }}
            animate={{ scale: isHovered ? 1 : 0.6 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
            className="w-12 h-12 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center shadow-glow-accent"
          >
            <Play className="w-5 h-5 text-white fill-current ml-0.5" />
          </motion.div>
        </div>

        {/* Poster */}
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={movie.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-cinema-800">
            <span className="text-text-dim text-xs font-semibold uppercase tracking-wider mb-2">No Poster</span>
            <span className="text-white text-sm font-bold line-clamp-2">{movie.name}</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
          {movie.quality && (
            <span className="bg-accent text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-glow-accent">
              {movie.quality}
            </span>
          )}
          {movie.lang && (
            <span className="bg-void/80 backdrop-blur-sm text-[8px] font-bold px-1.5 py-0.5 rounded border border-white/10 text-white">
              {movie.lang}
            </span>
          )}
        </div>

        {/* Episode status */}
        {movie.episode_current && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-void/80 backdrop-blur-sm text-white text-[9px] font-semibold px-2 py-0.5 rounded border border-white/5">
              {movie.episode_current}
            </span>
          </div>
        )}

        {/* Bottom info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <h3 className="text-sm font-bold text-white line-clamp-1 drop-shadow-lg">{movie.name}</h3>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-text-secondary">
            <span>{movie.year || '2026'}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-text-muted" />
            <span>{movie.episode_current ? 'Đang cập nhật' : 'Bản Đẹp'}</span>
          </div>
        </div>
      </motion.div>

      {/* Title below poster (visible when not hovering) */}
      <div className="mt-2.5 px-0.5 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
        <h3 className="text-xs font-semibold text-white line-clamp-1">{movie.name}</h3>
        <p className="text-[10px] text-text-muted mt-0.5">{movie.year || '2026'}</p>
      </div>
    </Link>
  );
}
