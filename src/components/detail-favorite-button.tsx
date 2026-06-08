'use client';

import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface DetailFavoriteButtonProps {
  movieId: string;
  movieTitle: string;
  posterUrl: string;
}

export default function DetailFavoriteButton({ movieId, movieTitle, posterUrl }: DetailFavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isInList, setIsInList] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsInList(isFavorite(movieId));
  }, [movieId, isFavorite]);

  const handleToggle = () => {
    toggleFavorite({
      id: movieId,
      name: movieTitle,
      slug: movieId,
      posterUrl,
    });
    setIsInList(!isInList);
  };

  if (!mounted) {
    return (
      <button className="flex items-center justify-center gap-2 bg-white/10 border border-white/10 text-white font-bold text-sm px-6 py-3.5 rounded-xl">
        <Heart className="w-5 h-5" />
        <span>Danh sách</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'magnetic-btn flex items-center justify-center gap-2 font-bold text-sm px-6 py-3.5 rounded-xl border transition-all',
        isInList
          ? 'bg-accent-soft border-accent/30 text-accent'
          : 'bg-white/10 border-white/10 text-white hover:bg-white/15'
      )}
    >
      <Heart className={cn('w-5 h-5', isInList ? 'fill-current text-accent' : '')} />
      <span>{isInList ? 'Đã thêm' : 'Danh sách'}</span>
    </button>
  );
}
