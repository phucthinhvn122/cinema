const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBEnrichedData {
  backdropUrl?: string;
  posterUrl?: string;
  rating?: number;
  overview?: string;
  cast?: string[];
  genres?: string[];
  trailerUrl?: string;
  recommendations?: Array<{
    id: string;
    name: string;
    title: string;
    posterUrl?: string;
    backdropUrl?: string;
    rating?: number;
    year?: number;
  }>;
}

export async function getTMDBEnrichedData(
  title: string,
  year?: number,
  type: string = 'movie'
): Promise<TMDBEnrichedData | null> {
  if (!TMDB_API_KEY) {
    return null;
  }

  try {
    const isTv = type === 'series' || type === 'tv' || type === 'phim-bo';
    const searchType = isTv ? 'tv' : 'movie';
    
    // Clean Vietnamese accents & metadata suffixes for TMDB match
    const cleanTitle = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ - Ph\u1ea7n \d+$/i, '')
      .replace(/ - M\u00f9a \d+$/i, '')
      .replace(/ M\u00f9a \d+$/i, '')
      .trim();

    const searchUrl = `${TMDB_BASE_URL}/search/${searchType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      cleanTitle
    )}${year ? `&year=${year}` : ''}&language=vi-VN`;

    const res = await fetch(searchUrl, { next: { revalidate: 86400 } }); // 24hr cache
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.results?.[0];

    if (!result) {
      // Search in English if Vietnamese search returned nothing
      const enSearchUrl = `${TMDB_BASE_URL}/search/${searchType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        cleanTitle
      )}${year ? `&year=${year}` : ''}&language=en-US`;
      
      const enRes = await fetch(enSearchUrl, { next: { revalidate: 86400 } });
      if (!enRes.ok) return null;
      const enData = await enRes.json();
      const enResult = enData.results?.[0];
      if (!enResult) return null;
      return await getTMDBDetails(enResult.id, searchType);
    }

    return await getTMDBDetails(result.id, searchType);
  } catch (error) {
    console.error('getTMDBEnrichedData error:', error);
    return null;
  }
}

async function getTMDBDetails(id: number, type: 'movie' | 'tv'): Promise<TMDBEnrichedData | null> {
  try {
    const detailUrl = `${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,recommendations&language=vi-VN`;
    const res = await fetch(detailUrl, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();

    const cast = data.credits?.cast?.slice(0, 10).map((c: any) => c.name) || [];
    const genres = data.genres?.map((g: any) => g.name) || [];
    const backdropUrl = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : undefined;
    const posterUrl = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : undefined;
    const rating = data.vote_average || undefined;
    const overview = data.overview || undefined;
    
    // Find youtube trailer
    const videos = data.videos?.results || [];
    const youtubeTrailer = videos.find(
      (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );
    const trailerUrl = youtubeTrailer ? `https://www.youtube.com/embed/${youtubeTrailer.key}` : undefined;

    // Map recommendations
    const recommendations = data.recommendations?.results?.slice(0, 8).map((item: any) => ({
      id: item.id.toString(),
      name: item.title || item.name,
      title: item.title || item.name,
      posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : undefined,
      backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : undefined,
      rating: item.vote_average,
      year: item.release_date 
        ? new Date(item.release_date).getFullYear() 
        : item.first_air_date 
          ? new Date(item.first_air_date).getFullYear() 
          : undefined,
    })) || [];

    return {
      backdropUrl,
      posterUrl,
      rating,
      overview,
      cast,
      genres,
      trailerUrl,
      recommendations,
    };
  } catch (error) {
    console.error('getTMDBDetails error:', error);
    return null;
  }
}
