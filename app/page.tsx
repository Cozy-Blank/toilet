'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Leafletの地図コンポーネントを動的に読み込む（SSR対策）
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

export default function Home() {
  const [coords, setCoords] = useState<[number, number]>([35.6812, 139.7671]); // 初期値：東京駅
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(0); // 地図を強制的に再描画するためのキー

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 登録されたトイレのスポットデータ
  const toiletSpots = [
    { id: 1, lat: 35.6816, lng: 139.7671, name: '東京駅ナカの聖域トイレ' },
    { id: 2, lat: 35.6850, lng: 139.7100, name: '神聖な個室 A' },
    { id: 3, lat: 35.6750, lng: 139.7700, name: '隠れ家的な個室 B' },
  ];

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('お使いのブラウザは位置情報に対応していません。');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('取得した現在地:', latitude, longitude);
        setCoords([latitude, longitude]); // 座標を現在地に更新！
        setMapKey((prev) => prev + 1);    // 地図のキーを変更して強制的に再描画！
        setLoading(false);
      },
      (error) => {
        console.error('位置情報の取得エラー:', error);
        alert('現在地を取得できませんでした。ブラウザの位置情報許可（アドレスバーの鍵マーク等）を確認してください。');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

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

      {/* トイレスポット一覧 */}
      <div style={{ margin: '15px auto', maxWidth: '800px', textAlign: 'left', background: '#fff', padding: '10px 15px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '14px', color: '#1E293B', margin: '0 0 8px 0' }}>🚻 周辺の登録トイレ ({toiletSpots.length}件)</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#444' }}>
          {toiletSpots.map((spot) => (
            <li key={spot.id} style={{ margin: '4px 0' }}>
              <strong>{spot.name}</strong> （緯度: {spot.lat}, 経度: {spot.lng}）
            </li>
          ))}
        </ul>
      </div>

      {/* Leafletを使ったインタラクティブな地図エリア（keyを使って強制再描画） */}
      <div style={{ width: '100%', maxWidth: '800px', height: '480px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        {isClient && (
          <MapContainer key={mapKey} center={coords} zoom={15} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* 各トイレスポットにピン（マーカー）を立てる */}
            {toiletSpots.map((spot) => (
              <Marker key={spot.id} position={[spot.lat, spot.lng]}>
                <Popup>
                  <strong>{spot.name}</strong><br />きれいな個室です🚻
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </main>
  );
}