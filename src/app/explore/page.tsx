'use client';

import React, { useState, useEffect } from 'react';
import { Compass, Film, Globe } from 'lucide-react';
import { KKMovieShort, getImageUrl } from '@/lib/kkphim';
import MovieCard from '@/components/movie-card';
import { cn } from '@/lib/utils';

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'genre' | 'country'>('genre');
  const [activeFilter, setActiveFilter] = useState('hanh-dong');
  const [items, setItems] = useState<KKMovieShort[]>([]);
  const [loading, setLoading] = useState(false);
  const [titlePage, setTitlePage] = useState('Phim Hành Động');

  const genres = [
    { name: 'Hành động', slug: 'hanh-dong' },
    { name: 'Cổ trang', slug: 'co-trang' },
    { name: 'Viễn tưởng', slug: 'vien-tuong' },
    { name: 'Hài hước', slug: 'hai-huoc' },
    { name: 'Kinh dị', slug: 'kinh-di' },
    { name: 'Tình cảm', slug: 'tinh-cam' },
    { name: 'Phiêu lưu', slug: 'phieu-luu' },
    { name: 'Tâm lý', slug: 'tam-ly' },
  ];

  const countries = [
    { name: 'Trung Quốc', slug: 'trung-quoc' },
    { name: 'Hàn Quốc', slug: 'han-quoc' },
    { name: 'Mỹ', slug: 'my' },
    { name: 'Nhật Bản', slug: 'nhat-ban' },
    { name: 'Việt Nam', slug: 'viet-nam' },
    { name: 'Thái Lan', slug: 'thai-lan' },
    { name: 'Hồng Kông', slug: 'hong-kong' },
  ];

  useEffect(() => {
    const fetchFilteredList = async () => {
      setLoading(true);
      try {
        const filterType = activeTab === 'genre' ? 'the-loai' : 'quoc-gia';
        const res = await fetch(`https://ophim1.com/v1/api/${filterType}/${activeFilter}?page=1`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.data?.items || []);
          setTitlePage(data.data?.titlePage || 'Kết quả');
        }
      } catch (err) {
        console.error('Explore fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredList();
  }, [activeTab, activeFilter]);

  const handleTabChange = (tab: 'genre' | 'country') => {
    setActiveTab(tab);
    setActiveFilter(tab === 'genre' ? 'hanh-dong' : 'trung-quoc');
  };

  const filtersList = activeTab === 'genre' ? genres : countries;

  return (
    <div className="flex flex-col w-full pb-20 animate-in fade-in duration-300">
      <div className="border-b border-neutral-900 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-white">
            Khám phá
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-medium">
            Duyệt kho phim khổng lồ theo thể loại và quốc gia sản xuất
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-neutral-900/50 border border-neutral-850 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => handleTabChange('genre')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 tv-focusable',
              activeTab === 'genre' ? 'bg-accent text-white' : 'text-text-secondary hover:text-white'
            )}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Thể Loại</span>
          </button>
          <button
            onClick={() => handleTabChange('country')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 tv-focusable',
              activeTab === 'country' ? 'bg-accent text-white' : 'text-text-secondary hover:text-white'
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Quốc Gia</span>
          </button>
        </div>
      </div>

      {/* Filter Horizontal List */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
        {filtersList.map((filter) => (
          <button
            key={filter.slug}
            onClick={() => setActiveFilter(filter.slug)}
            className={cn(
              'px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-250 whitespace-nowrap tv-focusable border',
              activeFilter === filter.slug
                ? 'bg-accent/15 border-accent text-accent'
                : 'bg-neutral-900 border-neutral-850 hover:border-neutral-800 text-text-secondary hover:text-white'
            )}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {/* Results Display Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, idx) => (
            <div key={idx} className="flex flex-col bg-card rounded-xl overflow-hidden aspect-[2/3] border border-neutral-900/60 shimmer" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              {titlePage} ({items.length} phim)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((movie, index) => (
              <MovieCard key={movie._id} movie={movie} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-text-secondary py-16 bg-card border border-neutral-900 rounded-2xl">
          Không tìm thấy phim phù hợp. Vui lòng chọn bộ lọc khác.
        </div>
      )}
    </div>
  );
}
