export interface KKMovieShort {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  thumb_url: string;
  poster_url: string;
  year: number;
  quality?: string;
  lang?: string;
  episode_current?: string;
  category?: Array<{ name: string; slug: string }>;
  country?: Array<{ name: string; slug: string }>;
}

export interface KKMovieDetail extends KKMovieShort {
  alternative_names?: string[];
  content: string;
  type: string;
  status: string;
  trailer_url?: string;
  time: string;
  episode_total: string;
  actor: string[];
  director: string[];
  view: number;
}

export interface KKEpisodeData {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface KKEpisodeServer {
  server_name: string;
  server_data: KKEpisodeData[];
}

export interface KKDetailResponse {
  status: boolean;
  msg?: string;
  movie: KKMovieDetail;
  episodes: KKEpisodeServer[];
}

const BASE_URL = process.env.KKPHIM_API_URL || 'https://ophim1.com';
const IMAGE_BASE_URL = 'https://img.ophim.live/uploads/movies';

export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/${path}`;
}

export async function getLatestUpdates(page: number = 1): Promise<{
  items: KKMovieShort[];
  pagination: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}> {
  try {
    const res = await fetch(`${BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`, {
      next: { revalidate: 300 }, // Cache for 5 mins
    });
    if (!res.ok) throw new Error('Failed to fetch updates');
    const data = await res.json();
    return {
      items: data.items || [],
      pagination: {
        totalItems: data.pagination?.totalItems || 0,
        totalItemsPerPage: data.pagination?.totalItemsPerPage || 24,
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
      },
    };
  } catch (error) {
    console.error('getLatestUpdates error:', error);
    return { items: [], pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: 1, totalPages: 1 } };
  }
}

export async function getMovieDetail(slug: string): Promise<KKDetailResponse | null> {
  try {
    const res = await fetch(`${BASE_URL}/phim/${slug}`, {
      next: { revalidate: 600 }, // Cache for 10 mins
    });
    if (!res.ok) return null;
    const data: KKDetailResponse = await res.json();
    if (!data.status) return null;
    return data;
  } catch (error) {
    console.error(`getMovieDetail error for ${slug}:`, error);
    return null;
  }
}

export async function searchMovies(
  keyword: string,
  page: number = 1,
  limit: number = 24
): Promise<{
  items: KKMovieShort[];
  pagination: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
  };
}> {
  try {
    const encodedKeyword = encodeURIComponent(keyword);
    const res = await fetch(`${BASE_URL}/v1/api/tim-kiem?keyword=${encodedKeyword}&limit=${limit}&page=${page}`, {
      next: { revalidate: 180 }, // Cache for 3 mins
    });
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    if (!data.status || !data.data) {
      return { items: [], pagination: { totalItems: 0, totalItemsPerPage: limit, currentPage: page } };
    }
    return {
      items: data.data.items || [],
      pagination: {
        totalItems: data.data.params?.pagination?.totalItems || 0,
        totalItemsPerPage: data.data.params?.pagination?.totalItemsPerPage || limit,
        currentPage: data.data.params?.pagination?.currentPage || page,
      },
    };
  } catch (error) {
    console.error('searchMovies error:', error);
    return { items: [], pagination: { totalItems: 0, totalItemsPerPage: limit, currentPage: page } };
  }
}

export async function getCategoryList(
  categoryType: 'phim-bo' | 'phim-le' | 'hoat-hinh' | 'tv-shows',
  page: number = 1
): Promise<{
  items: KKMovieShort[];
  titlePage: string;
  pagination: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
  };
}> {
  try {
    const res = await fetch(`${BASE_URL}/v1/api/danh-sach/${categoryType}?page=${page}`, {
      next: { revalidate: 600 }, // Cache for 10 mins
    });
    if (!res.ok) throw new Error('Category fetch failed');
    const data = await res.json();
    if (!data.status || !data.data) {
      return { items: [], titlePage: '', pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: page } };
    }
    return {
      items: data.data.items || [],
      titlePage: data.data.titlePage || '',
      pagination: {
        totalItems: data.data.params?.pagination?.totalItems || 0,
        totalItemsPerPage: data.data.params?.pagination?.totalItemsPerPage || 24,
        currentPage: data.data.params?.pagination?.currentPage || page,
      },
    };
  } catch (error) {
    console.error(`getCategoryList error for ${categoryType}:`, error);
    return { items: [], titlePage: '', pagination: { totalItems: 0, totalItemsPerPage: 24, currentPage: page } };
  }
}
