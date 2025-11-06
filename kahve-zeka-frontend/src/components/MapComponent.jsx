// src/components/MapComponent.jsx
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet'; // leaflet'i import ediyoruz

// Leaflet'in varsayılan ikonlarıyla ilgili bir sorunu düzeltmek için
// Bu kod, ikonların düzgün yüklenmesini sağlar
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41], // İkonun haritadaki tam noktasını ayarlar
    popupAnchor: [1, -34] // Pop-up'ın açılacağı nokta
});

L.Marker.prototype.options.icon = DefaultIcon;

// Harita merkezi değiştiğinde haritayı yeniden ortalayan yardımcı bileşen
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function MapComponent({ businesses, center, radius })  {
  // 'businesses' bir 'BusinessDistance' objesi (business, distance_km)
  // O yüzden 'business.business' diyerek mekana ulaşıyoruz.

  return (
    <MapContainer 
      center={center} 
      zoom={14} // Yakınlık seviyesi
      style={{ height: '70vh', width: '100%', borderRadius: '8px' }}
    >
      <ChangeView center={center} zoom={14} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* --- YARIÇAP DAİRESİNİ ÇİZEN BÖLÜM --- */}
  <Circle 
    center={center} 
    // 'radius' prop'umuz 'km' cinsinden, ancak <Circle> bileşeni
    // yarıçapı 'metre' cinsinden bekler. O yüzden * 1000 yaparız.
    radius={radius * 1000} 
    pathOptions={{ 
      color: '#c7a17a',      // Dış çizgi rengi (kahve tonu)
      fillColor: '#c7a17a', // Dolgu rengi
      fillOpacity: 0.1     // Şeffaflık
    }} 
  />
  {/* --- DAİRE SONU --- */}
      
      {/* Kendi Konumumuzu Gösteren Mavi İşaretçi */}
      <Marker position={center} icon={new L.DivIcon({ className: 'user-location-marker', html: '<div class="pulse"></div>' })}>
        <Popup>Siz buradasınız</Popup>
      </Marker>

      {/* Yakındaki Mekanları Döngüye Al ve İşaretçi (Marker) Oluştur */}
      {businesses.map(b => (
        <Marker 
          key={b.business.id} 
          position={[b.business.latitude, b.business.longitude]} // <-- DOĞRUSU b.business.latitude
        >
          <Popup>
            <strong>{b.business.name}</strong><br /> {/* <-- DOĞRUSU b.business.name */}
            {b.business.address}<br /> {/* <-- DOĞRUSU b.business.address */}
            <p>Mesafe: {b.distance_km.toFixed(2)} km</p>
            <Link to={`/business/${b.business.id}`}>Detayları Gör</Link> {/* <-- DOĞRUSU b.business.id */}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapComponent;