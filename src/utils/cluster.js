function dist(a, b) {
  return Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2);
}

function centroidOf(points) {
  if (points.length === 0) return null;
  return {
    lat: points.reduce((s, p) => s + p.lat, 0) / points.length,
    lng: points.reduce((s, p) => s + p.lng, 0) / points.length,
  };
}

// Spread initial centroids evenly across the bounding box to avoid bad starts
function initCentroids(points, k) {
  const lats = points.map(p => p.lat).sort((a, b) => a - b);
  const lngs = points.map(p => p.lng).sort((a, b) => a - b);
  const centroids = [];
  for (let i = 0; i < k; i++) {
    const t = k === 1 ? 0.5 : i / (k - 1);
    centroids.push({
      lat: lats[0] + t * (lats[lats.length - 1] - lats[0]),
      lng: lngs[0] + t * (lngs[lngs.length - 1] - lngs[0]),
    });
  }
  return centroids;
}

export function clusterPlaces(places, numDays) {
  if (places.length === 0) return places;
  if (numDays === 1) return places.map(p => ({ ...p, day: 1 }));

  const k = Math.min(numDays, places.length);
  let centroids = initCentroids(places, k);

  for (let iter = 0; iter < 30; iter++) {
    // Assign each place to nearest centroid
    const assigned = places.map(p => {
      let best = 0;
      let bestDist = Infinity;
      for (let j = 0; j < k; j++) {
        const d = dist(p, centroids[j]);
        if (d < bestDist) { bestDist = d; best = j; }
      }
      return { ...p, day: best + 1 };
    });

    // Recompute centroids
    const newCentroids = [];
    for (let j = 0; j < k; j++) {
      const group = assigned.filter(p => p.day === j + 1);
      newCentroids.push(group.length > 0 ? centroidOf(group) : centroids[j]);
    }

    // Check convergence
    const moved = newCentroids.some((c, j) => dist(c, centroids[j]) > 0.0001);
    centroids = newCentroids;
    if (!moved) break;
  }

  // Final assignment
  return places.map(p => {
    let best = 0;
    let bestDist = Infinity;
    for (let j = 0; j < k; j++) {
      const d = dist(p, centroids[j]);
      if (d < bestDist) { bestDist = d; best = j; }
    }
    return { ...p, day: best + 1 };
  });
}

export function getDayCentroids(places, numDays) {
  const result = [];
  for (let d = 1; d <= numDays; d++) {
    const group = places.filter(p => p.day === d);
    result.push(group.length > 0 ? centroidOf(group) : { lat: 0, lng: 0 });
  }
  return result;
}
