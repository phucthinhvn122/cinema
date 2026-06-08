'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Filter, X, SlidersHorizontal, Sparkles } from 'lucide-react';
import CinematicMovieCard from '@/components/cinematic-movie-card';
import { KKMovieShort } from '@/lib/kkphim';
import { cn } from '@/lib/utils';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<KKMovieShort[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalItems: 0, totalItemsPerPage: 24 });
  const [showFilters, setShowFilters] = useState(false);
  const [activeType, setActiveType] = useState('all');
  const [activeYear, setActiveYear] = useState('all');

  const years = ['Tất cả năm', '2026', '2025', '2024', '2023', '2022', '2021', '2020'];

  const performSearch = useCallback(async (searchQuery: string, pageNum: number = 1) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=24`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.items || []);
        setPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalItems: data.pagination?.totalItems || 0,
          totalItemsPerPage: data.pagination?.totalItemsPerPage || 24,
        });
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      performSearch(query, 1);
      if (query.trim()) {
        router.replace(`/search?q=${encodeURIComponent(query.trim())}`);
      } else {
        router.replace('/search');
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [query, performSearch, router]);

  const filteredResults = results.filter((movie) => {
    if (activeType !== 'all') {
      if (activeType === 'series' && movie.episode_current?.toLowerCase().includes('tập') === false) return false;
      if (activeType === 'single' && movie.episode_current?.toLowerCase().includes('tập') === true) return false;
    }
    if (activeYear !== 'Tất cả năm' && activeYear !== 'all') {
      if (movie.year?.toString() !== activeYear) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-20 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Tìm Kiếm</h1>
          <p className="text-xs text-text-muted mt-1 font-medium">
            Tìm kiếm phim bộ, phim lẻ, hoạt hình và anime
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all self-start md:self-auto',
            showFilters ? 'bg-accent border-accent text-white shadow-glow-accent' : 'bg-white/5 border-white/10 text-text-muted hover:text-white'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Bộ lọc</span>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Loại Phim</label>
            <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent/50"
            >
              <option value="all">Tất cả</option>
              <option value="series">Phim bộ</option>
              <option value="single">Phim lẻ</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Năm</label>
            <select
              value={activeYear}
              onChange={(e) => setActiveYear(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent/50"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </motion.div>
      )}

      {/* Search Input */}
      <div className="relative w-full max-w-2xl mb-8 self-center">
        <div className="relative w-full rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all focus-within:ring-1 focus-within:ring-accent/40 focus-within:bg-white/10">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            id="search-page-input"
            type="text"
            placeholder="Nhập tên phim, diễn viên hoặc anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white py-4 pl-12 pr-12 text-sm focus:outline-none placeholder:text-text-muted"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, idx) => (
            <div key={idx} className="flex flex-col rounded-xl overflow-hidden aspect-[2/3] bg-white/5 shimmer" />
          ))}
        </div>
      ) : filteredResults.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {filteredResults.length} kết quả
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredResults.map((movie, index) => (
              <CinematicMovieCard key={movie._id} movie={movie} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 glass-card rounded-2xl max-w-lg mx-auto">
          <Sparkles className="w-12 h-12 text-accent mb-4 opacity-40" />
          <h3 className="text-white text-base font-extrabold mb-1">Không tìm thấy kết quả</h3>
          <p className="text-xs text-text-muted leading-relaxed font-medium">
            {query.trim()
              ? `Không tìm thấy bộ phim nào khớp với "${query}". Vui lòng thử từ khóa khác.`
              : 'Hãy nhập từ khóa để bắt đầu khám phá thư viện phim.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col w-full pb-20 justify-center items-center py-20 text-text-muted text-sm font-semibold">
          Đang tải...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
