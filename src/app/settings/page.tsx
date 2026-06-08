'use client';

import React, { useEffect, useState } from 'react';
import { useDeviceSettings } from '@/hooks/useDeviceSettings';
import { ToggleLeft, ToggleRight, Settings, Info, RefreshCw, Tv, Gauge, SkipForward, Zap, Monitor, Globe } from 'lucide-react';
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
        <div className="border-b border-white/5 pb-6 mb-8">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Cài đặt</h1>
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

  const SettingRow = ({
    icon: Icon,
    title,
    description,
    active,
    onToggle,
    children,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    active: boolean;
    onToggle?: () => void;
    children?: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/5 text-accent">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-bold text-white block">{title}</span>
          <span className="text-[10px] text-text-muted mt-0.5 block leading-relaxed">{description}</span>
        </div>
      </div>
      {onToggle ? (
        <button onClick={onToggle} className="flex-shrink-0 ml-4">
          {active ? (
            <ToggleRight className="w-8 h-8 text-accent" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-text-muted" />
          )}
        </button>
      ) : (
        children
      )}
    </div>
  );

  return (
    <div className="flex flex-col w-full pb-20 animate-fade-in-up">
      <div className="border-b border-white/5 pb-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Cài đặt hệ thống</h1>
        <p className="text-xs text-text-muted mt-1 font-medium">
          Cấu hình trình phát video, phụ đề và chế độ Smart TV
        </p>
      </div>

      <div className="max-w-2xl glass-card rounded-2xl p-5 md:p-8 space-y-4">
        {/* TV Mode */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
            <Tv className="w-3.5 h-3.5 text-accent" />
            <span>Smart TV & Điều hướng</span>
          </h3>
          <SettingRow
            icon={Tv}
            title="Chế độ TV (TV Mode)"
            description="Kích hoạt phím điều hướng (D-Pad) để di chuyển và chọn các mục mà không cần chuột. Phù hợp cho Android TV và điều khiển cầm tay."
            active={tvMode}
            onToggle={() => toggle('tvMode')}
          />
        </div>

        {/* Playback */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-accent" />
            <span>Cấu hình trình phát</span>
          </h3>
          <div className="space-y-2">
            <SettingRow
              icon={Zap}
              title="Tự động phát (Auto Play)"
              description="Tự động phát video ngay khi tải xong trang."
              active={autoPlay}
              onToggle={() => toggle('autoPlay')}
            />
            <SettingRow
              icon={SkipForward}
              title="Tự động chuyển tập (Auto Next)"
              description="Tự động chuyển sang tập tiếp theo khi xem xong."
              active={autoNext}
              onToggle={() => toggle('autoNext')}
            />
            <SettingRow
              icon={Gauge}
              title="Bỏ qua mở đầu (Skip Intro)"
              description="Tự động bỏ qua nhạc giới thiệu phim."
              active={skipIntro}
              onToggle={() => toggle('skipIntro')}
            />
            <SettingRow
              icon={Monitor}
              title="Chất lượng mặc định"
              description="Chất lượng ưu tiên khi bắt đầu tải luồng phát."
              active={false}
            >
              <select
                value={quality}
                onChange={(e) => setSetting('quality', e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent/50"
              >
                <option value="Auto">Tự Động</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
              </select>
            </SettingRow>
            <SettingRow
              icon={Globe}
              title="Phụ đề mặc định"
              description="Ngôn ngữ phụ đề ưu tiên."
              active={false}
            >
              <select
                value={subtitle}
                onChange={(e) => setSetting('subtitle', e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent/50"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </SettingRow>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-accent" />
            <span>Cineva v1.0.0</span>
          </div>
          <button
            onClick={() => {
              if (confirm('Bạn có muốn đặt lại toàn bộ cài đặt về mặc định?')) {
                resetSettings();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đặt lại cài đặt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
