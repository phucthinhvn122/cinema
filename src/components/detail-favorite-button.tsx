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
      <button className="flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-800 text-white font-bold text-sm px-6 py-3 rounded-xl">
        <Heart className="w-5 h-5" />
        <span>Danh sách</span>
      </button>
    );
  }

  return (
    <button
      id="detail-favorite-btn"
      onClick={handleToggle}
      className={cn(
        'flex items-center justify-center gap-2 bg-neutral-900/80 hover:bg-neutral-800 text-white font-bold text-sm px-6 py-3 rounded-xl border border-neutral-800 transition-all duration-200 tv-focusable',
        isInList ? 'bg-accent-muted border-accent text-accent' : ''
      )}
    >
      <Heart className={cn('w-5 h-5', isInList ? 'fill-current text-accent' : '')} />
      <span>{isInList ? 'Đã thêm' : 'Danh sách'}</span>
    </button>
  );
}
