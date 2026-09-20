import './globals.css';
import 'leaflet/dist/leaflet.css';

export const metadata = {
  title: '『トイレ巡礼記』 - 偏愛toolシリーズ',
  description: '日本国内の聖なる個室（トイレ）を探す、究極の駆け込みナビゲーションアプリ。',
  openGraph: {
    title: '『トイレ巡礼記』 - 偏愛toolシリーズ',
    description: '1分1秒を争うあなたへ。日本全国のトイレを今すぐ捜索！',
    siteName: 'トイレ巡礼記',
    images: [
      {
        url: '/toilet.png',
        width: 800,
        height: 600,
        alt: 'トイレ巡礼記 アイコン',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}