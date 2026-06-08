import React from 'react';
import { notFound } from 'next/navigation';
import { getCategoryList, getLatestUpdates } from '@/lib/kkphim';
import CategoryGrid from '@/components/category-grid';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const validSlugs = ['phim-bo', 'phim-le', 'hoat-hinh', 'tv-shows', 'phim-moi-cap-nhat'];
  if (!validSlugs.includes(slug)) {
    notFound();
  }

  let title = 'Danh sách phim';
  let description = 'Khám phá kho phim chất lượng cao Vietsub';
  let items: any[] = [];
  let totalPages = 100;

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
    <div className="flex flex-col w-full pb-10 animate-fade-in-up">
      <div className="border-b border-white/5 pb-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">{title}</h1>
        <p className="text-xs text-text-muted mt-1 font-medium">{description}</p>
      </div>

      {items.length > 0 ? (
        <CategoryGrid initialItems={items} slug={slug} totalPages={totalPages} />
      ) : (
        <div className="text-center text-text-muted py-16 glass-card rounded-2xl">
          Đang cập nhật danh mục phim. Vui lòng quay lại sau.
        </div>
      )}
    </div>
  );
}
