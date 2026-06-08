'use client';

import React, { useEffect, useState } from 'react';
import { useWatchHistory, HistoryItem } from '@/hooks/useWatchHistory';
import ContinueCard from '@/components/continue-card';

export default function ContinueWatchingRow() {
  const { history } = useWatchHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || history.length === 0) return null;

  return (
    <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-white">
          Tiếp tục xem
        </h2>
        <span className="text-xs text-text-secondary font-semibold">
          {history.length} mục đang xem
        </span>
      </div>

      {/* Horizontal Carousel List */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
        {history.map((item, index) => (
          <ContinueCard key={item.movieId} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
