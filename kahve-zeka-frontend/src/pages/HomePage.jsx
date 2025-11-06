// src/pages/HomePage.jsx
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import { Link } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:8000';

function HomePage() {
  const [businesses, setBusinesses] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- YENİ EKLENEN STATE ---
  // Kullanıcının seçtiği yarıçapı tutar. Varsayılan olarak 5km.
  const [radius, setRadius] = useState(5); 

  // 1. ADIM: Konum alma 'useEffect'i
  // Bu kanca, sayfa yüklendiğinde SADECE BİR KEZ çalışır.
  useEffect(() => {
    setLoading(true); // Yüklemeyi başlat
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          // Konum alındı, ancak veri çekme işini burada YAPMIYORUZ.
          // Bu, bir sonraki useEffect'i tetikleyecek.
        },
        (err) => {
          console.error('Konum alınamadı:', err);
          setError('Konum izni alınamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.');
          setLoading(false);
        }
      );
    } else {
      setError('Tarayıcınız konum servisini desteklemiyor.');
      setLoading(false);
    }
  }, []); // Boş dizi '[]', 1 kez çalışmasını sağlar.

  // 2. ADIM: Veri çekme 'useEffect'i
  // BU KANCA, 'userLocation' VEYA 'radius' DEĞİŞTİĞİNDE ÇALIŞIR.
  useEffect(() => {
    // Eğer konum bilgisi henüz gelmediyse, bu kancadan çık.
    if (!userLocation) {
      return;
    }
    
    // Konum var, şimdi veri çek
    setLoading(true); // Yüklemeyi başlat (radius değiştiğinde de)
    setError(null);   // Eski hataları temizle
    
    axios.get(`${API_URL}/businesses/nearby/`, {
      params: {
        lat: userLocation[0],
        lon: userLocation[1],
        radius_km: radius // <-- HARD-CODED '5' YERİNE 'radius' STATE'İNİ KULLAN
      }
    })
    .then(response => {
      setBusinesses(response.data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Yakındaki mekanları çekerken hata:', err);
      setError('Yakındaki mekanlar yüklenemedi.');
      setLoading(false);
    });
    
  }, [userLocation, radius]); // <-- BAĞIMLILIKLAR: userLocation veya radius değişirse çalış!

  // 3. ADIM: Filtreleme 'useMemo'su (Bu aynı kaldı)
  const filteredBusinesses = useMemo(() => {
    if (!searchTerm) {
      return businesses;
    }
    return businesses.filter(b => 
      b.business.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [businesses, searchTerm]);
  
  // 4. ADIM: JSX (Arayüz)
  if (!userLocation && loading) return <p>Konumunuz alınıyor...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="home-page">
      <h2>Yakındaki Kahve Noktaları</h2>

      {/* Arama ve Yarıçap Filtreleri */}
      <div className="filters" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Yakındaki mekanlarda ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 3, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        {/* --- YENİ EKLENEN AÇILIR MENÜ --- */}
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))} // Seçilen değeri state'e at
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        >
          <option value={1}>1 km</option>
          <option value={3}>3 km</option>
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={20}>20 km</option>
        </select>
        {/* --- YENİ BÖLÜM SONU --- */}
      </div>

      {/* Harita ve Yükleme Durumu */}
      {userLocation && (
        <MapComponent 
          businesses={filteredBusinesses}
          center={userLocation} 
          radius={radius}
        />
      )}
      
      {/* Yüklenme göstergesi (sadece veri çekilirken) */}
      {loading && <p>Yakındaki mekanlar yükleniyor...</p>}
      
      {/* Liste */}
      <div className="nearby-list">
        <h3>Yakındakiler (Liste) - {radius}km</h3>
        {filteredBusinesses.length === 0 && !loading ? (
          <p>
            {searchTerm 
              ? `"${searchTerm}" ile eşleşen mekan bulunamadı.` 
              : `Seçili yarıçapta (${radius}km) kayıtlı mekan bulunamadı.`
            }
          </p>
        ) : (
          <ul>
            {filteredBusinesses.map(b => (
              <Link to={`/business/${b.business.id}`} key={b.business.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <li className="list-item-hover">
                  {b.business.name} ({b.distance_km.toFixed(2)} km)
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default HomePage;