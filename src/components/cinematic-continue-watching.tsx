'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useWatchHistory, HistoryItem } from '@/hooks/useWatchHistory';
import { getImageUrl } from '@/lib/kkphim';
import { cn } from '@/lib/utils';

export default function CinematicContinueWatching() {
  const { history, removeProgress } = useWatchHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || history.length === 0) return null;

  return (
    <section className="mb-12 md:mb-16">
      <div className="flex items-center justify-between mb-5 px-4 md:px-8 lg:px-12">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Tiếp tục xem</h2>
        <span className="text-xs text-text-muted font-medium">{history.length} mục</span>
      </div>

      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth px-4 md:px-8 lg:px-12">
        {history.map((item, index) => (
          <ContinueCard key={item.movieId} item={item} index={index} onRemove={removeProgress} />
        ))}
      </div>
    </section>
  );
}

function ContinueCard({ item, index, onRemove }: { item: HistoryItem; index: number; onRemove: (id: string) => void }) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = getImageUrl(item.posterUrl || '');
  const percentage = Math.min(100, Math.max(0, item.percentage));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex-shrink-0 w-64 md:w-72 lg:w-80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/watch/${item.movieId}?ep=${item.episodeId}`} className="block">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-cinema-800 shadow-card">
          {/* Image */}
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={item.movieTitle}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cinema-800">
              <span className="text-white text-sm font-bold">{item.movieTitle}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/30 to-transparent" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center shadow-glow-accent">
              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
            </div>
          </div>

          {/* Episode info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <h3 className="text-sm font-bold text-white line-clamp-1 drop-shadow-lg">{item.movieTitle}</h3>
            <p className="text-[10px] text-text-secondary mt-0.5">{item.episodeName}</p>
          </div>
        </div>
      </Link>

      {/* Progress bar (Netflix style) */}
      <div className="mt-2">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500 shadow-[0_0_6px_rgba(139,92,246,0.5)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-text-muted font-medium">{Math.round(percentage)}% Hoàn thành</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(item.movieId);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10 text-text-muted hover:text-red-400"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
