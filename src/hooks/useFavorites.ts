import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteItem {
  id: string; // kkphimId or slug
  name: string;
  origin_name?: string;
  slug: string;
  posterUrl?: string;
  addedAt: string;
}

interface FavoritesState {
  items: FavoriteItem[];
  addFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      addFavorite: (item) => {
        const items = get().items;
        if (items.some((i) => i.id === item.id)) return;
        set({
          items: [...items, { ...item, addedAt: new Date().toISOString() }],
        });
      },
      removeFavorite: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },
      isFavorite: (id) => {
        return get().items.some((item) => item.id === id);
      },
      toggleFavorite: (item) => {
        const isFav = get().isFavorite(item.id);
        if (isFav) {
          get().removeFavorite(item.id);
        } else {
          get().addFavorite(item);
        }
      },
    }),
    {
      name: 'cineva-favorites', // LocalStorage item key
    }
  )
);
