'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Clock } from 'lucide-react';
import { useWatchHistory, HistoryItem } from '@/hooks/useWatchHistory';
import { formatTime } from '@/lib/utils';

interface DetailResumeButtonProps {
  movieId: string;
  defaultEpisodeSlug: string;
}

export default function DetailResumeButton({ movieId, defaultEpisodeSlug }: DetailResumeButtonProps) {
  const { getProgress } = useWatchHistory();
  const [progress, setProgress] = useState<HistoryItem | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProgress(getProgress(movieId));
  }, [movieId, getProgress]);

  if (!mounted) return null;

  const targetEpisode = progress ? progress.episodeId : defaultEpisodeSlug;
  const watchUrl = `/watch/${movieId}?ep=${targetEpisode}`;

  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <Link
        href={watchUrl}
        className="magnetic-btn flex items-center justify-center gap-2.5 bg-accent hover:bg-accent-400 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-glow-accent transition-all"
      >
        <Play className="w-5 h-5 fill-current" />
        <span>{progress ? 'Xem tiếp' : 'Xem ngay'}</span>
      </Link>

      {progress && (
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-medium">
          <Clock className="w-3 h-3" />
          <span>
            {progress.episodeName} • {formatTime(progress.currentTime)} ({Math.round(progress.percentage)}%)
          </span>
        </div>
      )}
    </div>
  );
}
