import React from 'react';
import { notFound } from 'next/navigation';
import { getCategoryList, getLatestUpdates } from '@/lib/kkphim';
import CategoryGrid from '@/components/category-grid';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300; // Cache lists for 5 minutes

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Verify slug validity
  const validSlugs = ['phim-bo', 'phim-le', 'hoat-hinh', 'tv-shows', 'phim-moi-cap-nhat'];
  if (!validSlugs.includes(slug)) {
    notFound();
  }

  // Define display headings
  let title = 'Danh sách phim';
  let description = 'Khám phá kho phim chất lượng cao Vietsub';
  let items: any[] = [];
  let totalPages = 100; // Default buffer total pages

  // Fetch initial page data
  if (slug === 'phim-moi-cap-nhat') {
    title = 'Phim Mới Cập Nhật';
    description = 'Danh sách phim điện ảnh và anime vừa được cập nhật tập mới nhất';
    const data = await getLatestUpdates(1);
    items = data.items;
    totalPages = data.pagination?.totalPages || 100;
  } else {
    let catType: 'phim-bo' | 'phim-le' | 'hoat-hinh' | 'tv-shows' = 'phim-bo';
    if (slug === 'phim-le') {
      catType = 'phim-le';
      title = 'Phim Lẻ Đặc Sắc';
      description = 'Tuyển tập phim rạp, phim lẻ lôi cuốn từ mọi quốc gia';
    } else if (slug === 'hoat-hinh') {
      catType = 'hoat-hinh';
      title = 'Thế giới Anime';
      description = 'Khám phá các bộ hoạt hình Anime hấp dẫn mới nhất từ Nhật Bản';
    } else if (slug === 'tv-shows') {
      catType = 'tv-shows';
      title = 'TV Shows Truyền Hình';
      description = 'Chương trình truyền hình thực tế và truyền hình ăn khách';
    } else {
      title = 'Phim Bộ Mới Nhất';
      description = 'Các bộ phim truyền hình dài tập đặc sắc cập nhật liên tục';
    }

    const data = await getCategoryList(catType, 1);
    items = data.items;
    totalPages = Math.ceil((data.pagination?.totalItems || 100) / 24);
  }

  return (
    <div className="flex flex-col w-full pb-10 animate-in fade-in duration-300">
      {/* Category Header Title */}
      <div className="border-b border-neutral-900 pb-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-white">
          {title}
        </h1>
        <p className="text-xs text-text-secondary mt-1 font-medium">
          {description}
        </p>
      </div>

      {/* Grid containing paginated movies */}
      {items.length > 0 ? (
        <CategoryGrid initialItems={items} slug={slug} totalPages={totalPages} />
      ) : (
        <div className="text-center text-text-secondary py-16 bg-card border border-neutral-900 rounded-2xl">
          Đang cập nhật danh mục phim. Vui lòng quay lại sau!
        </div>
      )}
    </div>
  );
}
