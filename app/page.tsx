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
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const [convenienceIcon, setConvenienceIcon] = useState<any>(null);
  const [parkIcon, setParkIcon] = useState<any>(null);
  const [supermarketIcon, setSupermarketIcon] = useState<any>(null);
  const [publicIcon, setPublicIcon] = useState<any>(null);
  const [userIcon, setUserIcon] = useState<any>(null);

  // 【完全網羅】コンビニ・公園・スーパー・公共施設の聖域トイレスポット一覧
  const [toiletSpots, setToiletSpots] = useState([
    { id: 1, lat: 35.6812, lng: 139.7671, name: '東京都庁 第一本庁舎 展望トイレ', category: '公共施設', address: '東京都新宿区西新宿2丁目' },
    { id: 2, lat: 35.4437, lng: 139.6380, name: '横浜公園（スタジアム前）公衆トイレ', category: '公園', address: '神奈川県横浜市中区横浜公園' },
    { id: 3, lat: 35.6850, lng: 139.7100, name: 'ライフ 西新宿店（スーパー）', category: 'スーパー', address: '東京都新宿区西新宿6丁目' },
    { id: 4, lat: 35.6870, lng: 139.7120, name: 'ローソン 新宿西口店', category: 'コンビニ', address: '東京都新宿区西新宿2丁目' },
    { id: 5, lat: 35.6830, lng: 139.7080, name: 'ファミリーマート 西新宿一丁目店', category: 'コンビニ', address: '東京都新宿区西新宿1丁目' },
    { id: 6, lat: 35.8617, lng: 139.6455, name: 'さいたま市役所 本庁舎トイレ', category: '公共施設', address: '埼玉県さいたま市浦和区常盤6丁目' },
  ]);

  useEffect(() => {
    setIsClient(true);

    import('leaflet').then((L) => {
      // 1. コンビニ用アイコン（ブルー：スピーディーな安心感）
      const cIcon = L.divIcon({
        className: 'custom-convenience-marker',
        html: `
          <div style="
            background-color: #3182CE; 
            color: white; 
            width: 36px; 
            height: 36px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 16px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid #ffffff;
            font-weight: bold;
          ">🏪</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });
      setConvenienceIcon(cIcon);

      // 2. 公園用アイコン（ナチュラルグリーン：自然の安らぎ）
      const pIcon = L.divIcon({
        className: 'custom-park-marker',
        html: `
          <div style="
            background-color: #38A169; 
            color: white; 
            width: 36px; 
            height: 36px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 16px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid #ffffff;
            font-weight: bold;
          ">🌳</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });
      setParkIcon(pIcon);

      // 3. スーパー用アイコン（パープル・マゼンタ系：お買い物の楽しさと確実性）
      const sIcon = L.divIcon({
        className: 'custom-supermarket-marker',
        html: `
          <div style="
            background-color: #805AD5; 
            color: white; 
            width: 36px; 
            height: 36px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 16px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid #ffffff;
            font-weight: bold;
          ">🛒</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });
      setSupermarketIcon(sIcon);

      // 4. 公共施設用アイコン（ディープグリーン：公的機関の安心感）
      const pubIcon = L.divIcon({
        className: 'custom-public-marker',
        html: `
          <div style="
            background-color: #2F855A; 
            color: white; 
            width: 36px; 
            height: 36px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 16px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid #ffffff;
            font-weight: bold;
          ">🏛️</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });
      setPublicIcon(pubIcon);

      // 5. 現在地用アイコン
      const uIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="
            background-color: #D69E2E; 
            color: white; 
            width: 32px; 
            height: 32px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 15px; 
            box-shadow: 0 0 0 6px rgba(214,158,46,0.3);
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
        const currentCoord: [number, number] = [latitude, longitude];
        setCoords(currentCoord);
        setCurrentLocation(currentCoord);
        setMapKey((prev) => prev + 1);

        // 現在地周辺の全カテゴリ（コンビニ・公園・スーパー・公共施設）をバランスよくシミュレート生成
        const nearbyAllSpots = [
          { id: 101, lat: latitude + 0.0012, lng: longitude + 0.0012, name: 'ローソン 近隣店舗', category: 'コンビニ', address: '現在地から約150m' },
          { id: 102, lat: latitude - 0.0015, lng: longitude + 0.0018, name: '近隣の総合スーパー', category: 'スーパー', address: '現在地から約200m' },
          { id: 103, lat: latitude + 0.0020, lng: longitude - 0.0010, name: '地域街区 公園トイレ', category: '公園', address: '現在地周辺の公園内' },
          { id: 104, lat: latitude - 0.0022, lng: longitude - 0.0020, name: '区民センター 公共施設トイレ', category: '公共施設', address: '現在地周辺の施設内' },
        ];
        setToiletSpots(nearbyAllSpots);

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
      <p style={{ fontSize: '13px', color: '#666', margin: '0 0 20px 0' }}>偏愛toolシリーズ - コンビニ・公園・スーパー・公共施設 完全網羅版</p>

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
        {loading ? '📍 周辺の全施設を検索中...' : '📍 現在地から近くの施設を探す'}
      </button>

      {/* スポット一覧（カテゴリ別のバッジ付き） */}
      <div style={{ margin: '15px auto', maxWidth: '800px', textAlign: 'left', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '14px', color: '#2F855A', margin: '0 0 10px 0' }}>🗺️ 発見された聖域スポット ({toiletSpots.length}件)</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#444' }}>
          {toiletSpots.map((spot) => {
            const isConvenience = spot.category === 'コンビニ';
            const isPark = spot.category === '公園';
            const isSupermarket = spot.category === 'スーパー';

            const badgeBg = isConvenience ? '#EBF8FF' : isPark ? '#EDFDFD' : isSupermarket ? '#FAF5FF' : '#F0FFF4';
            const badgeColor = isConvenience ? '#2B6CB0' : isPark ? '#2C7A7B' : isSupermarket ? '#6B46C1' : '#2F855A';
            const badgeText = isConvenience ? '🏪 コンビニ' : isPark ? '🌳 公園' : isSupermarket ? '🛒 スーパー' : '🏛️ 公共施設';

            return (
              <li key={spot.id} style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ 
                    backgroundColor: badgeBg, 
                    color: badgeColor, 
                    border: `1px solid ${badgeColor}40`,
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    fontSize: '11px', 
                    marginRight: '6px', 
                    fontWeight: 'bold' 
                  }}>
                    {badgeText}
                  </span>
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
            );
          })}
        </ul>
      </div>

      {/* MapArea */}
      <div style={{ width: '100%', maxWidth: '800px', height: '480px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        {isClient && convenienceIcon && parkIcon && supermarketIcon && publicIcon && userIcon && (
          <MapContainer key={mapKey} center={coords} zoom={11} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {currentLocation && (
              <Marker position={currentLocation} icon={userIcon}>
                <Popup>
                  <strong>📍 あなたの現在地</strong><br />ここから出発！
                </Popup>
              </Marker>
            )}

            {toiletSpots.map((spot) => {
              let markerIcon = convenienceIcon;
              let badgeColor = '#2B6CB0';

              if (spot.category === '公園') {
                markerIcon = parkIcon;
                badgeColor = '#2C7A7B';
              } else if (spot.category === 'スーパー') {
                markerIcon = supermarketIcon;
                badgeColor = '#6B46C1';
              } else if (spot.category === '公共施設') {
                markerIcon = publicIcon;
                badgeColor = '#2F855A';
              }

              return (
                <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={markerIcon}>
                  <Popup>
                    <strong>{spot.name}</strong><br />
                    <span style={{ color: badgeColor, fontWeight: 'bold' }}>
                      [{spot.category}]
                    </span> {spot.address}<br /><br />
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
              );
            })}
          </MapContainer>
        )}
      </div>
    </main>
  );
}