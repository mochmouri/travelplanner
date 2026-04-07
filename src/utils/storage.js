const TRIPS_KEY = 'tp_trips';
const SETTINGS_KEY = 'tp_settings';

export function loadTrips() {
  try {
    return JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveTrip(trip) {
  const trips = loadTrips();
  const idx = trips.findIndex(t => t.id === trip.id);
  const updated = { ...trip, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    trips[idx] = updated;
  } else {
    trips.unshift(updated);
  }
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  return updated;
}

export function deleteTrip(id) {
  const trips = loadTrips().filter(t => t.id !== id);
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getApiKey(key) {
  if (key === 'gemini') {
    return import.meta.env.VITE_GEMINI_API_KEY || loadSettings().gemini || '';
  }
  return '';
}
