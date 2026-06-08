'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, Volume2, VolumeX, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { KKMovieShort, getImageUrl } from '@/lib/kkphim';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface CinematicHeroProps {
  movies: KKMovieShort[];
}

export default function CinematicHero({ movies }: CinematicHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { isFavorite, toggleFavorite } = useFavorites();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  // Autoplay cycle
  useEffect(() => {
    if (isHovered || movies.length === 0) return;
    const interval = setInterval(handleNext, 8000);
    return () => clearInterval(interval);
  }, [handleNext, isHovered, movies.length]);

  // Mouse tracking for parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 20, y: y * 20 });
  };

  if (movies.length === 0) return null;

  const currentMovie = movies[activeIndex];
  const imageUrl = getImageUrl(currentMovie.thumb_url || currentMovie.poster_url);
  const isInList = isFavorite(currentMovie.slug);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] overflow-hidden bg-void -mt-16 lg:-mt-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: 'spring', stiffness: 50, damping: 30 }}
      >
        <div className="absolute inset-[-40px]">
          <img
            src={imageUrl}
            alt={currentMovie.name}
            className="w-full h-full object-cover scale-105"
          />
        </div>
      </motion.div>

      {/* Dynamic lighting overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at ${50 + mousePos.x * 2}% ${40 + mousePos.y * 2}%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)`,
        }}
      />

      {/* Cinematic gradients */}
      <div className="absolute inset-0 z-[2] gradient-fade-bottom" />
      <div className="absolute inset-0 z-[2] gradient-fade-left" />
      <div className="absolute inset-0 z-[2] gradient-vignette" />
      <div className="absolute top-0 inset-x-0 h-32 z-[2] bg-gradient-to-b from-void/80 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-end">
        <div className="max-w-[1440px] mx-auto w-full px-4 md:px-8 lg:px-12 pb-24 md:pb-32 lg:pb-40">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              {/* Badges */}
              <div className="flex items-center gap-3 mb-5">
                <span className="bg-accent/20 border border-accent/30 text-accent text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider">
                  Nổi Bật
                </span>
                <span className="text-text-secondary text-xs font-semibold">
                  {currentMovie.year || '2026'}
                </span>
                {currentMovie.quality && (
                  <span className="text-white/80 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/10 border border-white/10">
                    {currentMovie.quality}
                  </span>
                )}
                {currentMovie.lang && (
                  <span className="text-white/80 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/10 border border-white/10">
                    {currentMovie.lang}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] mb-4 text-balance">
                {currentMovie.name}
              </h1>

              {/* Origin name */}
              {currentMovie.origin_name && currentMovie.origin_name !== currentMovie.name && (
                <p className="text-sm md:text-base text-text-secondary font-medium mb-6 tracking-wide">
                  {currentMovie.origin_name}
                </p>
              )}

              {/* Synopsis */}
              <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-8 max-w-lg line-clamp-3">
                Trải nghiệm hành trình đầy kịch tính trong thế giới đầy phiêu lưu, bí ẩn và cảm xúc.
                Xem tập mới nhất chất lượng cao ngay hôm nay.
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 md:gap-4">
                <Link
                  href={`/movie/${currentMovie.slug}`}
                  className="magnetic-btn flex items-center gap-2.5 bg-accent hover:bg-accent-400 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-glow-accent"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Xem ngay</span>
                </Link>

                <button
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
                    'magnetic-btn flex items-center gap-2.5 font-bold text-sm px-6 py-3.5 rounded-xl border transition-all',
                    isInList
                      ? 'bg-accent-soft border-accent/30 text-accent'
                      : 'bg-white/10 border-white/10 text-white hover:bg-white/15'
                  )}
                >
                  {isInList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isInList ? 'Đã lưu' : 'Danh sách'}</span>
                </button>

                <Link
                  href={`/movie/${currentMovie.slug}`}
                  className="hidden sm:flex items-center gap-2 text-text-secondary hover:text-white transition-colors p-3 rounded-xl hover:bg-white/5"
                >
                  <Info className="w-5 h-5" />
                  <span className="text-sm font-medium">Thông tin</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide Controls */}
      <div className="absolute bottom-8 right-4 md:right-8 lg:right-12 z-20 flex items-center gap-3">
        {/* Dots */}
        <div className="flex gap-1.5">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                'h-1 rounded-full transition-all duration-500',
                idx === activeIndex ? 'bg-accent w-6 shadow-glow-accent' : 'bg-white/25 w-1.5 hover:bg-white/40'
              )}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="hidden md:flex items-center gap-2 ml-4">
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm border border-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 10 indicator (optional) */}
      {activeIndex < 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-24 right-4 md:right-8 lg:right-12 z-10"
        >
          <div className="text-8xl md:text-9xl font-black text-white/[0.03] leading-none select-none">
            0{activeIndex + 1}
          </div>
        </motion.div>
      )}
    </div>
  );
}
