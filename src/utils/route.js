function dist(a, b) {
  return Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2);
}

// Nearest-neighbour TSP heuristic starting from the place closest to the centroid
function nearestNeighbour(places, centroid) {
  if (places.length === 0) return [];
  const unvisited = [...places];

  // Start from the place nearest to the centroid
  let startIdx = 0;
  let startDist = Infinity;
  for (let i = 0; i < unvisited.length; i++) {
    const d = dist(unvisited[i], centroid);
    if (d < startDist) { startDist = d; startIdx = i; }
  }

  const ordered = [unvisited.splice(startIdx, 1)[0]];
  while (unvisited.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearIdx = 0;
    let nearDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const d = dist(last, unvisited[i]);
      if (d < nearDist) { nearDist = d; nearIdx = i; }
    }
    ordered.push(unvisited.splice(nearIdx, 1)[0]);
  }
  return ordered;
}

// Slot food into the route: one restaurant ~halfway through (lunch), one at the end (dinner)
function slotFood(attractions, restaurants) {
  if (restaurants.length === 0) return attractions;

  const ordered = [...attractions];
  const foods = [...restaurants];

  // Lunch: insert ~halfway
  if (foods.length > 0) {
    const lunchIdx = Math.floor(ordered.length / 2);
    // Pick the restaurant closest to the midpoint attraction (or first if empty)
    const mid = ordered[lunchIdx] || ordered[0] || { lat: 0, lng: 0 };
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < foods.length; i++) {
      const d = dist(foods[i], mid);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    ordered.splice(lunchIdx, 0, foods.splice(best, 1)[0]);
  }

  // Dinner: append at end
  if (foods.length > 0) {
    const last = ordered[ordered.length - 1] || { lat: 0, lng: 0 };
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < foods.length; i++) {
      const d = dist(foods[i], last);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    ordered.push(foods.splice(best, 1)[0]);
  }

  // Any remaining food (3+), append at end
  ordered.push(...foods);

  return ordered;
}

// Order all places for each day and return them with an `order` field
export function orderPlacesForDay(places, centroid) {
  const attractions = places.filter(p => p.category !== 'food');
  const restaurants = places.filter(p => p.category === 'food');

  const orderedAttractions = nearestNeighbour(attractions, centroid);
  const routed = slotFood(orderedAttractions, restaurants);

  return routed.map((p, i) => ({ ...p, order: i }));
}

// Apply ordering to all days
export function buildRoutes(places, centroids) {
  const numDays = centroids.length;
  const result = [];
  for (let d = 1; d <= numDays; d++) {
    const dayPlaces = places.filter(p => p.day === d);
    const ordered = orderPlacesForDay(dayPlaces, centroids[d - 1]);
    result.push(...ordered);
  }
  return result;
}
