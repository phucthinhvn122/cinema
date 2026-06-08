'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useDeviceSettings } from '@/hooks/useDeviceSettings';
import { useRouter, usePathname } from 'next/navigation';

const TVNavigationContext = createContext<{
  tvMode: boolean;
  setFocusById: (id: string) => void;
} | null>(null);

export function useTV() {
  const context = useContext(TVNavigationContext);
  if (!context) {
    throw new Error('useTV must be used within a TVNavigationProvider');
  }
  return context;
}

export default function TVNavigationProvider({ children }: { children: React.ReactNode }) {
  const { tvMode, setSetting } = useDeviceSettings();
  const router = useRouter();
  const pathname = usePathname();
  const activeFocusIdRef = useRef<string | null>(null);

  // Set focus to the first focusable element on page load/navigation
  useEffect(() => {
    if (!tvMode) return;

    // Small delay to allow elements to render/hydrate
    const timer = setTimeout(() => {
      const focusables = document.querySelectorAll('.tv-focusable');
      if (focusables.length > 0) {
        // Try to focus the first element that is not a layout sidebar/navbar link if possible
        const contentFocusable = Array.from(focusables).find(
          el => !el.closest('aside') && !el.closest('nav')
        );
        const target = contentFocusable || focusables[0];
        (target as HTMLElement).focus();
        activeFocusIdRef.current = target.id || null;
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [tvMode, pathname]);

  useEffect(() => {
    if (!tvMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'Backspace'];
      if (!keys.includes(e.key)) return;

      // Prevent page scroll on arrows
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      const activeEl = document.activeElement as HTMLElement;
      if (!activeEl) return;

      // Enter key -> click
      if (e.key === 'Enter') {
        activeEl.click();
        return;
      }

      // Escape or Backspace -> navigate back
      if (e.key === 'Escape' || e.key === 'Backspace') {
        // If we are typing in search input, don't trigger back navigation
        if (activeEl.tagName === 'INPUT') {
          activeEl.blur();
          return;
        }
        e.preventDefault();
        router.back();
        return;
      }

      // Perform spatial navigation
      const focusables = Array.from(document.querySelectorAll('.tv-focusable')) as HTMLElement[];
      if (focusables.length === 0) return;

      const activeRect = activeEl.getBoundingClientRect();
      const activeCenterX = activeRect.left + activeRect.width / 2;
      const activeCenterY = activeRect.top + activeRect.height / 2;

      let bestCandidate: HTMLElement | null = null;
      let minDistance = Infinity;

      focusables.forEach((candidate) => {
        if (candidate === activeEl) return;

        // Check if candidate is hidden/display none
        const style = window.getComputedStyle(candidate);
        if (style.display === 'none' || style.visibility === 'hidden' || candidate.offsetWidth === 0) {
          return;
        }

        const candRect = candidate.getBoundingClientRect();
        const candCenterX = candRect.left + candRect.width / 2;
        const candCenterY = candRect.top + candRect.height / 2;

        const dx = candCenterX - activeCenterX;
        const dy = candCenterY - activeCenterY;

        let isValid = false;

        // Verify direction constraint
        switch (e.key) {
          case 'ArrowLeft':
            isValid = candRect.right <= activeRect.left + 5;
            break;
          case 'ArrowRight':
            isValid = candRect.left >= activeRect.right - 5;
            break;
          case 'ArrowUp':
            isValid = candRect.bottom <= activeRect.top + 5;
            break;
          case 'ArrowDown':
            isValid = candRect.top >= activeRect.bottom - 5;
            break;
        }

        if (isValid) {
          // Weighted distance: prioritize the movement direction
          let distance = 0;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            // Horizontal move: penalize vertical misalignment
            distance = dx * dx + (dy * dy) * 4;
          } else {
            // Vertical move: penalize horizontal misalignment
            distance = dy * dy + (dx * dx) * 4;
          }

          if (distance < minDistance) {
            minDistance = distance;
            bestCandidate = candidate;
          }
        }
      });

      if (bestCandidate) {
        const target = bestCandidate as HTMLElement;
        target.focus();
        // Scroll into view gently if needed
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
        activeFocusIdRef.current = target.id || null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tvMode, router]);

  const setFocusById = (id: string) => {
    if (!tvMode) return;
    const el = document.getElementById(id);
    if (el) {
      el.focus();
      activeFocusIdRef.current = id;
    }
  };

  return (
    <TVNavigationContext.Provider value={{ tvMode, setFocusById }}>
      {children}
    </TVNavigationContext.Provider>
  );
}
