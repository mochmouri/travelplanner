import { useState, useCallback } from 'react';
import { saveTrip } from '../utils/storage.js';
import { clusterPlaces, getDayCentroids } from '../utils/cluster.js';
import { buildRoutes } from '../utils/route.js';

const NON_ROUTED = ['food', 'mosque'];

function freshTrip(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    name: '',
    destination: '',
    numDays: 3,
    startTime: '09:00',
    endTime: '21:00',
    focus: 'balanced',
    places: [],
    accommodation: null,
    halalGuide: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Assign non-routed places (food, mosque) to the nearest day centroid
function assignToNearestDay(places, centroids) {
  return places.map(p => {
    let best = 1, bestDist = Infinity;
    centroids.forEach((c, i) => {
      const d = Math.sqrt((p.lat - c.lat) ** 2 + (p.lng - c.lng) ** 2);
      if (d < bestDist) { bestDist = d; best = i + 1; }
    });
    return { ...p, day: best, order: undefined };
  });
}

export default function useTrip() {
  const [trip, setTrip] = useState(null);

  const initTrip = useCallback((meta) => {
    const t = freshTrip(meta);
    setTrip(t);
    return t;
  }, []);

  const loadTrip = useCallback((existing) => {
    setTrip(existing);
  }, []);

  const updateMeta = useCallback((meta) => {
    setTrip(t => ({ ...t, ...meta }));
  }, []);

  const setPlaces = useCallback((places) => {
    setTrip(t => ({ ...t, places }));
  }, []);

  // Run clustering + routing and persist
  const arrangeAndSave = useCallback((places, numDays) => {
    const attractions = places.filter(p => !NON_ROUTED.includes(p.category));
    const nonRouted = places.filter(p => NON_ROUTED.includes(p.category));

    // Cluster attractions only (food/mosque don't skew centroids)
    const clustered = clusterPlaces(attractions, numDays);
    const centroids = getDayCentroids(clustered, numDays);

    // Assign non-routed places to nearest day by geography
    const clusteredNonRouted = assignToNearestDay(nonRouted, centroids);

    const allClustered = [...clustered, ...clusteredNonRouted];
    const routed = buildRoutes(allClustered, centroids, trip.startTime, trip.endTime);

    const updated = { ...trip, places: routed };
    setTrip(updated);
    saveTrip(updated);
    return { places: routed, centroids };
  }, [trip]);

  // Move a place to a different day (or to unscheduled: day 0), then re-route
  const movePlaceToDay = useCallback((placeId, newDay) => {
    setTrip(prev => {
      const places = prev.places.map(p =>
        p.id === placeId ? { ...p, day: newDay, order: undefined } : p
      );
      const attractions = places.filter(p => !NON_ROUTED.includes(p.category));
      const centroids = getDayCentroids(attractions, prev.numDays);
      const routed = buildRoutes(places, centroids, prev.startTime, prev.endTime);
      const updated = { ...prev, places: routed };
      saveTrip(updated);
      return updated;
    });
  }, []);

  // Add a food recommendation to the day's route (appends at end)
  const addFoodToRoute = useCallback((placeId) => {
    setTrip(prev => {
      const place = prev.places.find(p => p.id === placeId);
      if (!place) return prev;
      const dayRouted = prev.places.filter(
        p => p.day === place.day && p.order !== undefined
      );
      const maxOrder = dayRouted.reduce((m, p) => Math.max(m, p.order ?? 0), -1);
      const places = prev.places.map(p =>
        p.id === placeId ? { ...p, order: maxOrder + 1 } : p
      );
      const updated = { ...prev, places };
      saveTrip(updated);
      return updated;
    });
  }, []);

  // Move a place up or down within its day
  const reorderPlace = useCallback((placeId, direction) => {
    setTrip(prev => {
      const day = prev.places.find(p => p.id === placeId)?.day;
      if (!day) return prev;

      const dayPlaces = [...prev.places.filter(p => p.day === day && p.order !== undefined)]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const idx = dayPlaces.findIndex(p => p.id === placeId);
      const newIdx = idx + (direction === 'up' ? -1 : 1);
      if (newIdx < 0 || newIdx >= dayPlaces.length) return prev;

      const a = dayPlaces[idx];
      const b = dayPlaces[newIdx];
      const places = prev.places.map(p => {
        if (p.id === a.id) return { ...p, order: b.order ?? newIdx };
        if (p.id === b.id) return { ...p, order: a.order ?? idx };
        return p;
      });
      const updated = { ...prev, places };
      saveTrip(updated);
      return updated;
    });
  }, []);

  const setAccommodation = useCallback((accommodation) => {
    setTrip(prev => {
      const updated = { ...prev, accommodation };
      saveTrip(updated);
      return updated;
    });
  }, []);

  const setHalalGuide = useCallback((halalGuide) => {
    setTrip(prev => {
      const updated = { ...prev, halalGuide };
      saveTrip(updated);
      return updated;
    });
  }, []);

  const persist = useCallback(() => {
    if (trip) saveTrip(trip);
  }, [trip]);

  return {
    trip,
    initTrip,
    loadTrip,
    updateMeta,
    setPlaces,
    arrangeAndSave,
    movePlaceToDay,
    addFoodToRoute,
    reorderPlace,
    setAccommodation,
    setHalalGuide,
    persist,
  };
}
