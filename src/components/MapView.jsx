import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { TILE_URL, TILE_ATTRIBUTION, getDayColor } from '../utils/maps.js';

function FitBounds({ places }) {
  const map = useMap();

  useEffect(() => {
    const valid = places.filter(p => p.lat && p.lng);
    if (valid.length === 0) return;
    const bounds = valid.map(p => [p.lat, p.lng]);
    map.fitBounds(bounds, { padding: [32, 32], animate: true });
  }, [places, map]);

  return null;
}

function PlaceMarker({ place, index }) {
  const color = getDayColor(place.day || 1);
  const isFood = place.category === 'food';

  return (
    <CircleMarker
      center={[place.lat, place.lng]}
      radius={isFood ? 7 : 9}
      pathOptions={{
        color: color,
        fillColor: isFood ? '#0a0a0a' : color,
        fillOpacity: isFood ? 1 : 1,
        weight: isFood ? 2 : 0,
        opacity: 1,
      }}
    >
      <Popup>
        <div style={{ minWidth: 140 }}>
          <p style={{ fontWeight: 600, color: '#fff', marginBottom: 3, fontSize: 12 }}>{place.name}</p>
          <p style={{ color: '#888', fontSize: 11, marginBottom: 2 }}>
            {place.category === 'food' ? `${place.cuisine || 'Restaurant'}` : place.category}
          </p>
          {place.durationMinutes && (
            <p style={{ color: '#555', fontSize: 10 }}>{place.durationMinutes}m</p>
          )}
        </div>
      </Popup>
    </CircleMarker>
  );
}

export default function MapView({ places, selectedDay }) {
  const visiblePlaces = selectedDay
    ? places.filter(p => p.day === selectedDay && p.lat && p.lng)
    : places.filter(p => p.lat && p.lng);

  const center = visiblePlaces.length > 0
    ? [
        visiblePlaces.reduce((s, p) => s + p.lat, 0) / visiblePlaces.length,
        visiblePlaces.reduce((s, p) => s + p.lng, 0) / visiblePlaces.length,
      ]
    : [51.505, -0.09];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <FitBounds places={visiblePlaces} />
      {visiblePlaces.map((place, i) => (
        <PlaceMarker key={place.id} place={place} index={i} />
      ))}
    </MapContainer>
  );
}
