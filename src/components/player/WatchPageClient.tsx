'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CustomVideoPlayer from './CustomVideoPlayer';

interface WatchPageClientProps {
  streamUrl: string;
  movieTitle: string;
  movieId: string;
  episodeId: string;
  episodeName: string;
  posterUrl?: string;
  nextEpisodeSlug?: string;
  activeServerIdx: number;
}

export default function WatchPageClient({
  streamUrl,
  movieTitle,
  movieId,
  episodeId,
  episodeName,
  posterUrl,
  nextEpisodeSlug,
  activeServerIdx,
}: WatchPageClientProps) {
  const router = useRouter();

  const handleNext = () => {
    if (nextEpisodeSlug) {
      router.push(`/watch/${movieId}?ep=${nextEpisodeSlug}&server=${activeServerIdx}`);
    }
  };

  return (
    <CustomVideoPlayer
      streamUrl={streamUrl}
      movieTitle={movieTitle}
      movieId={movieId}
      episodeId={episodeId}
      episodeName={episodeName}
      posterUrl={posterUrl}
      hasNextEpisode={!!nextEpisodeSlug}
      onNextEpisode={handleNext}
    />
  );
}
