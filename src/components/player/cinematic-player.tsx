'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings as SettingsIcon,
  Subtitles,
  SkipForward,
  ArrowLeft,
  ChevronRight,
  Sun,
  MonitorPlay,
  Gauge,
  Sparkles,
  Cast,
  Airplay,
} from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useDeviceSettings } from '@/hooks/useDeviceSettings';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CinematicPlayerProps {
  streamUrl: string;
  movieTitle: string;
  movieId: string;
  episodeId: string;
  episodeName: string;
  posterUrl?: string;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
  servers?: Array<{ server_name: string; server_data: Array<{ name: string; slug: string; link_m3u8: string }> }>;
  activeServerIdx?: number;
  episodes?: Array<{ name: string; slug: string; link_m3u8: string }>;
  activeEpisodeSlug?: string;
}

export default function CinematicPlayer({
  streamUrl,
  movieTitle,
  movieId,
  episodeId,
  episodeName,
  posterUrl,
  onNextEpisode,
  hasNextEpisode,
}: CinematicPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { saveProgress, getProgress } = useWatchHistory();
  const { autoPlay, autoNext, skipIntro, setSetting } = useDeviceSettings();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [qualityLevels, setQualityLevels] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState('Auto');
  const [showSettings, setShowSettings] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Gesture HUD
  const [brightness, setBrightness] = useState(1);
  const [hudType, setHudType] = useState<'volume' | 'brightness' | 'seek' | null>(null);
  const [hudValue, setHudValue] = useState<string | number>('');

  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState(0);

  // 1. Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setQualityLevels([]);
    setIsBuffering(true);

    if (Hls.isSupported() && streamUrl.endsWith('.m3u8')) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        maxMaxBufferLength: 30,
        enableWorker: true,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels = data.levels.map(
          (level) => `${level.height ? level.height + 'p' : 'Alt ' + level.bitrate}`
        );
        setQualityLevels(['Auto', ...levels]);
        setIsBuffering(false);
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (hls.autoLevelEnabled) {
          setCurrentQuality('Auto');
        } else {
          const level = hls.levels[data.level];
          setCurrentQuality(level ? level.height + 'p' : 'Auto');
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data);
        }
      });
    } else {
      video.src = streamUrl;
      video.load();
      setIsBuffering(false);
      if (autoPlay) {
        video.play().catch(() => {});
      }
    }

    const prevProgress = getProgress(movieId);
    if (prevProgress && prevProgress.episodeId === episodeId && prevProgress.currentTime > 15) {
      if (prevProgress.currentTime < prevProgress.duration - 15) {
        setResumeTime(prevProgress.currentTime);
        setShowResumePrompt(true);
        setTimeout(() => setShowResumePrompt(false), 10000);
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, movieId, episodeId, autoPlay, getProgress]);

  // 2. Auto-save progress
  useEffect(() => {
    if (!isPlaying || duration === 0) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video) {
        saveProgress({
          movieId,
          movieTitle,
          posterUrl,
          episodeId,
          episodeName,
          currentTime: video.currentTime,
          duration: video.duration,
          quality: currentQuality,
          server: 'Default Server',
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, duration, movieId, movieTitle, episodeId, episodeName, currentQuality, posterUrl, saveProgress]);

  // 3. Controls timeout
  const resetControlsTimeout = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isSettingsOpen) {
        setControlsVisible(false);
        setShowSettings(false);
        setShowSpeedMenu(false);
      }
    }, 4000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, isSettingsOpen]);

  // 4. Fullscreen with auto-rotate
  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);

        // Auto-rotate on mobile
        const screenOrientation = (screen as any).orientation;
        if (screenOrientation && screenOrientation.lock) {
          await screenOrientation.lock('landscape').catch(() => {});
        }

        // iOS fallback
        const iosVideo = videoRef.current;
        if (iosVideo && (iosVideo as any).webkitEnterFullscreen) {
          (iosVideo as any).webkitEnterFullscreen();
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);

        const screenOrientation = (screen as any).orientation;
        if (screenOrientation && screenOrientation.unlock) {
          await screenOrientation.unlock().catch(() => {});
        }
      }
    } catch (e) {
      console.error('Fullscreen error:', e);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        const screenOrientation = (screen as any).orientation;
        if (screenOrientation && screenOrientation.unlock) {
          screenOrientation.unlock().catch(() => {});
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 5. Playback controls
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
    resetControlsTimeout();
  };

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    resetControlsTimeout();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * duration;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    resetControlsTimeout();
  };

  const handleProgressBarMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, pos));
    setPreviewTime(clamped * duration);
    setPreviewPosition(clamped * 100);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    const video = videoRef.current;
    if (video) {
      video.volume = val;
      video.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      video.volume = 0;
    } else {
      video.volume = volume || 0.5;
    }
  };

  const handleQualityChange = (levelStr: string) => {
    const hls = hlsRef.current;
    if (!hls) return;
    if (levelStr === 'Auto') {
      hls.currentLevel = -1;
    } else {
      const idx = qualityLevels.indexOf(levelStr) - 1;
      if (idx >= 0) hls.currentLevel = idx;
    }
    setCurrentQuality(levelStr);
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
    }
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const handleVideoEnded = () => {
    saveProgress({
      movieId,
      movieTitle,
      posterUrl,
      episodeId,
      episodeName,
      currentTime: duration,
      duration,
      quality: currentQuality,
      server: 'Default Server',
    });

    if (autoNext && hasNextEpisode && onNextEpisode) {
      onNextEpisode();
    } else {
      setIsPlaying(false);
    }
  };

  // 6. Touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    resetControlsTimeout();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current.time === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (Math.abs(dy) > Math.abs(dx)) {
      const isRightSide = touchStartRef.current.x > rect.left + rect.width / 2;
      const amount = -dy / rect.height;

      if (isRightSide) {
        const newVol = Math.max(0, Math.min(1, volume + amount));
        setVolume(newVol);
        if (videoRef.current) videoRef.current.volume = newVol;
        setHudType('volume');
        setHudValue(`${Math.round(newVol * 100)}%`);
      } else {
        const newBright = Math.max(0.1, Math.min(1, brightness + amount));
        setBrightness(newBright);
        setHudType('brightness');
        setHudValue(`${Math.round(newBright * 100)}%`);
      }
    } else {
      const amount = (dx / rect.width) * duration * 0.25;
      const targetTime = Math.max(0, Math.min(duration, currentTime + amount));
      setHudType('seek');
      setHudValue(`${formatTime(targetTime)} (${amount >= 0 ? '+' : ''}${Math.round(amount)}s)`);
    }

    touchStartRef.current.x = touch.clientX;
    touchStartRef.current.y = touch.clientY;
  };

  const handleTouchEnd = () => {
    if (hudType === 'seek' && videoRef.current) {
      const valStr = hudValue.toString().split(' ')[0];
      const parts = valStr.split(':').map(Number);
      let targetTime = 0;
      if (parts.length === 3) {
        targetTime = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else {
        targetTime = parts[0] * 60 + parts[1];
      }
      if (!isNaN(targetTime)) {
        videoRef.current.currentTime = targetTime;
      }
    }
    setTimeout(() => setHudType(null), 800);
    touchStartRef.current = { x: 0, y: 0, time: 0 };
  };

  const handleScreenDoubleTap = (e: React.MouseEvent<HTMLVideoElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const now = Date.now();
    const timeDiff = now - touchStartRef.current.time;

    if (timeDiff < 300 && touchStartRef.current.time !== 0) {
      if (x < width * 0.35) {
        seek(-10);
        setHudType('seek');
        setHudValue('-10s');
        setTimeout(() => setHudType(null), 850);
      } else if (x > width * 0.65) {
        seek(10);
        setHudType('seek');
        setHudValue('+10s');
        setTimeout(() => setHudType(null), 850);
      } else {
        togglePlay();
      }
      touchStartRef.current.time = 0;
    } else {
      touchStartRef.current.time = now;
      resetControlsTimeout();
    }
  };

  // 7. Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const upVol = Math.min(1, volume + 0.1);
          setVolume(upVol);
          if (videoRef.current) videoRef.current.volume = upVol;
          break;
        case 'ArrowDown':
          e.preventDefault();
          const downVol = Math.max(0, volume - 0.1);
          setVolume(downVol);
          if (videoRef.current) videoRef.current.volume = downVol;
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          seek(-10);
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          seek(10);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, currentTime, duration, isSettingsOpen]);

  const brightnessStyle = { filter: `brightness(${brightness})` };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = videoRef.current?.buffered?.length
    ? (videoRef.current.buffered.end(videoRef.current.buffered.length - 1) / duration) * 100
    : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden select-none outline-none group border border-white/5 shadow-cinematic"
      style={brightnessStyle}
    >
      {/* Video */}
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => {
          setIsPlaying(true);
          setIsBuffering(false);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={handleVideoEnded}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onClick={handleScreenDoubleTap}
        playsInline
        className="w-full h-full object-contain cursor-none"
      />

      {/* Buffering spinner */}
      <AnimatePresence>
        {isBuffering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20 bg-black/20"
          >
            <div className="w-12 h-12 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gesture HUD */}
      <AnimatePresence>
        {hudType && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-cinema-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center pointer-events-none min-w-[100px]"
          >
            {hudType === 'brightness' && <Sun className="w-8 h-8 text-yellow-400 mb-1" />}
            {hudType === 'volume' && <Volume2 className="w-8 h-8 text-accent mb-1" />}
            {hudType === 'seek' && <RotateCcw className="w-8 h-8 text-white mb-1" />}
            <span className="text-white text-xs font-bold font-mono">{hudValue}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className={cn(
          'absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white border border-white/10 hover:bg-black/80 transition-all duration-300',
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Resume prompt */}
      <AnimatePresence>
        {showResumePrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-6 z-25 bg-cinema-950/90 border border-accent/30 rounded-xl p-4 max-w-sm flex flex-col shadow-cinematic"
          >
            <p className="text-white text-xs font-semibold mb-3">
              Bạn đã xem tập này lúc trước. Tiếp tục từ{' '}
              <span className="text-accent font-bold font-mono">{formatTime(resumeTime)}</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = resumeTime;
                    videoRef.current.play().catch(() => {});
                  }
                  setShowResumePrompt(false);
                }}
                className="bg-accent text-white font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-accent-400 transition-colors"
              >
                Tiếp tục
              </button>
              <button
                onClick={() => setShowResumePrompt(false)}
                className="bg-white/10 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-white/15 transition-colors"
              >
                Bỏ qua
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Overlay */}
      <div
        className={cn(
          'absolute inset-0 z-20 flex flex-col justify-between transition-all duration-300 pointer-events-none',
          controlsVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Top bar */}
        <div className="player-top-gradient p-5 md:p-6 pb-10 flex justify-between items-start pointer-events-auto">
          <div className="flex flex-col">
            <h2 className="text-white text-sm font-bold tracking-wide line-clamp-1">{movieTitle}</h2>
            <p className="text-text-secondary text-[10px] font-semibold uppercase mt-0.5 tracking-wider">
              {episodeName}
            </p>
          </div>
        </div>

        {/* Center play button */}
        <div className="flex items-center justify-center flex-1">
          <button
            onClick={togglePlay}
            className={cn(
              'w-16 h-16 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white flex items-center justify-center pointer-events-auto transition-all duration-300 hover:scale-110 hover:bg-white/20',
              !controlsVisible ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
            )}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>
        </div>

        {/* Bottom bar */}
        <div className="player-gradient p-5 md:p-6 pt-12 flex flex-col pointer-events-auto">
          {/* Progress bar */}
          <div
            ref={progressBarRef}
            className="relative h-1.5 bg-white/10 rounded-full cursor-pointer mb-4 group/progress"
            onClick={handleProgressBarClick}
            onMouseMove={(e) => {
              handleProgressBarMove(e);
              setShowPreview(true);
            }}
            onMouseLeave={() => setShowPreview(false)}
          >
            {/* Buffered */}
            <div
              className="absolute h-full bg-white/15 rounded-full"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Played */}
            <div
              className="absolute h-full bg-accent rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Preview */}
            {showPreview && (
              <div
                className="absolute top-0 h-full bg-white/20 rounded-full pointer-events-none"
                style={{ width: `${previewPosition}%` }}
              />
            )}
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 6px)` }}
            />
            {/* Preview time tooltip */}
            {showPreview && (
              <div
                className="absolute -top-8 bg-cinema-950 border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded transform -translate-x-1/2"
                style={{ left: `${previewPosition}%` }}
              >
                {formatTime(previewTime)}
              </div>
            )}
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="text-white hover:text-accent transition-colors">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              {/* Skip back */}
              <button onClick={() => seek(-10)} className="text-white/70 hover:text-white transition-colors" title="Tua lại 10s">
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Next episode */}
              {hasNextEpisode && onNextEpisode && (
                <button onClick={onNextEpisode} className="text-white/70 hover:text-white transition-colors" title="Tập tiếp theo">
                  <SkipForward className="w-5 h-5" />
                </button>
              )}

              {/* Volume */}
              <div className="flex items-center gap-2 group/volume ml-1">
                <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <div className="relative w-0 group-hover/volume:w-16 transition-all duration-300 overflow-hidden">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8B5CF6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%)`,
                    }}
                  />
                </div>
              </div>

              {/* Time */}
              <span className="text-[11px] text-white/70 font-mono font-medium ml-1">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3 relative">
              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setIsSettingsOpen(!showSettings);
                    resetControlsTimeout();
                  }}
                  className="text-white/70 hover:text-white transition-colors"
                  title="Cài đặt"
                >
                  <SettingsIcon className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-10 right-0 bg-cinema-950/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 min-w-[160px] flex flex-col z-50 shadow-cinematic"
                    >
                      {/* Speed */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold text-white hover:bg-white/5 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Gauge className="w-3.5 h-3.5" />
                            Tốc độ
                          </span>
                          <span className="text-text-muted">{playbackSpeed}x</span>
                        </button>
                        {showSpeedMenu && (
                          <div className="mt-1 space-y-0.5">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                              <button
                                key={speed}
                                onClick={() => handleSpeedChange(speed)}
                                className={cn(
                                  'w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors',
                                  playbackSpeed === speed
                                    ? 'bg-accent text-white'
                                    : 'text-white/70 hover:bg-white/5'
                                )}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quality */}
                      {qualityLevels.length > 0 && (
                        <div className="border-t border-white/10 mt-1 pt-1">
                          <span className="text-[9px] font-bold text-text-muted px-3 py-1 uppercase tracking-wider block">
                            Chất lượng
                          </span>
                          {qualityLevels.map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => {
                                handleQualityChange(lvl);
                                resetControlsTimeout();
                              }}
                              className={cn(
                                'w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors',
                                currentQuality === lvl
                                  ? 'bg-accent text-white'
                                  : 'text-white/70 hover:bg-white/5'
                              )}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Skip intro */}
                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setSetting('skipIntro', !skipIntro);
                            resetControlsTimeout();
                          }}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold transition-colors',
                            skipIntro ? 'text-accent' : 'text-white/70 hover:bg-white/5'
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            Bỏ qua intro
                          </span>
                          <span className={cn('w-2 h-2 rounded-full', skipIntro ? 'bg-accent' : 'bg-white/20')} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Subtitle */}
              <div className="hidden sm:flex items-center gap-1 text-white/70 text-xs font-bold">
                <Subtitles className="w-4 h-4" />
                <span>VietSub</span>
              </div>

              {/* Cast / AirPlay */}
              <button className="hidden sm:block text-white/70 hover:text-white transition-colors" title="AirPlay / Chromecast">
                <Cast className="w-5 h-5" />
              </button>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors" title="Toàn màn hình (F)">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
