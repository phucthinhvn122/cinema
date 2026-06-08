'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CinematicMovieCard from '@/components/cinematic-movie-card';
import { KKMovieShort } from '@/lib/kkphim';
import { Loader2 } from 'lucide-react';

interface CategoryGridProps {
  initialItems: KKMovieShort[];
  slug: string;
  totalPages: number;
}

export default function CategoryGrid({ initialItems, slug, totalPages }: CategoryGridProps) {
  const [items, setItems] = useState<KKMovieShort[]>(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(page < totalPages);

  const loadMoreItems = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/category/${slug}?page=${nextPage}`);
      if (res.ok) {
        const data = await res.json();
        const newItems = data.items || [];
        if (newItems.length > 0) {
          setItems((prev) => [...prev, ...newItems]);
          setPage(nextPage);
          const currentTotalPages = data.pagination?.totalPages || totalPages;
          setHasMore(nextPage < currentTotalPages);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
        {items.map((movie, index) => (
          <CinematicMovieCard key={`${movie._id}-${index}`} movie={movie} index={index} />
        ))}
        {loading &&
          [...Array(6)].map((_, idx) => (
            <div key={idx} className="flex flex-col rounded-xl overflow-hidden aspect-[2/3] bg-white/5 shimmer animate-fade-in-up" />
          ))}
      </div>

      {hasMore && !loading && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={loadMoreItems}
          className="self-center bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-cinematic"
        >
          Xem thêm phim
        </motion.button>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-text-muted text-xs font-medium py-4 border-t border-white/5">
          Bạn đã xem hết danh sách.
        </p>
      )}
    </div>
  );
}
