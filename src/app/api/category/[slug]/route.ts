import { NextResponse } from 'next/server';
import { getCategoryList, getLatestUpdates } from '@/lib/kkphim';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);

  try {
    if (slug === 'phim-moi-cap-nhat') {
      const data = await getLatestUpdates(page);
      return NextResponse.json(data);
    }

    if (['phim-bo', 'phim-le', 'hoat-hinh', 'tv-shows'].includes(slug)) {
      const data = await getCategoryList(slug as any, page);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Danh mục không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    console.error(`API /api/category/${slug} error:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
