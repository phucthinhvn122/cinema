'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Calendar, Heart, Clock, Settings, Tv } from 'lucide-react';
import { useDeviceSettings } from '@/hooks/useDeviceSettings';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { tvMode, setSetting } = useDeviceSettings();

  const menuItems = [
    { name: 'Trang chủ', path: '/', icon: Home },
    { name: 'Khám phá', path: '/explore', icon: Compass },
    { name: 'Lịch chiếu', path: '/schedule', icon: Calendar },
    { name: 'Yêu thích', path: '/favorites', icon: Heart },
    { name: 'Xem sau', path: '/watch-later', icon: Clock },
    { name: 'Cài đặt', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'w-64 bg-background border-r border-neutral-900 flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300',
        tvMode ? 'w-72' : '', // Expand slightly in TV Mode for better readability
        className
      )}
    >
      {/* Brand Logo */}
      <div className="h-20 flex items-center px-8 border-b border-neutral-900">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <span className="text-white font-black text-xl tracking-wider uppercase">
            Cineva
          </span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              id={`sidebar-link-${index}`}
              href={item.path}
              className={cn(
                'flex items-center gap-4 px-4 py-3 rounded-xl text-text-secondary hover:text-white hover:bg-neutral-900 transition-all duration-200 group tv-focusable',
                isActive ? 'text-white bg-accent/15 border-l-4 border-accent font-semibold' : ''
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 text-text-secondary group-hover:text-white transition-colors duration-200',
                  isActive ? 'text-accent' : ''
                )}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick TV Mode Switch in Sidebar Footer */}
      <div className="p-4 border-t border-neutral-900">
        <button
          id="sidebar-tv-toggle"
          onClick={() => setSetting('tvMode', !tvMode)}
          className={cn(
            'w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-neutral-800 text-sm font-medium hover:bg-neutral-900 transition-all duration-200 tv-focusable',
            tvMode ? 'bg-accent border-accent text-white shadow-lg shadow-accent/30' : 'text-text-secondary'
          )}
        >
          <Tv className="w-5 h-5" />
          <span>{tvMode ? 'Tắt TV Mode' : 'Bật TV Mode'}</span>
        </button>
      </div>
    </aside>
  );
}
