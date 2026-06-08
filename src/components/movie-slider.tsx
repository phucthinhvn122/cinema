'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Play, Plus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { KKMovieShort, getImageUrl } from '@/lib/kkphim';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface MovieSliderProps {
  movies: KKMovieShort[];
}

export default function MovieSlider({ movies }: MovieSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  // Autoplay effect
  useEffect(() => {
    if (isHovered || movies.length === 0) return;
    const interval = setInterval(handleNext, 6000); // Cycle every 6s
    return () => clearInterval(interval);
  }, [handleNext, isHovered, movies.length]);

  if (movies.length === 0) return null;

  const currentMovie = movies[activeIndex];
  const imageUrl = getImageUrl(currentMovie.thumb_url || currentMovie.poster_url);
  const isInList = isFavorite(currentMovie.slug);

  return (
    <div
      className="relative w-full h-[55vh] md:h-[65vh] lg:h-[70vh] rounded-2xl overflow-hidden bg-neutral-950 mb-10 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Poster Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageUrl}
          alt={currentMovie.name}
          className="w-full h-full object-cover opacity-60 scale-105 group-hover:scale-100 transition-all duration-1000 ease-out"
        />
        {/* Cinematic dark gradients to blend into background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/40 z-1" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent z-1" />
      </div>

      {/* Featured Details Container */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-12 lg:p-16 flex flex-col justify-end h-full max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-accent/20 border border-accent/40 text-accent text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
            Phim Nổi Bật
          </span>
          <span className="text-white text-xs font-semibold">
            {currentMovie.year || '2026'}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight line-clamp-2 leading-none mb-4 font-sans drop-shadow-md">
          {currentMovie.name}
        </h1>

        <p className="text-xs md:text-sm text-text-secondary line-clamp-3 mb-6 font-medium max-w-lg leading-relaxed">
          {currentMovie.origin_name ? `${currentMovie.origin_name}. ` : ''}
          Theo dõi hành trình đầy kịch tính của nhân vật trong thế giới đầy phiêu lưu, bí ẩn và cảm xúc. Xem tập mới nhất chất lượng Full HD ngay hôm nay.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            id={`hero-watch-btn-${activeIndex}`}
            href={`/movie/${currentMovie.slug}`}
            className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-white font-bold text-xs md:text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/40 tv-focusable"
          >
            <Play className="w-4 h-4 fill-current text-white" />
            <span>Xem ngay</span>
          </Link>

          <button
            id={`hero-list-btn-${activeIndex}`}
            onClick={() =>
              toggleFavorite({
                id: currentMovie.slug,
                name: currentMovie.name,
                origin_name: currentMovie.origin_name,
                slug: currentMovie.slug,
                posterUrl: currentMovie.poster_url || currentMovie.thumb_url,
              })
            }
            className={cn(
              'flex items-center gap-2 bg-neutral-900/80 hover:bg-neutral-800 text-white font-bold text-xs md:text-sm px-6 py-3 rounded-xl border border-neutral-800 transition-all duration-200 tv-focusable',
              isInList ? 'bg-accent-muted border-accent text-accent' : ''
            )}
          >
            {isInList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>Danh sách</span>
          </button>
        </div>
      </div>

      {/* Manual Sliding Chevrons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/5 z-20 tv-focusable"
        id="hero-slider-prev-btn"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/5 z-20 tv-focusable"
        id="hero-slider-next-btn"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide dots at the bottom */}
      <div className="absolute bottom-6 right-6 md:right-12 z-20 flex gap-1.5">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300 tv-focusable',
              idx === activeIndex ? 'bg-accent w-6' : 'bg-neutral-600 hover:bg-neutral-400'
            )}
            id={`hero-slide-dot-${idx}`}
          />
        ))}
      </div>
    </div>
  );
}
