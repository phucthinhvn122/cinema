import { NextResponse } from 'next/server';
import { searchMovies } from '@/lib/kkphim';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);

    if (!query) {
      return NextResponse.json({ items: [], pagination: { totalItems: 0, totalItemsPerPage: limit, currentPage: page } });
    }

    const data = await searchMovies(query, page, limit);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API /api/search error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
