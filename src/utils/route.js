// Haversine distance in km
export function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Walking minutes from km (5 km/h)
export function walkMins(km) {
  return Math.round(km * 12);
}

function euclDist(a, b) {
  return Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2);
}

// Nearest-neighbour TSP heuristic starting from the place closest to the centroid
function nearestNeighbour(places, centroid) {
  if (places.length === 0) return [];
  const unvisited = [...places];

  let startIdx = 0, startDist = Infinity;
  for (let i = 0; i < unvisited.length; i++) {
    const d = euclDist(unvisited[i], centroid);
    if (d < startDist) { startDist = d; startIdx = i; }
  }

  const ordered = [unvisited.splice(startIdx, 1)[0]];
  while (unvisited.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearIdx = 0, nearDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const d = euclDist(last, unvisited[i]);
      if (d < nearDist) { nearDist = d; nearIdx = i; }
    }
    ordered.push(unvisited.splice(nearIdx, 1)[0]);
  }
  return ordered;
}

const TRAVEL_BUFFER = 20; // minutes between stops (fallback)

// Fit as many places as possible within the day's available minutes.
// Returns { routed, unscheduled }.
function fitToDay(ordered, dayMinutes) {
  if (!dayMinutes || dayMinutes <= 0) return { routed: ordered, unscheduled: [] };
  const routed = [];
  const unscheduled = [];
  let used = 0;
  for (const p of ordered) {
    const travel = routed.length > 0 ? TRAVEL_BUFFER : 0;
    const needed = (p.durationMinutes || 60) + travel;
    if (used + needed <= dayMinutes) {
      used += needed;
      routed.push(p);
    } else {
      unscheduled.push(p);
    }
  }
  return { routed, unscheduled };
}

function parseHHMM(hhmm) {
  const [h, m] = (hhmm || '').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Build Google Maps directions URL using place names (walking mode).
// Append city so each name resolves correctly on Google Maps.
export function buildGoogleMapsUrl(places, destination = '') {
  if (!places || places.length === 0) return null;
  const city = destination ? `, ${destination}` : '';
  const q = name => encodeURIComponent(`${name}${city}`);

  if (places.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${q(places[0].name)}`;
  }
  const origin = q(places[0].name);
  const dest   = q(places[places.length - 1].name);
  const mids   = places.slice(1, -1);
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=walking`;
  if (mids.length > 0) {
    url += `&waypoints=${mids.map(p => q(p.name)).join('|')}`;
  }
  return url;
}

// Categories that are shown as day recommendations but never put in the routed sequence.
const NON_ROUTED = ['food', 'mosque'];

// Apply routing to all days; return all places.
// - Attractions get day + order; overflow attractions get day: 0, order: undefined.
// - Food and mosque places get their clustered day but no order (shown as recommendations).
export function buildRoutes(places, centroids, startTime, endTime) {
  const numDays = centroids.length;
  const dayMinutes =
    startTime && endTime
      ? parseHHMM(endTime) - parseHHMM(startTime)
      : null;

  const routed = [];
  const unscheduled = [];

  for (let d = 1; d <= numDays; d++) {
    const dayAttractions = places.filter(p => p.day === d && !NON_ROUTED.includes(p.category));
    const ordered = nearestNeighbour(dayAttractions, centroids[d - 1]);
    const { routed: fit, unscheduled: overflow } = fitToDay(ordered, dayMinutes);
    routed.push(...fit.map((p, i) => ({ ...p, order: i })));
    unscheduled.push(...overflow.map(p => ({ ...p, day: 0, order: undefined })));
  }

  const nonRoutedPlaces = places.filter(p => NON_ROUTED.includes(p.category));

  return [...routed, ...unscheduled, ...nonRoutedPlaces];
}
