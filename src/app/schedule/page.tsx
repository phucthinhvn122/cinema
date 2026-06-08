'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { KKMovieShort, getLatestUpdates } from '@/lib/kkphim';
import MovieCard from '@/components/movie-card';
import { cn } from '@/lib/utils';

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState(new Date().getDay() || 7); // 1 = Thứ 2, ..., 7 = Chủ Nhật
  const [movies, setMovies] = useState<KKMovieShort[]>([]);
  const [loading, setLoading] = useState(false);

  const daysOfWeek = [
    { name: 'Thứ Hai', dayVal: 1 },
    { name: 'Thứ Ba', dayVal: 2 },
    { name: 'Thứ Tư', dayVal: 3 },
    { name: 'Thứ Năm', dayVal: 4 },
    { name: 'Thứ Sáu', dayVal: 5 },
    { name: 'Thứ Bảy', dayVal: 6 },
    { name: 'Chủ Nhật', dayVal: 7 },
  ];

  useEffect(() => {
    // Fetch latest updates and mock-group them into days of the week based on ID hashes for deterministic scheduler view
    const fetchScheduleMovies = async () => {
      setLoading(true);
      try {
        const res = await getLatestUpdates(1);
        if (res && res.items) {
          // Distribute movies based on string code of their slugs
          const filtered = res.items.filter((item) => {
            const sum = item.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const assignedDay = (sum % 7) + 1; // 1 to 7
            return assignedDay === activeDay;
          });
          setMovies(filtered);
        }
      } catch (err) {
        console.error('Schedule fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleMovies();
  }, [activeDay]);

  return (
    <div className="flex flex-col w-full pb-20 animate-in fade-in duration-300">
      <div className="border-b border-neutral-900 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-accent" />
            <span>Lịch chiếu phim</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-medium">
            Theo dõi thời gian phát sóng các tập phim mới của các bộ phim đang cập nhật trong tuần
          </p>
        </div>
      </div>

      {/* Week Day Tabs */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-8">
        {daysOfWeek.map((day) => {
          const isActive = activeDay === day.dayVal;
          return (
            <button
              key={day.dayVal}
              onClick={() => setActiveDay(day.dayVal)}
              className={cn(
                'py-3 rounded-xl text-xs font-bold transition-all duration-200 border text-center tv-focusable',
                isActive
                  ? 'bg-accent/15 border-accent text-accent shadow-lg shadow-accent/5'
                  : 'bg-neutral-900 border-neutral-850 hover:border-neutral-800 text-text-secondary hover:text-white'
              )}
            >
              {day.name}
            </button>
          );
        })}
      </div>

      {/* Scheduler Movie shelf results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="flex flex-col bg-card rounded-xl overflow-hidden aspect-[2/3] border border-neutral-900/60 shimmer" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Phát sóng trong ngày ({movies.length} phim)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-card border border-neutral-900 rounded-2xl max-w-lg mx-auto">
          <CalendarIcon className="w-12 h-12 text-accent mb-4 opacity-40" />
          <h3 className="text-white text-base font-extrabold mb-1 font-sans">Không có lịch chiếu</h3>
          <p className="text-xs text-text-secondary leading-relaxed font-semibold">
            Không có phim nào được xếp lịch phát sóng vào ngày này. Vui lòng kiểm tra các ngày khác!
          </p>
        </div>
      )}
    </div>
  );
}
