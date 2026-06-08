'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
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
  Tv,
  SkipForward,
  ArrowLeft,
  ChevronRight,
  Sun
} from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useDeviceSettings } from '@/hooks/useDeviceSettings';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CustomVideoPlayerProps {
  streamUrl: string;
  movieTitle: string;
  movieId: string;
  episodeId: string;
  episodeName: string;
  posterUrl?: string;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
}

export default function CustomVideoPlayer({
  streamUrl,
  movieTitle,
  movieId,
  episodeId,
  episodeName,
  posterUrl,
  onNextEpisode,
  hasNextEpisode
}: CustomVideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { saveProgress, getProgress } = useWatchHistory();
  const { autoPlay, autoNext, setSetting } = useDeviceSettings();

  // Player States
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
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);

  // Gesture HUD states
  const [brightness, setBrightness] = useState(1); // 0 to 1
  const [hudType, setHudType] = useState<'volume' | 'brightness' | 'seek' | null>(null);
  const [hudValue, setHudValue] = useState<string | number>('');

  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  // 1. Initialize Video Stream (HLS or Native)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset player state
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setQualityLevels([]);

    if (Hls.isSupported() && streamUrl.endsWith('.m3u8')) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        maxMaxBufferLength: 30, // Limit buffer size for lower latency
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        // Parse available quality levels
        const levels = data.levels.map(
          (level) => `${level.height ? level.height + 'p' : 'Alt ' + level.bitrate}`
        );
        setQualityLevels(['Auto', ...levels]);
        
        // Auto play if configured
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
    } else {
      // Fallback to native video element support
      video.src = streamUrl;
      video.load();
      if (autoPlay) {
        video.play().catch(() => {});
      }
    }

    // 2. Playback Resume Lookup
    const prevProgress = getProgress(movieId);
    if (prevProgress && prevProgress.episodeId === episodeId && prevProgress.currentTime > 15) {
      // Allow resuming if not right at the end (e.g. within 95%)
      if (prevProgress.currentTime < prevProgress.duration - 15) {
        setResumeTime(prevProgress.currentTime);
        setShowResumePrompt(true);
        // Hide prompt after 10s
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

  // 3. Playback Progress Auto-Save (Every 5 seconds)
  useEffect(() => {
    if (!isPlaying || duration === 0) return;

    const saveInterval = setInterval(() => {
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

    return () => clearInterval(saveInterval);
  }, [isPlaying, duration, movieId, movieTitle, episodeId, episodeName, currentQuality, posterUrl, saveProgress]);

  // 4. Hide Cursor and Controls Overlay
  const resetControlsTimeout = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
        setShowQualityMenu(false);
      }
    }, 3500);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  // 5. Native Controls Bindings
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

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
    resetControlsTimeout();
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
      const idx = qualityLevels.indexOf(levelStr) - 1; // Subtract 'Auto' index offset
      if (idx >= 0) hls.currentLevel = idx;
    }
    setCurrentQuality(levelStr);
    setShowQualityMenu(false);
  };

  // 6. Fullscreen & Orientation API Controls
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
        // Lock screen orientation to landscape on mobile
        const orientation = (window.screen as any)?.orientation;
        if (orientation && orientation.lock) {
          orientation.lock('landscape').catch(() => {});
        }
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        const orientation = (window.screen as any)?.orientation;
        if (orientation && orientation.unlock) {
          orientation.unlock();
        }
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 7. Playback End Handler -> Auto Next
  const handleVideoEnded = () => {
    // Save history as completed
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

  // 8. Custom Mobile Gestures: Volume / Brightness / Double-tap Seek
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    resetControlsTimeout();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current.time === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    // Avoid triggering gestures immediately on micro-movements
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (Math.abs(dy) > Math.abs(dx)) {
      // Vertical swipe: Right side = Volume, Left side = Brightness
      const isRightSide = touchStartRef.current.x > rect.left + rect.width / 2;
      const amount = -dy / rect.height; // Upward swipe increases value

      if (isRightSide) {
        // Adjust Volume
        const newVol = Math.max(0, Math.min(1, volume + amount));
        setVolume(newVol);
        if (videoRef.current) {
          videoRef.current.volume = newVol;
        }
        setHudType('volume');
        setHudValue(`${Math.round(newVol * 100)}%`);
      } else {
        // Adjust Brightness
        const newBright = Math.max(0.1, Math.min(1, brightness + amount));
        setBrightness(newBright);
        setHudType('brightness');
        setHudValue(`${Math.round(newBright * 100)}%`);
      }
    } else {
      // Horizontal swipe: Seek/Timeline Scrubbing
      const amount = (dx / rect.width) * duration * 0.25; // Scale seeking coefficient
      const targetTime = Math.max(0, Math.min(duration, currentTime + amount));
      setHudType('seek');
      setHudValue(`${formatTime(targetTime)} (${amount >= 0 ? '+' : ''}${Math.round(amount)}s)`);
    }

    // Reset touch coordinates for relative drag motion
    touchStartRef.current.x = touch.clientX;
    touchStartRef.current.y = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (hudType === 'seek' && videoRef.current) {
      // Apply seek on touch release
      const valStr = hudValue.toString().split(' ')[0]; // Extract time string
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

    // Clear HUD overlays after brief delay
    setTimeout(() => {
      setHudType(null);
    }, 800);

    // Reset touch refs
    touchStartRef.current = { x: 0, y: 0, time: 0 };
  };

  const handleScreenDoubleTap = (e: React.MouseEvent<HTMLVideoElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    const now = Date.now();
    const timeDiff = now - touchStartRef.current.time;

    // Detect double click (within 300ms)
    if (timeDiff < 300 && touchStartRef.current.time !== 0) {
      if (x < width * 0.35) {
        // Double clicked left 35% -> Skip Back 10s
        seek(-10);
        setHudType('seek');
        setHudValue('-10s');
        setTimeout(() => setHudType(null), 850);
      } else if (x > width * 0.65) {
        // Double clicked right 35% -> Skip Forward 10s
        seek(10);
        setHudType('seek');
        setHudValue('+10s');
        setTimeout(() => setHudType(null), 850);
      } else {
        // Middle click -> Toggle play
        togglePlay();
      }
      touchStartRef.current.time = 0; // Clear
    } else {
      touchStartRef.current.time = now;
      // Single tap shows overlay controls
      resetControlsTimeout();
    }
  };

  // Keyboard Shortcuts Binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bypass when typing in search fields
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
          // Increase volume
          const upVol = Math.min(1, volume + 0.1);
          setVolume(upVol);
          if (videoRef.current) videoRef.current.volume = upVol;
          break;
        case 'ArrowDown':
          e.preventDefault();
          // Decrease volume
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, currentTime, duration]);

  // Apply Brightness Overlay directly to container
  const brightnessStyle = {
    filter: `brightness(${brightness})`,
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden select-none outline-none group border border-neutral-900 shadow-2xl"
      style={brightnessStyle}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleVideoEnded}
        onClick={handleScreenDoubleTap}
        playsInline
        className="w-full h-full object-contain cursor-none"
      />

      {/* Screen Gesture Indicator HUD Floating Overlays */}
      {hudType && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/80 backdrop-blur border border-neutral-800 rounded-2xl p-4 flex flex-col items-center justify-center pointer-events-none min-w-[100px] animate-in zoom-in-90 duration-150">
          {hudType === 'brightness' && <Sun className="w-8 h-8 text-yellow-400 mb-1" />}
          {hudType === 'volume' && <Volume2 className="w-8 h-8 text-accent mb-1" />}
          {hudType === 'seek' && <RotateCcw className="w-8 h-8 text-white mb-1" />}
          <span className="text-white text-xs font-bold font-mono">{hudValue}</span>
        </div>
      )}

      {/* Back Button (Watch screen exit trigger) */}
      <button
        onClick={() => router.back()}
        className={cn(
          'absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white border border-neutral-800 hover:bg-black/90 transition-all duration-300',
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Playback Resume Popup Prompt */}
      {showResumePrompt && (
        <div className="absolute bottom-24 left-6 z-25 bg-neutral-950/90 border border-accent/40 rounded-xl p-4 max-w-sm flex flex-col shadow-2xl shadow-accent/10 animate-in slide-in-from-bottom-6 duration-300">
          <p className="text-white text-xs font-semibold mb-2">
            Bạn đã xem tập này lúc trước. Xem tiếp từ{' '}
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
              className="bg-accent text-white font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-accent/80 transition-colors"
            >
              Tiếp tục
            </button>
            <button
              onClick={() => setShowResumePrompt(false)}
              className="bg-neutral-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      )}

      {/* Player Overlays: Controls UI */}
      <div
        className={cn(
          'absolute inset-0 z-20 flex flex-col justify-between transition-all duration-300 pointer-events-none',
          controlsVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Top Control Bar with Titles */}
        <div className="player-top-gradient p-6 pb-12 flex justify-between items-start pointer-events-auto">
          <div className="flex flex-col">
            <h2 className="text-white text-sm font-bold tracking-wide line-clamp-1">
              {movieTitle}
            </h2>
            <p className="text-text-secondary text-[10px] font-semibold uppercase mt-0.5 tracking-wider">
              {episodeName}
            </p>
          </div>
        </div>

        {/* Center Screen Play/Pause Button Indicator */}
        <div className="flex items-center justify-center flex-1">
          <button
            onClick={togglePlay}
            className={cn(
              'w-14 h-14 rounded-full bg-black/60 border border-neutral-800 text-white flex items-center justify-center pointer-events-auto transition-transform duration-200 hover:scale-110 active:scale-95',
              !controlsVisible ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
            )}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current text-white" />
            ) : (
              <Play className="w-6 h-6 fill-current text-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Control Bar */}
        <div className="player-gradient p-6 pt-16 flex flex-col pointer-events-auto">
          {/* Timeline scrub slider bar */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] text-text-secondary font-mono font-bold">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleProgressChange}
              className="flex-1 h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-accent focus:outline-none"
            />
            <span className="text-[10px] text-text-secondary font-mono font-bold">
              {formatTime(duration)}
            </span>
          </div>

          {/* Lower buttons row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play Pause */}
              <button
                onClick={togglePlay}
                className="text-text-secondary hover:text-white transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              {/* Skip forward 10s */}
              <button
                onClick={() => seek(10)}
                className="text-text-secondary hover:text-white transition-colors"
                title="Tua tới 10s"
              >
                <RotateCcw className="w-5 h-5 rotate-180" />
              </button>

              {/* Next Episode Button */}
              {hasNextEpisode && onNextEpisode && (
                <button
                  onClick={onNextEpisode}
                  className="text-text-secondary hover:text-white transition-colors flex items-center gap-0.5"
                  title="Tập tiếp theo"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              )}

              {/* Volume sliders */}
              <div className="flex items-center gap-2 group/volume ml-2">
                <button
                  onClick={toggleMute}
                  className="text-text-secondary hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-accent group-hover/volume:w-20 transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 relative">
              {/* Custom Quality Selector Menu */}
              {qualityLevels.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowQualityMenu(!showQualityMenu);
                      resetControlsTimeout();
                    }}
                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-white font-bold transition-colors"
                  >
                    <span>{currentQuality}</span>
                    <SettingsIcon className="w-4 h-4" />
                  </button>

                  {showQualityMenu && (
                    <div className="absolute bottom-8 right-0 bg-neutral-950 border border-neutral-800 rounded-xl p-2 min-w-[120px] flex flex-col z-40 shadow-2xl animate-in slide-in-from-bottom-2 duration-150">
                      <span className="text-[9px] font-bold text-text-muted px-2 py-1 uppercase tracking-wider">
                        Độ Phân Giải
                      </span>
                      {qualityLevels.map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => handleQualityChange(lvl)}
                          className={cn(
                            'text-left text-[11px] font-bold px-2 py-1.5 rounded-lg transition-colors',
                            currentQuality === lvl
                              ? 'bg-accent text-white'
                              : 'text-text-secondary hover:bg-neutral-900 hover:text-white'
                          )}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Subtitle Label (Defaults to VietSub) */}
              <div className="flex items-center gap-1 text-xs text-text-secondary font-bold">
                <Subtitles className="w-4 h-4" />
                <span>VietSub</span>
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="text-text-secondary hover:text-white transition-colors"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
