'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Bookmark } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import CinematicMovieCard from '@/components/cinematic-movie-card';

export default function FavoritesPage() {
  const { items } = useFavorites();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col w-full pb-10">
        <div className="border-b border-white/5 pb-6 mb-8">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Danh sách yêu thích</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="flex flex-col rounded-xl overflow-hidden aspect-[2/3] bg-white/5 shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-10 animate-fade-in-up">
      <div className="border-b border-white/5 pb-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Danh sách yêu thích</h1>
        <p className="text-xs text-text-muted mt-1 font-medium">
          Xem lại danh sách phim bạn đã đánh dấu yêu thích
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item, index) => (
            <CinematicMovieCard
              key={item.id}
              movie={{
                _id: item.id,
                name: item.name,
                slug: item.slug,
                origin_name: item.origin_name || '',
                poster_url: item.posterUrl || '',
                thumb_url: item.posterUrl || '',
                year: 2026,
              }}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 glass-card rounded-2xl max-w-lg mx-auto">
          <Heart className="w-12 h-12 text-accent mb-4 opacity-40" />
          <h3 className="text-white text-base font-extrabold mb-1">Danh sách trống</h3>
          <p className="text-xs text-text-muted leading-relaxed font-medium">
            Bạn chưa thêm bộ phim nào vào danh sách yêu thích. Hãy bấm vào biểu tượng trái tim ở trang chi tiết phim để lưu lại.
          </p>
        </div>
      )}
    </div>
  );
}
