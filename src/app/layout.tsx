import type { Metadata } from 'next';
import './globals.css';
import TVNavigationProvider from '@/components/tv/TVNavigationProvider';
import LayoutShell from '@/components/layout-shell';

export const metadata: Metadata = {
  title: 'Cineva - Premium Movie & Anime Streaming Platform',
  description: 'Trải nghiệm xem phim điện ảnh, phim truyền hình và anime vietsub chất lượng cao hoàn toàn miễn phí. Hỗ trợ xem trên di động, máy tính bảng và TV thông minh.',
  keywords: 'phim, xem phim, anime, vietsub, thuyet minh, phim moi, phim bo, phim le, cineva, streaming, hls, tv mode',
  authors: [{ name: 'Cineva Team' }],
  openGraph: {
    type: 'website',
    title: 'Cineva - Premium Movie & Anime Streaming Platform',
    description: 'Trải nghiệm xem phim điện ảnh, phim truyền hình và anime vietsub chất lượng cao.',
    siteName: 'Cineva',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cineva - Premium Movie & Anime Streaming Platform',
    description: 'Trải nghiệm xem phim điện ảnh, phim truyền hình và anime vietsub chất lượng cao.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-background text-white select-none">
        <TVNavigationProvider>
          <LayoutShell>{children}</LayoutShell>
        </TVNavigationProvider>
      </body>
    </html>
  );
}
