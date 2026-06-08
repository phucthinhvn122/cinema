'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Film, Globe, Sparkles } from 'lucide-react';
import { KKMovieShort, getImageUrl } from '@/lib/kkphim';
import CinematicMovieCard from '@/components/cinematic-movie-card';
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
    <div className="flex flex-col w-full pb-20 animate-fade-in-up">
      <div className="border-b border-white/5 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Khám phá</h1>
          <p className="text-xs text-text-muted mt-1 font-medium">
            Duyệt kho phim khổng lồ theo thể loại và quốc gia
          </p>
        </div>

        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => handleTabChange('genre')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all',
              activeTab === 'genre' ? 'bg-accent text-white shadow-glow-accent' : 'text-text-muted hover:text-white'
            )}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Thể Loại</span>
          </button>
          <button
            onClick={() => handleTabChange('country')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all',
              activeTab === 'country' ? 'bg-accent text-white shadow-glow-accent' : 'text-text-muted hover:text-white'
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Quốc Gia</span>
          </button>
        </div>
      </div>

      {/* Filter list */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
        {filtersList.map((filter) => (
          <button
            key={filter.slug}
            onClick={() => setActiveFilter(filter.slug)}
            className={cn(
              'px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border',
              activeFilter === filter.slug
                ? 'bg-accent-soft border-accent/30 text-accent'
                : 'bg-white/5 border-white/10 text-text-muted hover:text-white hover:bg-white/10'
            )}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, idx) => (
            <div key={idx} className="flex flex-col rounded-xl overflow-hidden aspect-[2/3] bg-white/5 shimmer" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {titlePage} ({items.length} phim)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((movie, index) => (
              <CinematicMovieCard key={movie._id} movie={movie} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-text-muted py-16 glass-card rounded-2xl">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-accent/40" />
          <p className="text-sm font-medium">Không tìm thấy phim phù hợp. Vui lòng chọn bộ lọc khác.</p>
        </div>
      )}
    </div>
  );
}
