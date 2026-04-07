import { Loader } from '@googlemaps/js-api-loader';
import { getApiKey } from './storage.js';

let loader = null;
let mapsPromise = null;

export async function loadMapsAPI() {
  const apiKey = getApiKey('googleMaps');
  if (!apiKey) throw new Error('NO_MAPS_KEY');

  if (!loader || loader.apiKey !== apiKey) {
    loader = new Loader({ apiKey, version: 'weekly' });
    mapsPromise = loader.load();
  }
  return mapsPromise;
}

// Day colours for map markers
const DAY_COLORS = [
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#22c55e', // green
  '#3b82f6', // blue
  '#f97316', // orange
];

export function getDayColor(day) {
  return DAY_COLORS[(day - 1) % DAY_COLORS.length];
}

export function createMarkerIcon(color, label) {
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: 10,
    labelOrigin: new window.google.maps.Point(0, 0),
  };
}

export function fitBoundsToPlaces(map, places) {
  if (!places.length) return;
  const bounds = new window.google.maps.LatLngBounds();
  places.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
  map.fitBounds(bounds, 60);
}
