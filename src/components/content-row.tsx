'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { KKMovieShort } from '@/lib/kkphim';
import CinematicMovieCard from '@/components/cinematic-movie-card';

interface ContentRowProps {
  title: string;
  movies: KKMovieShort[];
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  trending?: boolean;
}

export default function ContentRow({ title, movies, href, size = 'md', trending }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -400 : 400;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (movies.length === 0) return null;

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-10 md:mb-14 relative group/row"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-8 lg:px-12">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h2>
        {href && (
          <a
            href={href}
            className="text-xs font-semibold text-text-muted hover:text-accent transition-colors flex items-center gap-1"
          >
            Xem tất cả
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 md:w-16 bg-gradient-to-r from-void to-transparent flex items-center justify-start pl-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
            <ChevronLeft className="w-4 h-4" />
          </div>
        </button>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 md:w-16 bg-gradient-to-l from-void to-transparent flex items-center justify-end pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        {/* Track */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth px-4 md:px-8 lg:px-12"
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie._id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: index * 0.06,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {trending ? (
                <TrendingCard movie={movie} index={index} size={size} />
              ) : (
                <CinematicMovieCard movie={movie} index={index} size={size} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function TrendingCard({
  movie,
  index,
  size,
}: {
  movie: KKMovieShort;
  index: number;
  size: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className="relative flex-shrink-0 group">
      {/* Big number behind */}
      <div className="absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 z-0 pointer-events-none select-none">
        <span className="text-7xl md:text-8xl lg:text-9xl font-black text-white/[0.04] leading-none tracking-tighter">
          {index + 1}
        </span>
      </div>
      <div className="relative z-10 ml-6 md:ml-8">
        <CinematicMovieCard movie={movie} index={index} size={size} />
      </div>
    </div>
  );
}
