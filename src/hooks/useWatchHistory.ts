import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryItem {
  movieId: string; // Movie slug
  movieTitle: string;
  posterUrl?: string;
  episodeId: string; // Episode slug
  episodeName: string; // Episode name (e.g. "Tập 1", "Full")
  currentTime: number; // Playback time in seconds
  duration: number; // Duration in seconds
  percentage: number; // Percentage watched
  quality?: string;
  subtitle?: string;
  server?: string;
  lastWatched: string;
}

interface WatchHistoryState {
  history: HistoryItem[];
  saveProgress: (progress: Omit<HistoryItem, 'lastWatched' | 'percentage'>) => void;
  getProgress: (movieId: string) => HistoryItem | undefined;
  removeProgress: (movieId: string) => void;
  clearHistory: () => void;
}

export const useWatchHistory = create<WatchHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      saveProgress: (progress) => {
        const history = get().history;
        const percentage = progress.duration > 0 ? (progress.currentTime / progress.duration) * 100 : 0;
        
        // Remove existing item to put the updated one on top of the list
        const filteredHistory = history.filter((item) => item.movieId !== progress.movieId);
        
        const newItem: HistoryItem = {
          ...progress,
          percentage,
          lastWatched: new Date().toISOString(),
        };
        
        set({
          history: [newItem, ...filteredHistory].slice(0, 50), // Limit history items to 50
        });
      },
      getProgress: (movieId) => {
        return get().history.find((item) => item.movieId === movieId);
      },
      removeProgress: (movieId) => {
        set({
          history: get().history.filter((item) => item.movieId !== movieId),
        });
      },
      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: 'cineva-watch-history',
    }
  )
);
