'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Search, Compass, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Trang chủ', path: '/', icon: Home },
    { name: 'Tìm kiếm', path: '/search', icon: Search },
    { name: 'Khám phá', path: '/explore', icon: Compass },
    { name: 'Yêu thích', path: '/favorites', icon: Heart },
    { name: 'Tài khoản', path: '/settings', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-cinema-950/85 backdrop-blur-2xl border-t border-white/5 pb-safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className="relative flex flex-col items-center justify-center flex-1 py-1.5"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-2 w-8 h-1 rounded-full bg-accent shadow-glow-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 mb-1 transition-all duration-200',
                  isActive ? 'text-accent' : 'text-text-muted'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'text-white' : 'text-text-muted'
                )}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
