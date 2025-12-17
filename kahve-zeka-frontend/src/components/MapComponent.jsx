// src/components/MapComponent.jsx
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function MapComponent({ businesses, center, radius }) {
  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '100%', width: '100%', borderRadius: 0 }}
    >
      <ChangeView center={center} zoom={14} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={center}
        radius={radius * 1000}
        pathOptions={{
          color: '#c7a17a',
          fillColor: '#c7a17a',
          fillOpacity: 0.1
        }}
      />

      <Marker position={center} icon={new L.DivIcon({ className: 'user-location-marker', html: '<div class="pulse"></div>' })}>
        <Popup>Siz buradasınız</Popup>
      </Marker>

      {businesses.map(b => (
        <Marker
          key={b.business.id}
          position={[b.business.latitude, b.business.longitude]}
          icon={new L.DivIcon({
            className: 'coffee-marker',
            html: '<div style="background-color: #4E342E; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; justify-content: center; align-items: center; color: white; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">☕</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
          })}
        >
          <Popup>
            <strong>{b.business.name}</strong><br />
            {b.business.address}<br />
            <p>Puan: {b.business.average_rating ? b.business.average_rating.toFixed(1) : '0.0'} / 5</p>
            <p>Mesafe: {b.distance_km.toFixed(2)} km</p>
            <Link to={`/business/${b.business.id}`}>Detayları Gör</Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapComponent;