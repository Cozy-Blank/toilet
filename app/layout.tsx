import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'トイレ巡礼記',
  description: '日本全国 聖なる個室検索',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}