'use client';

import React, { useState } from 'react';
import MovieCard from '@/components/movie-card';
import { KKMovieShort } from '@/lib/kkphim';

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
          
          // Verify if there are more pages
          const currentTotalPages = data.pagination?.totalPages || totalPages;
          setHasMore(nextPage < currentTotalPages);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more category items:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Cards Catalog Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
        {items.map((movie, index) => (
          <MovieCard key={`${movie._id}-${index}`} movie={movie} index={index} />
        ))}
        
        {/* Shimmer loaders for pending page */}
        {loading &&
          [...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-card rounded-xl overflow-hidden aspect-[2/3] border border-neutral-900/60 shimmer animate-in fade-in duration-300"
            />
          ))}
      </div>

      {/* Load More Button Trigger */}
      {hasMore && !loading && (
        <button
          id="load-more-category-btn"
          onClick={loadMoreItems}
          className="self-center bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 font-bold text-xs px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md tv-focusable"
        >
          Xem thêm phim
        </button>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-text-muted text-xs font-semibold py-4 border-t border-neutral-950">
          Bạn đã xem hết danh sách.
        </p>
      )}
    </div>
  );
}
