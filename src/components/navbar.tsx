'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Bookmark, Clock, Menu, X, Tv, Home, Compass, Heart, Settings, Film } from 'lucide-react';
import { useDeviceSettings } from '@/hooks/useDeviceSettings';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { tvMode, setSetting } = useDeviceSettings();
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 20) {
        setVisible(true);
        setScrolled(false);
      } else {
        setScrolled(true);
        if (currentY > lastScrollY.current && currentY > 80) {
          setVisible(false);
        } else {
          setVisible(true);
        }
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut: '/' to focus search
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

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/', icon: Home },
    { name: 'Phim bộ', path: '/category/phim-bo', icon: Film },
    { name: 'Phim lẻ', path: '/category/phim-le', icon: Film },
    { name: 'Anime', path: '/category/hoat-hinh', icon: Film },
    { name: 'Khám phá', path: '/explore', icon: Compass },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ y: 0 }}
        animate={{ y: visible ? 0 : -100 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-16 lg:h-20 transition-colors duration-500',
          scrolled ? 'glass-nav' : 'bg-transparent'
        )}
      >
        <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-4 md:px-8 lg:px-12">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow-accent group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-white font-black text-lg tracking-tight hidden sm:block">
                Cineva
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1 ml-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    'px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive(link.path)
                      ? 'text-white bg-white/10'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: Search */}
          <form
            onSubmit={handleSearchSubmit}
            className={cn(
              'hidden md:flex items-center relative transition-all duration-300',
              searchFocused ? 'flex-1 max-w-md mx-8' : 'w-56 lg:w-64'
            )}
          >
            <div
              className={cn(
                'relative w-full rounded-xl transition-all duration-300',
                searchFocused ? 'bg-white/10 ring-1 ring-accent/40' : 'bg-white/5 hover:bg-white/10'
              )}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm phim, anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-transparent text-white text-sm py-2.5 pl-9 pr-10 rounded-xl placeholder:text-text-muted focus:outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-dim bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                /
              </div>
            </div>
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/search"
              className="md:hidden p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setSetting('tvMode', !tvMode)}
              title="TV Mode"
              className={cn(
                'hidden sm:flex p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-colors',
                tvMode && 'text-accent bg-accent-soft'
              )}
            >
              <Tv className="w-5 h-5" />
            </button>

            <Link
              href="/settings"
              className="hidden sm:flex p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              title="Lịch sử"
            >
              <Clock className="w-5 h-5" />
            </Link>

            <Link
              href="/favorites"
              className="hidden sm:flex p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              title="Yêu thích"
            >
              <Bookmark className="w-5 h-5" />
            </Link>

            <button
              className="hidden sm:flex p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
            </button>

            <Link
              href="/settings"
              className="w-8 h-8 rounded-full bg-accent-soft border border-accent/20 flex items-center justify-center text-accent text-xs font-bold hover:bg-accent/20 transition-colors ml-1"
            >
              U
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 bottom-0 w-[80vw] max-w-[320px] bg-cinema-950 border-r border-white/5 z-[70] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow-accent">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                  <span className="text-white font-black text-lg tracking-tight">Cineva</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/5 text-text-secondary hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-4 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200',
                        active
                          ? 'text-white bg-accent-soft border border-accent/20'
                          : 'text-text-secondary hover:text-white hover:bg-white/5'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', active ? 'text-accent' : '')} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-4 border-t border-white/5">
                <button
                  onClick={() => {
                    setSetting('tvMode', !tvMode);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    tvMode
                      ? 'bg-accent text-white shadow-glow-accent'
                      : 'text-text-secondary hover:bg-white/5'
                  )}
                >
                  <Tv className="w-5 h-5" />
                  <span>{tvMode ? 'Tắt TV Mode' : 'Bật TV Mode'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
