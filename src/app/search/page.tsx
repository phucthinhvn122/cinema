'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon, Filter, X, SlidersHorizontal } from 'lucide-react';
import MovieCard from '@/components/movie-card';
import { KKMovieShort } from '@/lib/kkphim';
import { cn } from '@/lib/utils';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  // Search terms & query results state
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<KKMovieShort[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalItems: 0, totalItemsPerPage: 24 });

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [activeType, setActiveType] = useState('all'); // all, series, single, hoathinh
  const [activeGenre, setActiveGenre] = useState('all');
  const [activeCountry, setActiveCountry] = useState('all');
  const [activeYear, setActiveYear] = useState('all');

  const genres = [
    { name: 'Tất cả thể loại', slug: 'all' },
    { name: 'Hành động', slug: 'hanh-dong' },
    { name: 'Cổ trang', slug: 'co-trang' },
    { name: 'Viễn tưởng', slug: 'vien-tuong' },
    { name: 'Hài hước', slug: 'hai-huoc' },
    { name: 'Kinh dị', slug: 'kinh-di' },
    { name: 'Tình cảm', slug: 'tinh-cam' },
    { name: 'Hoạt hình', slug: 'hoat-hinh' },
  ];

  const countries = [
    { name: 'Tất cả quốc gia', slug: 'all' },
    { name: 'Trung Quốc', slug: 'trung-quoc' },
    { name: 'Hàn Quốc', slug: 'han-quoc' },
    { name: 'Nhật Bản', slug: 'nhat-ban' },
    { name: 'Mỹ', slug: 'my' },
    { name: 'Việt Nam', slug: 'viet-nam' },
  ];

  const years = ['Tất cả năm', '2026', '2025', '2024', '2023', '2022', '2021', '2020'];

  // 1. Fetching results from Search API
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
      console.error('Search query error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Debouncing logic for instant search typing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      performSearch(query, 1);
      // Synchronize URL query
      if (query.trim()) {
        router.replace(`/search?q=${encodeURIComponent(query.trim())}`);
      } else {
        router.replace('/search');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, performSearch, router]);

  // 3. Filtering logical matches (Local filtering based on API catalog results)
  const filteredResults = results.filter((movie) => {
    // Filter Type
    if (activeType !== 'all') {
      if (activeType === 'series' && movie.episode_current?.toLowerCase().includes('tập') === false) return false;
      if (activeType === 'single' && movie.episode_current?.toLowerCase().includes('tập') === true) return false;
    }
    // Filter Year
    if (activeYear !== 'Tất cả năm' && activeYear !== 'all') {
      if (movie.year?.toString() !== activeYear) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-20 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-white">
            Tìm Kiếm
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-medium">
            Tìm kiếm phim bộ, phim lẻ, hoạt hình và anime theo từ khóa
          </p>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 tv-focusable self-start md:self-auto',
            showFilters ? 'bg-accent border-accent text-white' : 'bg-neutral-900 border-neutral-800 text-text-secondary hover:text-white'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Bộ lọc nâng cao</span>
        </button>
      </div>

      {/* 4. Filter Panel Options */}
      {showFilters && (
        <div className="bg-card border border-neutral-900/60 rounded-2xl p-5 mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-200">
          {/* Movie Type Selector */}
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Loại Phim</label>
            <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            >
              <option value="all">Tất cả định dạng</option>
              <option value="series">Phim bộ (Series)</option>
              <option value="single">Phim lẻ (Single)</option>
            </select>
          </div>

          {/* Genre Selector */}
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Thể Loại</label>
            <select
              value={activeGenre}
              onChange={(e) => setActiveGenre(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            >
              {genres.map((g) => (
                <option key={g.slug} value={g.slug}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Country Selector */}
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Quốc Gia</label>
            <select
              value={activeCountry}
              onChange={(e) => setActiveCountry(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            >
              {countries.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Năm Phát Hành</label>
            <select
              value={activeYear}
              onChange={(e) => setActiveYear(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 5. Main Search Input bar (shown on details list) */}
      <div className="relative w-full max-w-2xl mb-8 self-center">
        <input
          id="search-page-input"
          type="text"
          placeholder="Nhập tên phim, diễn viên hoặc anime..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 text-white rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-accent focus:bg-neutral-900 transition-all duration-300 tv-focusable"
        />
        <SearchIcon className="absolute left-4 top-4.5 text-text-secondary w-5 h-5" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-4.5 text-text-secondary hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 6. Results display shelves */}
      {loading ? (
        // Skeleton Load Shimmer
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, idx) => (
            <div key={idx} className="flex flex-col bg-card rounded-xl overflow-hidden aspect-[2/3] border border-neutral-900/60 shimmer" />
          ))}
        </div>
      ) : filteredResults.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Kết quả tìm kiếm ({filteredResults.length} phim)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredResults.map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} index={index} />
            ))}
          </div>
        </div>
      ) : (
        // Empty Search State Page
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-card border border-neutral-900 rounded-2xl max-w-lg mx-auto">
          <SearchIcon className="w-12 h-12 text-accent mb-4 opacity-40 animate-pulse" />
          <h3 className="text-white text-base font-extrabold mb-1">Không tìm thấy kết quả</h3>
          <p className="text-xs text-text-secondary leading-relaxed font-semibold">
            {query.trim()
              ? `Không tìm thấy bộ phim nào khớp với từ khóa "${query}". Vui lòng thử tìm từ khóa khác.`
              : 'Hãy nhập từ khóa tìm kiếm để bắt đầu khám phá thư viện phim.'}
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
        <div className="flex flex-col w-full pb-20 justify-center items-center py-20 text-text-secondary text-sm font-semibold">
          Đang tải tìm kiếm...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
