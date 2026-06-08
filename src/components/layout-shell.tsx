'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import Navbar from '@/components/navbar';
import MobileNav from '@/components/mobile-nav';
import { useDeviceSettings } from '@/hooks/useDeviceSettings';
import { cn } from '@/lib/utils';
import { X, Home, Compass, Heart, Clock, Settings } from 'lucide-react';
import Link from 'next/link';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const { tvMode } = useDeviceSettings();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Guard against server-client state mismatch (hydration)
  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  if (!mounted) {
    // Return blank page structure with background color while hydrating
    return (
      <div className="min-h-screen bg-background text-white flex">
        <div className="flex-1 flex flex-col pt-20">
          <main className="flex-1 p-6 lg:p-10">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white flex">
      {/* 1. Sidebar (Hidden in TV Mode for clean UI, shown on Large Screens) */}
      {!tvMode && (
        <Sidebar className="hidden lg:flex" />
      )}

      {/* 2. Top Navigation Bar (Shifted left on desktop if sidebar is visible) */}
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

      {/* 3. Mobile Navigation Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          {/* Drawer content */}
          <div className="relative w-80 max-w-[85vw] h-full bg-neutral-950 p-6 flex flex-col border-r border-neutral-900 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-white font-black text-xl tracking-wider uppercase">CINEVA</span>
              </Link>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg hover:bg-neutral-900 text-text-secondary hover:text-white transition-colors tv-focusable"
                id="mobile-drawer-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 space-y-2">
              <Link
                href="/"
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-text-secondary hover:text-white hover:bg-neutral-900 transition-colors"
                onClick={closeMobileMenu}
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-semibold">Trang chủ</span>
              </Link>
              <Link
                href="/explore"
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-text-secondary hover:text-white hover:bg-neutral-900 transition-colors"
                onClick={closeMobileMenu}
              >
                <Compass className="w-5 h-5" />
                <span className="text-sm font-semibold">Khám phá</span>
              </Link>
              <Link
                href="/favorites"
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-text-secondary hover:text-white hover:bg-neutral-900 transition-colors"
                onClick={closeMobileMenu}
              >
                <Heart className="w-5 h-5" />
                <span className="text-sm font-semibold">Yêu thích</span>
              </Link>
              <Link
                href="/watch-later"
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-text-secondary hover:text-white hover:bg-neutral-900 transition-colors"
                onClick={closeMobileMenu}
              >
                <Clock className="w-5 h-5" />
                <span className="text-sm font-semibold">Xem sau</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-text-secondary hover:text-white hover:bg-neutral-900 transition-colors"
                onClick={closeMobileMenu}
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-semibold">Cài đặt</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Content Container (Padded horizontally depending on sidebar/TV-mode, and top-padded for navbar) */}
      <div
        className={cn(
          'flex-1 flex flex-col pt-20 transition-all duration-300 min-h-screen pb-20 lg:pb-0',
          !tvMode ? 'lg:pl-64' : 'pl-0'
        )}
      >
        <main className="flex-1 p-4 md:p-6 lg:p-10">{children}</main>
      </div>

      {/* 5. Mobile Bottom Tab Bar Navigation (Hidden in TV Mode) */}
      {!tvMode && <MobileNav />}
    </div>
  );
}
