'use client';

import dynamic from 'next/dynamic';

// Leafletのエラーを防ぐため、SSRを無効化して動的読み込み
const ToiletMap = dynamic(() => import('../components/ToiletMap'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F7F4EB' }}>
      <p style={{ color: '#C23B22', fontWeight: 'bold' }}>『トイレ巡礼記』を起動中...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main>
      <header className="header">
        <h1>『トイレ巡礼記』</h1>
        <p>偏愛toolシリーズ - 日本全国 聖なる個室検索</p>
      </header>

      <div className="map-container">
        <ToiletMap />
      </div>
    </main>
  );
}