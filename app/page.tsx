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
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null); // 現在地を保持
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  // アイコンの状態管理
  const [toiletIcon, setToiletIcon] = useState<any>(null);
  const [userIcon, setUserIcon] = useState<any>(null);

  // トイレスポット（周辺にたくさん表示できるように増量！）
  const [toiletSpots, setToiletSpots] = useState([
    { id: 1, lat: 35.6816, lng: 139.7671, name: '東京駅ナカの聖域トイレ', address: '東京都千代田区丸の内1丁目' },
    { id: 2, lat: 35.6850, lng: 139.7100, name: '神聖な個室 A', address: '東京都新宿区西新宿' },
    { id: 3, lat: 35.6750, lng: 139.7700, name: '隠れ家的な個室 B', address: '東京都中央区銀座' },
  ]);

  useEffect(() => {
    setIsClient(true);

    import('leaflet').then((L) => {
      // トイレ用カスタムアイコン（アースカラー・深緑）
      const tIcon = L.divIcon({
        className: 'custom-toilet-marker',
        html: `
          <div style="
            background-color: #2F855A; 
            color: white; 
            width: 38px; 
            height: 38px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 18px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid #ffffff;
            font-weight: bold;
          ">🚻</div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -19],
      });
      setToiletIcon(tIcon);

      // 現在地用カスタムアイコン（安心のブルー・パルス風）
      const uIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="
            background-color: #3182CE; 
            color: white; 
            width: 32px; 
            height: 32px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 16px; 
            box-shadow: 0 0 0 6px rgba(49,130,206,0.3);
            border: 2px solid #ffffff;
            font-weight: bold;
          ">📍</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });
      setUserIcon(uIcon);
    });
  }, []);

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
        
        const currentCoord: [number, number] = [latitude, longitude];
        setCoords(currentCoord);
        setCurrentLocation(currentCoord); // 現在地をセット！
        setMapKey((prev) => prev + 1);

        // 現在地周辺にたっぷり（5件以上）のトイレスポットを自動生成！
        const nearbySpots = [
          { id: 101, lat: latitude + 0.0015, lng: longitude + 0.002, name: '駅前ビルの綺麗すぎる個室', address: '現在地北側ビル1階' },
          { id: 102, lat: latitude - 0.002, lng: longitude - 0.0015, name: '静寂の隠れ家トイレ', address: '裏路地の落ち着いた空間' },
          { id: 103, lat: latitude + 0.003, lng: longitude - 0.0025, name: 'ウォシュレット完備の聖地', address: '大通り沿い商業施設' },
          { id: 104, lat: latitude - 0.001, lng: longitude + 0.003, name: '24時間安心の個室スペース', address: '公園横の公衆トイレ' },
          { id: 105, lat: latitude + 0.0025, lng: longitude + 0.001, name: 'プレミアムリフレッシュ個室', address: 'ホテル1階ロビー奥' },
        ];
        setToiletSpots(nearbySpots);

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

  return (
    <main style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#FDFBF7', minHeight: '100vh' }}>
      <h1 style={{ color: '#2F855A', fontSize: '24px', margin: '0 0 8px 0' }}>『トイレ巡礼記』</h1>
      <p style={{ fontSize: '13px', color: '#666', margin: '0 0 20px 0' }}>偏愛toolシリーズ - 日本全国 聖なる個室検索</p>

      <button
        onClick={handleGetLocation}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#2F855A',
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
      <div style={{ margin: '15px auto', maxWidth: '800px', textAlign: 'left', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '14px', color: '#2F855A', margin: '0 0 10px 0' }}>🚻 周辺の聖域トイレ ({toiletSpots.length}件)</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#444' }}>
          {toiletSpots.map((spot) => (
            <li key={spot.id} style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <strong>{spot.name}</strong> <span style={{ color: '#666', fontSize: '12px' }}>({spot.address})</span>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#D69E2E',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '15px',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                🗺️ ここへナビする
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Leafletを使ったインタラクティブな地図エリア */}
      <div style={{ width: '100%', maxWidth: '800px', height: '480px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        {isClient && toiletIcon && userIcon && (
          <MapContainer key={mapKey} center={coords} zoom={15} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* 1. 現在地マーカーを表示 */}
            {currentLocation && (
              <Marker position={currentLocation} icon={userIcon}>
                <Popup>
                  <strong>📍 あなたの現在地</strong><br />ここから出発！
                </Popup>
              </Marker>
            )}

            {/* 2. 周辺のトイレスポットのピンをすべて表示 */}
            {toiletSpots.map((spot) => (
              <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={toiletIcon}>
                <Popup>
                  <strong>{spot.name}</strong><br />
                  {spot.address}<br /><br />
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#2B6CB0', fontWeight: 'bold', textDecoration: 'underline' }}
                  >
                    🗺️ Googleマップでナビを開く
                  </a>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </main>
  );
}