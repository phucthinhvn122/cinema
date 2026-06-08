'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
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

  // Resolve link destination: resume progress or start from episode 1
  const targetEpisode = progress ? progress.episodeId : defaultEpisodeSlug;
  const watchUrl = `/watch/${movieId}?ep=${targetEpisode}`;

  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <Link
        id="detail-play-btn"
        href={watchUrl}
        className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 text-white font-bold text-sm px-8 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/40 tv-focusable"
      >
        <Play className="w-5 h-5 fill-current text-white" />
        <span>{progress ? 'Xem tiếp' : 'Xem ngay'}</span>
      </Link>
      
      {progress && (
        <span className="text-[10px] text-text-secondary font-semibold text-center sm:text-left">
          Đang xem: {progress.episodeName} tại {formatTime(progress.currentTime)} ({Math.round(progress.percentage)}%)
        </span>
      )}
    </div>
  );
}
