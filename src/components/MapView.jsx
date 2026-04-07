import { useEffect, useRef, useState } from 'react';
import { loadMapsAPI, getDayColor, fitBoundsToPlaces } from '../utils/maps.js';
import { getApiKey } from '../utils/storage.js';

export default function MapView({ places, selectedDay }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const hasKey = !!getApiKey('googleMaps');

  useEffect(() => {
    if (!hasKey) { setLoading(false); return; }

    loadMapsAPI()
      .then(() => {
        if (!containerRef.current) return;
        const map = new window.google.maps.Map(containerRef.current, {
          zoom: 13,
          center: { lat: 0, lng: 0 },
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#0a0f1e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0f1e' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#334155' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          ],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        mapRef.current = map;
        setLoading(false);
      })
      .catch(err => {
        setError(err.message === 'NO_MAPS_KEY' ? 'No Google Maps API key.' : `Maps failed: ${err.message}`);
        setLoading(false);
      });
  }, [hasKey]);

  // Update markers whenever places or selectedDay changes
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const visiblePlaces = selectedDay
      ? places.filter(p => p.day === selectedDay)
      : places;

    visiblePlaces.forEach((place, idx) => {
      if (!place.lat || !place.lng) return;
      const color = getDayColor(place.day || 1);
      const label = String((place.order ?? idx) + 1);

      const marker = new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: mapRef.current,
        title: place.name,
        label: { text: label, color: '#fff', fontSize: '10px', fontWeight: 'bold' },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: place.category === 'food' ? '#f59e0b' : color,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
          scale: 12,
          labelOrigin: new window.google.maps.Point(0, 0),
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="color:#1e293b;font-family:system-ui;max-width:200px">
          <strong style="font-size:13px">${place.name}</strong>
          <p style="font-size:11px;color:#64748b;margin:4px 0 0">${place.description?.slice(0, 100) || ''}…</p>
        </div>`,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    if (visiblePlaces.length > 0) {
      fitBoundsToPlaces(mapRef.current, visiblePlaces.filter(p => p.lat && p.lng));
    }
  }, [places, selectedDay]);

  if (!hasKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-700/50">
        <div className="text-center p-6">
          <p className="text-slate-400 text-sm mb-1">Map not available</p>
          <p className="text-slate-600 text-xs">Add a Google Maps API key in Settings to see the route on a map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-700/50">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <p className="text-red-400 text-sm px-4 text-center">{error}</p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
