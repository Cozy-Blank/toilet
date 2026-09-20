'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// オリジナルの「巡礼ピン（toilet.png）」を設定
const pilgrimIcon = new L.Icon({
  iconUrl: '/toilet.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -32],
});

// 日本国内に移動範囲を制限（南西〜北東）
const japanBounds = [
  [20.0, 122.0],
  [46.0, 154.0]
];

// 日本国内（Tokyo中心）からOverpass APIでトイレデータを取得する関数
function ToiletFetcher({ setToilets, setLoading }) {
  const map = useMap();

  useEffect(() => {
    const fetchToilets = async () => {
      setLoading(true);
      const bounds = map.getBounds();
      
      // 日本エリア（ISO3166-1=JP）かつ現在の表示範囲内にあるトイレを取得
      const query = `
        [out:json][timeout:25];
        area["ISO3166-1"="JP"]->.searchArea;
        (
          node["amenity"="toilets"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()})(area.searchArea);
        );
        out body 100;
      `;

      try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await response.json();
        setToilets(data.elements || []);
      } catch (error) {
        console.error('トイレデータの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchToilets();
    map.on('moveend', fetchToilets);
    return () => map.off('moveend', fetchToilets);
  }, [map, setToilets, setLoading]);

  return null;
}

export default function ToiletMap() {
  const [toilets, setToilets] = useState([]);
  const [loading, setLoading] = useState(false);

  // 初期位置：東京駅（中心地）
  const tokyoPosition = [35.6812, 139.7671];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          background: '#C23B22',
          color: '#FFF',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          巡礼地（トイレ）捜索中...
        </div>
      )}

      <MapContainer
        center={tokyoPosition}
        zoom={14}
        maxBounds={japanBounds}
        maxBoundsViscosity={1.0}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ToiletFetcher setToilets={setToilets} setLoading={setLoading} />

        {toilets.map((toilet) => (
          <Marker
            key={toilet.id}
            position={[toilet.lat, toilet.lon]}
            icon={pilgrimIcon}
          >
            <Popup>
              <strong>⛩️ 巡礼地（公衆トイレ）</strong><br />
              {toilet.tags?.name ? `名称: ${toilet.tags.name}` : '名称未設定のトイレ'}<br />
              {toilet.tags?.wheelchair === 'yes' && '♿ 車椅子対応あり'}<br />
              {toilet.tags?.fee === 'no' ? '🆓 無料' : ''}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}