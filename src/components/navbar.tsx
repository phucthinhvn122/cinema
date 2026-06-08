'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Bell, Bookmark, Clock, Menu, X, Settings, Tv } from 'lucide-react';
import { useDeviceSettings } from '@/hooks/useDeviceSettings';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

export default function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { tvMode, setSetting } = useDeviceSettings();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [scrolled, setScrolled] = useState(false);

  // Monitor scroll for header background opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut listener for '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync state with search query param changes
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Phim bộ', path: '/category/phim-bo' },
    { name: 'Phim lẻ', path: '/category/phim-le' },
    { name: 'Anime', path: '/category/hoat-hinh' },
    { name: 'Thể loại', path: '/explore' },
    { name: 'Quốc gia', path: '/explore?tab=country' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 right-0 left-0 lg:left-64 z-30 h-20 transition-all duration-300 flex items-center justify-between px-6 lg:px-10 border-b border-transparent',
        scrolled ? 'glass-nav border-neutral-900/60 shadow-lg' : 'bg-transparent',
        tvMode ? 'lg:left-72' : ''
      )}
    >
      {/* Mobile Drawer Trigger (Left on Mobile) */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-neutral-900 transition-colors mr-2 tv-focusable"
        id="navbar-mobile-menu-btn"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Categories Links (Hidden on Mobile) */}
      <div className="hidden md:flex items-center gap-6">
        {categories.map((cat, idx) => (
          <Link
            key={cat.path}
            id={`navbar-category-${idx}`}
            href={cat.path}
            className="text-text-secondary hover:text-white font-medium text-sm transition-colors duration-200 tv-focusable px-3 py-1.5 rounded-lg"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Brand logo shown on mobile header center */}
      <Link href="/" className="md:hidden flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
          <span className="text-white font-bold text-base">C</span>
        </div>
        <span className="text-white font-bold text-lg tracking-wide uppercase">Cineva</span>
      </Link>

      {/* Search Bar & Interactive Actions */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
          <input
            id="navbar-search-input"
            ref={searchInputRef}
            type="text"
            placeholder="Tìm kiếm phim, anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-60 lg:w-72 bg-neutral-900/80 border border-neutral-800 text-white rounded-full py-2 pl-4 pr-10 text-xs focus:outline-none focus:border-accent focus:w-80 transition-all duration-300 tv-focusable"
          />
          <button
            type="submit"
            className="absolute right-3 top-2 text-text-secondary hover:text-white transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          {/* Key shortcut indicator */}
          <div className="absolute right-8 top-2 bg-neutral-800 text-[10px] text-text-secondary px-1.5 py-0.5 rounded border border-neutral-700 pointer-events-none select-none">
            /
          </div>
        </form>

        {/* Small screen Search trigger */}
        <Link
          href="/search"
          className="sm:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-neutral-900 transition-colors tv-focusable"
          id="navbar-mobile-search-btn"
        >
          <Search className="w-5 h-5" />
        </Link>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* TV Mode Switch */}
          <button
            id="navbar-tv-mode-btn"
            onClick={() => setSetting('tvMode', !tvMode)}
            title="TV Mode"
            className={cn(
              'p-2 rounded-full text-text-secondary hover:text-white hover:bg-neutral-900 transition-colors tv-focusable',
              tvMode ? 'text-accent bg-accent/10' : ''
            )}
          >
            <Tv className="w-5 h-5" />
          </button>

          {/* Watch history */}
          <Link
            id="navbar-history-btn"
            href="/settings"
            title="Lịch sử xem"
            className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-neutral-900 transition-colors tv-focusable"
          >
            <Clock className="w-5 h-5" />
          </Link>

          {/* Bookmarks */}
          <Link
            id="navbar-bookmarks-btn"
            href="/favorites"
            title="Yêu thích"
            className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-neutral-900 transition-colors tv-focusable"
          >
            <Bookmark className="w-5 h-5" />
          </Link>

          {/* Notification bell */}
          <button
            id="navbar-bell-btn"
            title="Thông báo"
            className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-neutral-900 transition-colors tv-focusable"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* User profile picture */}
        <Link
          id="navbar-profile-btn"
          href="/settings"
          className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden hover:border-accent transition-colors tv-focusable flex items-center justify-center text-xs font-semibold text-accent"
        >
          U
        </Link>
      </div>
    </nav>
  );
}
