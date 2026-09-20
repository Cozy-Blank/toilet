'use client';

import { useState } from 'react';

export default function Home() {
  const [coords, setCoords] = useState({ lat: 35.6812, lng: 139.7671 });
  const [loading, setLoading] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('お使いのブラウザは位置情報に対応していません。');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLoading(false);
      },
      (error) => {
        console.error('位置情報の取得エラー:', error);
        alert('現在地を取得できませんでした。ブラウザの位置情報許可を確認してください。');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.01}%2C${coords.lat - 0.008}%2C${coords.lng + 0.01}%2C${coords.lat + 0.008}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;

  return (
    <main style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#FDFBF7', minHeight: '100vh' }}>
      <h1 style={{ color: '#C53030', fontSize: '24px', margin: '0 0 8px 0' }}>『トイレ巡礼記』</h1>
      <p style={{ fontSize: '13px', color: '#666', margin: '0 0 20px 0' }}>偏愛toolシリーズ - 日本全国 聖なる個室検索</p>

      <button
        onClick={handleGetLocation}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#1E293B',
          color: '#ffffff',
          border: 'none',
          borderRadius: '25px',
          cursor: loading ? 'wait' : 'pointer',
          fontWeight: 'bold',
          fontSize: '15px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        {loading ? '📍 現在地を取得中...' : '📍 現在地から周辺を探す'}
      </button>

      <div style={{ width: '100%', maxWidth: '800px', height: '480px', margin: '20px auto 0 auto', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <iframe title="Toilet Map" width="100%" height="100%" src={mapUrl} style={{ border: 0 }} />
      </div>
    </main>
  );
}