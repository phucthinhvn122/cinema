'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Trash2, Play } from 'lucide-react';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import ContinueCard from '@/components/continue-card';

export default function WatchLaterPage() {
  const { history, clearHistory } = useWatchHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClearHistory = () => {
    if (confirm('Bạn có muốn xóa toàn bộ lịch sử xem phim?')) {
      clearHistory();
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col w-full pb-10">
        <div className="border-b border-neutral-900 pb-6 mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-white">
            Xem sau & Lịch sử
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="flex flex-col bg-card rounded-xl overflow-hidden aspect-video border border-neutral-900/60 shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-10 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-neutral-900 pb-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-white">
            Xem sau & Lịch sử
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-medium">
            Tiếp tục các tập phim đang xem dở hoặc quản lý lịch sử xem phim
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-red-500 text-xs font-bold transition-all duration-200 tv-focusable"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa lịch sử</span>
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {history.map((item, index) => (
            <ContinueCard key={item.movieId} item={item} index={index} className="w-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-card border border-neutral-900 rounded-2xl max-w-lg mx-auto">
          <Clock className="w-12 h-12 text-accent mb-4 opacity-40 animate-pulse" />
          <h3 className="text-white text-base font-extrabold mb-1">Lịch sử trống</h3>
          <p className="text-xs text-text-secondary leading-relaxed font-semibold">
            Bạn chưa xem bộ phim nào. Các tập phim bạn đang xem dở sẽ tự động xuất hiện ở đây để xem tiếp lần sau.
          </p>
        </div>
      )}
    </div>
  );
}
