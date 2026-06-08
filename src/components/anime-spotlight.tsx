'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { KKMovieShort, getImageUrl } from '@/lib/kkphim';
import Link from 'next/link';

interface AnimeSpotlightProps {
  movies: KKMovieShort[];
}

export default function AnimeSpotlight({ movies }: AnimeSpotlightProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  // Auto transition
  useEffect(() => {
    if (isHovered || movies.length === 0) return;
    const interval = setInterval(handleNext, 7000);
    return () => clearInterval(interval);
  }, [handleNext, isHovered, movies.length]);

  if (movies.length === 0) return null;

  const currentMovie = movies[activeIndex];
  const backdropUrl = getImageUrl(currentMovie.thumb_url || currentMovie.poster_url);

  return (
    <section className="mb-12 md:mb-16 px-4 md:px-8 lg:px-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Anime Spotlight</h2>
        <Link
          href="/category/hoat-hinh"
          className="text-xs font-semibold text-text-muted hover:text-accent transition-colors flex items-center gap-1"
        >
          Xem tất cả
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden bg-cinema-900 min-h-[320px] md:min-h-[420px] lg:min-h-[480px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Dynamic background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img
              src={backdropUrl}
              alt={currentMovie.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-void via-void/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-radial-accent" />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 flex items-center h-full min-h-[320px] md:min-h-[420px] lg:min-h-[480px] p-6 md:p-10 lg:p-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-lg"
            >
              <span className="inline-block bg-accent/20 border border-accent/30 text-accent text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider mb-4">
                Anime
              </span>

              <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[0.95] mb-3 text-balance">
                {currentMovie.name}
              </h3>

              {currentMovie.origin_name && currentMovie.origin_name !== currentMovie.name && (
                <p className="text-sm text-text-secondary font-medium mb-4">
                  {currentMovie.origin_name}
                </p>
              )}

              <div className="flex items-center gap-3 mb-6">
                {currentMovie.year && (
                  <span className="text-xs text-text-secondary font-medium">{currentMovie.year}</span>
                )}
                {currentMovie.quality && (
                  <>
                    <span className="w-0.5 h-0.5 rounded-full bg-text-muted" />
                    <span className="text-xs text-text-secondary font-medium">{currentMovie.quality}</span>
                  </>
                )}
                {currentMovie.lang && (
                  <>
                    <span className="w-0.5 h-0.5 rounded-full bg-text-muted" />
                    <span className="text-xs text-text-secondary font-medium">{currentMovie.lang}</span>
                  </>
                )}
              </div>

              <Link
                href={`/movie/${currentMovie.slug}`}
                className="inline-flex items-center gap-2.5 bg-accent hover:bg-accent-400 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-glow-accent magnetic-btn"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Xem ngay</span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation arrows */}
        <div className="absolute bottom-6 right-6 md:right-10 z-20 flex items-center gap-2">
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

        {/* Dots */}
        <div className="absolute bottom-6 left-6 md:left-10 z-20 flex gap-1.5">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={
                idx === activeIndex
                  ? 'w-6 h-1.5 rounded-full bg-accent shadow-glow-accent transition-all duration-500'
                  : 'w-1.5 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-all'
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
