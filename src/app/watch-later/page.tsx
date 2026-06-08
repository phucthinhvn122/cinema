'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Trash2, Sparkles } from 'lucide-react';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import CinematicContinueWatching from '@/components/cinematic-continue-watching';

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
        <div className="border-b border-white/5 pb-6 mb-8">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Xem sau & Lịch sử</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="flex flex-col rounded-xl overflow-hidden aspect-video bg-white/5 shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-10 animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Xem sau & Lịch sử</h1>
          <p className="text-xs text-text-muted mt-1 font-medium">
            Tiếp tục các tập phim đang xem dở hoặc quản lý lịch sử
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-red-400 text-xs font-bold transition-all text-white"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa lịch sử</span>
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <CinematicContinueWatching />
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 glass-card rounded-2xl max-w-lg mx-auto">
          <Clock className="w-12 h-12 text-accent mb-4 opacity-40" />
          <h3 className="text-white text-base font-extrabold mb-1">Lịch sử trống</h3>
          <p className="text-xs text-text-muted leading-relaxed font-medium">
            Bạn chưa xem bộ phim nào. Các tập phim đang xem dở sẽ tự động xuất hiện ở đây.
          </p>
        </div>
      )}
    </div>
  );
}
