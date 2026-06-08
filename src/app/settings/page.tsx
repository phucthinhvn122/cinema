'use client';

import React, { useEffect, useState } from 'react';
import { useDeviceSettings } from '@/hooks/useDeviceSettings';
import { ToggleLeft, ToggleRight, Settings, Info, RefreshCw, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const {
    autoPlay,
    autoNext,
    skipIntro,
    skipEnding,
    quality,
    subtitle,
    tvMode,
    setSetting,
    resetSettings,
  } = useDeviceSettings();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col w-full pb-10">
        <div className="border-b border-neutral-900 pb-6 mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-white">
            Cài đặt
          </h1>
        </div>
      </div>
    );
  }

  const toggle = (key: 'autoPlay' | 'autoNext' | 'skipIntro' | 'skipEnding' | 'tvMode') => {
    if (key === 'autoPlay') setSetting('autoPlay', !autoPlay);
    if (key === 'autoNext') setSetting('autoNext', !autoNext);
    if (key === 'skipIntro') setSetting('skipIntro', !skipIntro);
    if (key === 'skipEnding') setSetting('skipEnding', !skipEnding);
    if (key === 'tvMode') setSetting('tvMode', !tvMode);
  };

  return (
    <div className="flex flex-col w-full pb-20 animate-in fade-in duration-300">
      <div className="border-b border-neutral-900 pb-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-white">
          Cài đặt hệ thống
        </h1>
        <p className="text-xs text-text-secondary mt-1 font-medium">
          Cấu hình trình phát video, phụ đề và chế độ Smart TV cho thiết bị của bạn
        </p>
      </div>

      <div className="max-w-2xl bg-card border border-neutral-900/60 rounded-2xl p-6 md:p-8 space-y-6">
        {/* TV Mode Section */}
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
            <Tv className="w-4 h-4 text-accent" />
            <span>Smart TV & Phím Điều Hướng</span>
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/50 border border-neutral-850">
            <div>
              <span className="text-xs font-bold text-white block">Chế độ TV (TV Mode)</span>
              <span className="text-[10px] text-text-secondary mt-1 block max-w-sm leading-relaxed font-semibold">
                Kích hoạt phím điều hướng (D-Pad/Mũi tên) để di chuyển và chọn các mục mà không cần chuột hoặc chạm. Phù hợp cho Android TV và điều khiển cầm tay.
              </span>
            </div>
            <button
              onClick={() => toggle('tvMode')}
              className="text-text-secondary hover:text-white transition-colors"
            >
              {tvMode ? (
                <ToggleRight className="w-10 h-10 text-accent fill-current" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-neutral-600" />
              )}
            </button>
          </div>
        </div>

        {/* Playback Settings */}
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-accent" />
            <span>Cấu Hình Trình Phát (Playback)</span>
          </h3>

          <div className="space-y-3">
            {/* Auto Play */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/30 border border-neutral-900 flex-wrap sm:flex-nowrap gap-2">
              <div>
                <span className="text-xs font-bold text-white block">Tự động phát (Auto Play)</span>
                <span className="text-[10px] text-text-secondary mt-0.5 block font-semibold">
                  Tự động phát video ngay khi tải xong trang trình phát.
                </span>
              </div>
              <button onClick={() => toggle('autoPlay')}>
                {autoPlay ? (
                  <ToggleRight className="w-8 h-8 text-accent" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-neutral-600" />
                )}
              </button>
            </div>

            {/* Auto Next */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/30 border border-neutral-900 flex-wrap sm:flex-nowrap gap-2">
              <div>
                <span className="text-xs font-bold text-white block">Tự động chuyển tập (Auto Next)</span>
                <span className="text-[10px] text-text-secondary mt-0.5 block font-semibold">
                  Tự động chuyển sang tập tiếp theo khi xem xong tập hiện tại.
                </span>
              </div>
              <button onClick={() => toggle('autoNext')}>
                {autoNext ? (
                  <ToggleRight className="w-8 h-8 text-accent" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-neutral-600" />
                )}
              </button>
            </div>

            {/* Skip Intro */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/30 border border-neutral-900 flex-wrap sm:flex-nowrap gap-2">
              <div>
                <span className="text-xs font-bold text-white block">Bỏ qua mở đầu (Skip Intro)</span>
                <span className="text-[10px] text-text-secondary mt-0.5 block font-semibold">
                  Tự động bỏ qua nhạc giới thiệu phim (nếu có dữ liệu nhãn thời gian).
                </span>
              </div>
              <button onClick={() => toggle('skipIntro')}>
                {skipIntro ? (
                  <ToggleRight className="w-8 h-8 text-accent" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-neutral-600" />
                )}
              </button>
            </div>

            {/* Default Quality */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/30 border border-neutral-900 flex-wrap sm:flex-nowrap gap-2">
              <div>
                <span className="text-xs font-bold text-white block">Độ phân giải mặc định</span>
                <span className="text-[10px] text-text-secondary mt-0.5 block font-semibold">
                  Chất lượng ưu tiên khi bắt đầu tải luồng phát.
                </span>
              </div>
              <select
                value={quality}
                onChange={(e) => setSetting('quality', e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
              >
                <option value="Auto">Tự Động (Auto)</option>
                <option value="1080p">1080p (Full HD)</option>
                <option value="720p">720p (HD)</option>
                <option value="480p">480p (SD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Info / Reset section */}
        <div className="border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-wider">
            <Info className="w-4 h-4 text-accent" />
            <span>Phiên bản v1.0.0 (Cineva Core)</span>
          </div>

          <button
            onClick={() => {
              if (confirm('Bạn có muốn đặt lại toàn bộ cài đặt về mặc định?')) {
                resetSettings();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold text-white transition-all duration-200 tv-focusable"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đặt lại cài đặt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
