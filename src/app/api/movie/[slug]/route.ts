import { NextResponse } from 'next/server';
import { getMovieDetail } from '@/lib/kkphim';
import { getTMDBEnrichedData } from '@/lib/tmdb';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const kkData = await getMovieDetail(slug);
    if (!kkData) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    const movieId = kkData.movie._id;
    let enriched: any = null;

    // 1. Try Prisma caching
    try {
      const cached = await prisma.movieCache.findUnique({
        where: { kkphimId: movieId },
      });
      if (cached) {
        enriched = {
          backdropUrl: cached.backdropUrl || undefined,
          posterUrl: cached.posterUrl || undefined,
          rating: cached.rating || undefined,
          overview: cached.overview || undefined,
          cast: cached.cast ? (cached.cast as string[]) : undefined,
          genres: cached.genres ? (cached.genres as string[]) : undefined,
        };
      }
    } catch (dbError) {
      // Graceful fallback if database is offline or un-migrated
      console.warn('Prisma cache lookup skipped (DB offline):', dbError);
    }

    // 2. Fetch from TMDB if not cached and API key exists
    if (!enriched && process.env.TMDB_API_KEY) {
      const tmdbData = await getTMDBEnrichedData(
        kkData.movie.name,
        kkData.movie.year,
        kkData.movie.type
      );
      if (tmdbData) {
        enriched = tmdbData;

        // 3. Write cache back to Prisma asynchronously
        try {
          await prisma.movieCache.upsert({
            where: { kkphimId: movieId },
            update: {},
            create: {
              kkphimId: movieId,
              title: kkData.movie.name,
              backdropUrl: tmdbData.backdropUrl || null,
              posterUrl: tmdbData.posterUrl || null,
              overview: tmdbData.overview || null,
              cast: tmdbData.cast ? (tmdbData.cast as Prisma.InputJsonValue) : Prisma.JsonNull,
              genres: tmdbData.genres ? (tmdbData.genres as Prisma.InputJsonValue) : Prisma.JsonNull,
              rating: tmdbData.rating || null,
              year: kkData.movie.year || null,
              episodesCount: kkData.episodes?.length || 0,
            },
          });
        } catch (dbError) {
          console.warn('Prisma cache save skipped (DB offline):', dbError);
        }
      }
    }

    return NextResponse.json({
      ...kkData,
      enriched: enriched || null,
    });
  } catch (error: any) {
    console.error('API /api/movie/[slug] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
