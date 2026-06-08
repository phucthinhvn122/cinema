'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Trang chủ', path: '/', icon: Home },
    { name: 'Khám phá', path: '/explore', icon: Compass },
    { name: 'Yêu thích', path: '/favorites', icon: Heart },
    { name: 'Xem sau', path: '/watch-later', icon: Clock },
    { name: 'Cài đặt', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 border-t border-neutral-900 backdrop-blur-md px-4 py-2 flex items-center justify-between pb-safe-bottom">
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.path;
        return (
          <Link
            key={tab.path}
            id={`mobile-tab-${idx}`}
            href={tab.path}
            className="flex flex-col items-center justify-center flex-1 py-1 text-text-secondary hover:text-white transition-colors"
          >
            <Icon
              className={cn(
                'w-5 h-5 mb-1 transition-transform duration-200',
                isActive ? 'text-accent scale-110' : 'text-neutral-400'
              )}
            />
            <span
              className={cn(
                'text-[10px] font-medium tracking-wide transition-colors duration-200',
                isActive ? 'text-white' : 'text-neutral-500'
              )}
            >
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
