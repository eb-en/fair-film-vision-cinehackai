import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface TheaterLocation {
  id: string;
  name: string;
  revenue: number;
  tickets: number;
  lat: number;
  lng: number;
  region?: string;
}

interface TheaterMapProps {
  theaters: TheaterLocation[];
}

const createCustomIcon = (revenue: number) => {
  const color = getMarkerColor(revenue);
  const size = Math.max(20, Math.min(40, (revenue / 50000) * 30)); // Scale based on revenue

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size > 30 ? '12px' : '10px'};
      ">
        ₹
      </div>
    `,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const getMarkerColor = (revenue: number): string => {
  if (revenue > 200000) return '#dc2626'; // Red for high revenue
  if (revenue > 100000) return '#ea580c'; // Orange for medium-high revenue
  if (revenue > 50000) return '#d97706'; // Amber for medium revenue
  if (revenue > 25000) return '#059669'; // Emerald for low-medium revenue
  return '#0891b2'; // Cyan for low revenue
};

const FitBounds: React.FC<{ theaters: TheaterLocation[] }> = ({ theaters }) => {
  const map = useMap();

  useEffect(() => {
    if (theaters.length > 0) {
      const bounds = L.latLngBounds(theaters.map(theater => [theater.lat, theater.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });

      // Ensure minimum zoom level
      setTimeout(() => {
        if (map.getZoom() > 12) {
          map.setZoom(12);
        }
      }, 100);
    }
  }, [map, theaters]);

  return null;
};

const TheaterMap: React.FC<TheaterMapProps> = ({ theaters }) => {
  if (theaters.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-2">No theater data available</p>
          <p className="text-xs text-muted-foreground">Theater locations will appear here when data is loaded</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[20.5937, 78.9629]} // Center of India
      zoom={5}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds theaters={theaters} />

      {theaters.map((theater) => (
        <Marker
          key={theater.id}
          position={[theater.lat, theater.lng]}
          icon={createCustomIcon(theater.revenue)}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="text-base font-bold text-gray-800 mb-2">{theater.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {theater.region && (
                  <div className="flex justify-between">
                    <span>Region:</span>
                    <span className="font-medium text-blue-600">{theater.region}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span className="font-bold text-green-600">₹{theater.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tickets:</span>
                  <span className="font-bold text-red-600">{theater.tickets.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default TheaterMap;